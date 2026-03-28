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
  const signupInProgress = React.useRef(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Reset form when toggling between login/signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setEmail('');
    setPassword('');
    setUsername('');
    setLoading(false);
    loginInProgress.current = false;
    signupInProgress.current = false;
  };

  const handleGoogleLogin = async () => {
    if (loading || loginInProgress.current) {
      return;
    }
    
    loginInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      loginInProgress.current = false;
      setLoading(false);
      
      let errorMsg = 'Google login failed';
      if (err.message?.includes('popup')) {
        errorMsg = 'Please allow popups for this site';
      } else if (!navigator.onLine) {
        errorMsg = 'Please check your internet connection';
      }
      setError(errorMsg);
    }
  };

  const handleEmailSignup = async () => {
    // Prevent concurrent requests
    if (loading || signupInProgress.current) {
      return;
    }

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    signupInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // Success - prompt email verification
      setIsLogin(true);
      setError('Account created! Please verify your email and log in.');
      setEmail('');
      setPassword('');
      setUsername('');
      setLoading(false);
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Show actual error from Supabase
      const errorMsg = err.message || 'Signup failed. Please try again.';
      setError(errorMsg);
      setLoading(false);
    } finally {
      signupInProgress.current = false;
    }
  };

  const handleEmailLogin = async () => {
    // Prevent concurrent requests
    if (loading || loginInProgress.current) {
      return;
    }

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    loginInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setLoading(false);
      // AppContext onAuthStateChange will handle navigation automatically
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      setLoading(false);
    } finally {
      loginInProgress.current = false;
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
          <h1 style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 'bold' }}>NoReturn11</h1>
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
            onClick={toggleMode}
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
