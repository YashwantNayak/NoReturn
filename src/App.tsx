import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Auth from './pages/Auth';
import GlobalRoom from './pages/GlobalRoom';
import FullPageChat from './pages/FullPageChat';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

const AppContent: React.FC = () => {
  const { user, loading, isAuthReady } = useAppContext();
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Hide header and nav bar for full-page chat
  const isFullPageChat = location.pathname === '/chat';

  // LOADING SCREEN — jab tak auth initialize nahi ho jaata
  if (loading || !isAuthReady) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#00FFB2'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid rgba(0, 255, 178, 0.1)', 
            borderTopColor: '#00FFB2', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontWeight: 'bold', letterSpacing: '1px' }}>LOADING NORETURN11...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // AUTH SCREEN — sirf jab auth ready ho aur user nahi ho
  if (!user) {
    return <Auth />;
  }

  // MAIN APP — user authenticated hai
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF', paddingBottom: 'max(0px, 100px)' }}>
      {!isFullPageChat && <Navbar />}
      <Routes>
        <Route path="/auth" element={<Navigate to="/" />} />
        <Route path="/" element={<Home />} />
        <Route path="/global-room" element={<GlobalRoom />} />
        <Route path="/chat/:roomId" element={<FullPageChat />} />
        <Route path="/chat" element={<FullPageChat />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!isFullPageChat && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}
