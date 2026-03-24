import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { Home, Trophy, Users, User, LogOut, Zap, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#000000',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        textDecoration: 'none',
        color: '#00FFB2',
        fontSize: 'clamp(18px, 5vw, 24px)',
        fontWeight: 'bold',
        letterSpacing: '1px',
      }}>
        <Zap size={24} fill="#00FFB2" />
        <span style={{ display: 'none' }} className="navbar-text">RoomBlast</span>
      </Link>

      {user && (
        <>
          {/* Desktop Menu */}
          <div style={{ display: 'none' }} className="desktop-menu">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link to="/" style={navItemStyle}><Home size={18} /> Home</Link>
              <Link to="/rooms" style={navItemStyle}><Users size={18} /> Rooms</Link>
              <Link to="/leaderboard" style={navItemStyle}><Trophy size={18} /> Leaderboard</Link>
              <Link to="/profile" style={navItemStyle}><User size={18} /> Profile</Link>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginLeft: '16px',
                padding: '4px 12px',
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                border: '1px solid #FF7A00',
                borderRadius: '20px',
                color: '#FF7A00',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                🪙 {user.coins.toLocaleString()}
              </div>

              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00FFB2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#1a1a1a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px 16px',
              zIndex: 999,
            }}>
              <Link to="/" style={{...navItemStyle, padding: '12px'}} onClick={() => setMobileMenuOpen(false)}><Home size={18} /> Home</Link>
              {/* <Link to="/rooms" style={{...navItemStyle, padding: '12px'}} onClick={() => setMobileMenuOpen(false)}><Users size={18} /> Rooms</Link> */}
              <Link to="/leaderboard" style={{...navItemStyle, padding: '12px'}} onClick={() => setMobileMenuOpen(false)}><Trophy size={18} /> Leaderboard</Link>
              <Link to="/profile" style={{...navItemStyle, padding: '12px'}} onClick={() => setMobileMenuOpen(false)}><User size={18} /> Profile</Link>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                border: '1px solid #FF7A00',
                borderRadius: '8px',
                color: '#FF7A00',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                🪙 {user.coins.toLocaleString()}
              </div>

              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  padding: '12px',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .navbar-text { display: inline !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
