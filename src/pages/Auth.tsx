import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Zap, Mail, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAppContext();
  const loginInProgress = React.useRef(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    if (loading || loginInProgress.current) {
      console.warn('Login already in progress, ignoring request');
      return;
    }
    
    loginInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('Initiating Google login...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
      // On success, Supabase will redirect and auth state listener will handle it
    } catch (err: any) {
      console.error('Login failed with error:', err);
      loginInProgress.current = false;
      setLoading(false);
      
      if (err.message?.includes('popup')) {
        setError('Login popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.message?.includes('network') || !navigator.onLine) {
        setError('Network error: Please check your internet connection.');
      } else {
        setError(err.message || 'Failed to login with Google. Please try again.');
      }
    }
  };

  const handleEmailSignup = async () => {
    // Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Sign up with Supabase Auth (with email verification)
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`, // Redirect after email verification
          data: {
            username: username,
          }
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!user) {
        throw new Error('User creation failed');
      }

      // Step 2: Create profile in "profiles" table using upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: username,
          email: user.email,
          photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          coins: 5000,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Success! Show message and clear form
      setError(null);
      setEmail('');
      setPassword('');
      setUsername('');
      setLoading(false);
      alert('✅ Account created!\n\n📧 Check your email for the verification link.\n\nClick the link to confirm your account, then login!');
      setIsLogin(true); // Switch to login tab
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Success - onAuthStateChange will handle navigation
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('Email not confirmed')) {
        setError('❌ Email not verified yet.\n\nCheck your email inbox for the verification link and click it.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('❌ Invalid email or password');
      } else {
        setError(err.message || 'Failed to login. Please try again.');
      }
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    outline: 'none',
    marginBottom: '16px',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#00FFB2',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 15px rgba(0, 255, 178, 0.3)',
    transition: 'transform 0.2s ease',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
      padding: '20px',
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#111111',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <Zap size={48} color="#00FFB2" fill="#00FFB2" style={{ marginBottom: '16px' }} />
          <h1 style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 'bold' }}>RoomBlast</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>
            {isLogin ? 'Welcome back, predict and win!' : 'Join the ultimate prediction game!'}
          </p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(255, 68, 68, 0.1)', 
            border: '1px solid #FF4444', 
            color: '#FF4444', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            fontSize: '14px',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: error.includes('technical error') ? '12px' : '0' }}>
              {error}
            </div>
            {error.includes('technical error') && (
              <button 
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#FF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Refresh Page
              </button>
            )}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? '#EEEEEE' : '#FFFFFF',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
            boxShadow: 'none',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span style={{ fontSize: '14px' }}>Connecting...</span>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
              Continue with Google
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {!isLogin && (
          <input 
            type="text" 
            placeholder="Username" 
            style={inputStyle} 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input 
          type="email" 
          placeholder="Email Address" 
          style={inputStyle} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={inputStyle} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          style={buttonStyle} 
          onClick={isLogin ? handleEmailLogin : handleEmailSignup}
          disabled={loading}
        >
          {loading ? 'Loading...' : (isLogin ? 'Login with Email' : 'Create Account')}
        </button>

        <p style={{ marginTop: '24px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#00FFB2', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
