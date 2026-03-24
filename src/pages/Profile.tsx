import React from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Trophy, Zap, TrendingUp, Clock, Settings, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: '#111111',
    borderRadius: '16px',
    padding: '16px 12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    flex: 1,
    minWidth: '100px'
  };

  return (
    <div style={{ padding: '16px 16px 100px 16px', backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Profile Card */}
      <div style={{ 
        backgroundColor: '#111111', 
        borderRadius: '20px', 
        padding: '32px 20px', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        marginBottom: '24px',
        position: 'relative'
      }}>
        {/* Settings & Logout Buttons */}
        <div style={{ 
          position: 'absolute', 
          top: '16px', 
          right: '16px', 
          display: 'flex', 
          gap: '8px' 
        }}>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer', padding: '4px' }}>
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#FF4444', cursor: 'pointer', padding: '4px' }}>
            <LogOut size={20} />
          </button>
        </div>

        {/* Avatar */}
        <img 
          src={user.photoURL} 
          width="100" 
          height="100" 
          style={{ 
            borderRadius: '50%', 
            border: '3px solid #00FFB2', 
            marginBottom: '14px',
            boxShadow: '0 0 20px rgba(0, 255, 178, 0.2)',
            objectFit: 'cover'
          }} 
          alt={user.displayName} 
        />

        {/* Name & Email */}
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '2px', margin: '0 0 2px 0' }}>{user.displayName}</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '14px', fontSize: '12px', margin: '0 0 14px 0' }}>{user.email}</p>
        
        {/* Coins Badge */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 18px', 
          backgroundColor: 'rgba(0, 255, 178, 0.1)', 
          border: '2px solid #00FFB2', 
          borderRadius: '24px', 
          color: '#00FFB2', 
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          🪙 {user.coins.toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={statCardStyle}>
          <Trophy size={26} color="#FFD700" style={{ marginBottom: '6px' }} />
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0' }}>{user.winRate || 0}%</p>
          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', margin: 0 }}>Win Rate</p>
        </div>
        <div style={statCardStyle}>
          <Zap size={26} color="#FF7A00" style={{ marginBottom: '6px' }} />
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0' }}>{user.streak || 0}</p>
          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', margin: 0 }}>Current Streak</p>
        </div>
      </div>

      {/* Total Wins Card - Full Width */}
      <div style={{ ...statCardStyle, marginBottom: '24px' }}>
        <TrendingUp size={26} color="#00FFB2" style={{ marginBottom: '6px' }} />
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0' }}>12</p>
        <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', margin: 0 }}>Total Wins</p>
      </div>

      {/* Recent Bet History */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
          <Clock size={16} color="#00FFB2" /> Recent Bets
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ 
              padding: '12px 14px', 
              backgroundColor: '#111111', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 2px 0' }}>Next Over: 10+ Runs</p>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>MI vs CSK • 21 Mar</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 'bold', fontSize: '13px', color: i === 1 ? '#00FFB2' : i === 2 ? '#FF4444' : 'rgba(255, 255, 255, 0.4)', margin: '0 0 2px 0' }}>
                  {i === 1 ? '+ 1,000' : i === 2 ? '- 500' : 'Pending'}
                </p>
                <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', margin: 0 }}>
                  {i === 1 ? 'Won' : i === 2 ? 'Lost' : 'Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;
