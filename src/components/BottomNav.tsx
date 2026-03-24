import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Trophy, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BottomNav: React.FC = () => {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user || location.pathname === '/auth') return null;

  const isActive = (path: string) => location.pathname === path;

  const navItemStyle = (path: string): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    padding: '8px',
    textDecoration: 'none',
    color: isActive(path) ? '#00FFB2' : 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
    fontWeight: isActive(path) ? 'bold' : '500',
    transition: 'all 0.2s ease',
    borderTop: isActive(path) ? '2px solid #00FFB2' : 'none',
  });

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingTop: '8px',
      }}
      className="bottom-nav"
    >
      <Link to="/" style={navItemStyle('/')}>
        <Home size={24} />
        <span>Home</span>
      </Link>

      <Link to="/global-room" style={navItemStyle('/global-room')}>
        <Zap size={24} />
        <span>Betting</span>
      </Link>

      <Link to="/leaderboard" style={navItemStyle('/leaderboard')}>
        <Trophy size={24} />
        <span>Leaderboard</span>
      </Link>

      <Link to="/profile" style={navItemStyle('/profile')}>
        <User size={24} />
        <span>Profile</span>
      </Link>

      <style>{`
        @media (max-width: 768px) {
          .bottom-nav {
            display: flex !important;
          }
          
          body {
            padding-bottom: 100px;
          }
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
