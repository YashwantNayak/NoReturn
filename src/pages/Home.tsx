import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PlayCircle, Trophy, Flame } from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div style={{ padding: 'clamp(16px, 5vw, 32px)', maxWidth: '1200px', margin: '0 auto', color: '#FFFFFF', paddingBottom: 'clamp(32px, 5vw, 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 'bold', margin: '0 0 8px 0' }}>Hi {user.displayName} 👋</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>Ready for today's IPL action?</p>
      </div>

      {/* Today's Live Match */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0, 255, 178, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #00FFB2',
          marginBottom: '40px',
          boxShadow: '0 0 30px rgba(0, 255, 178, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Flame size={20} color="#FF7A00" />
          <span style={{ fontSize: '12px', color: '#FF7A00', fontWeight: 'bold', textTransform: 'uppercase' }}>LIVE NOW</span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#00FFB2', margin: '0 0 4px 0' }}>MI vs CSK</p>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>Indian Premier League 2026</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 4px 0' }}>MI Score</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>145/8</p>
          </div>
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 4px 0' }}>Overs</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>18.3</p>
          </div>
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 4px 0' }}>Online</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#00FFB2', margin: 0 }}>2.3K</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/global-room')}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#00FFB2',
            color: '#000000',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <PlayCircle size={20} /> Join Live Betting
        </button>
      </motion.div>

      {/* Quick Stats */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>Your Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Coins</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#FF7A00', margin: 0 }}>🪙 {user?.coins.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Win Rate</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#00FFB2', margin: 0 }}>{user?.winRate || 0}%</p>
          </div>
          <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Streak</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>{user?.streak || 0} 🔥</p>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="#FFD700" /> Top Players Today
          </h2>
        </div>
        <div style={{ backgroundColor: '#111111', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {[1, 2, 3].map((rank) => (
            <div key={rank} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: rank < 3 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
              gap: '12px'
            }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32', width: '20px' }}>
                {rank}
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#333' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>Player {rank}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', margin: '2px 0 0 0' }}>Win Rate: {68 - rank * 5}%</p>
              </div>
              <p style={{ fontWeight: 'bold', color: '#00FFB2', fontSize: '14px', margin: 0 }}>🪙 {(100000 / rank).toLocaleString()}</p>
            </div>
          ))}
          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: 'none',
              color: '#00FFB2',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            View Full Leaderboard
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
