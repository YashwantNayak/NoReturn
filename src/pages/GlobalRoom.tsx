import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, Users, Zap, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PreMatchPhase from './PreMatchPhase';
import NextOverPhase from './NextOverPhase';
import InningsEndPhase from './InningsEndPhase';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  avatar: string;
}

const GlobalRoom: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'betting' | 'chat'>('betting');
  const [currentPhase, setCurrentPhase] = useState<'pre-match' | 'next-over' | 'innings-end'>('pre-match');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Player1', message: 'Great shot! 🔥', timestamp: new Date(), avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1' },
    { id: '2', user: 'Player2', message: 'CSK will win today!', timestamp: new Date(), avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      user: user.displayName,
      message: newMessage,
      timestamp: new Date(),
      avatar: user.photoURL,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleBetAdded = (betData: any) => {
    console.log('Bet added:', betData);
    // TODO: Send to Firebase
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000000', color: '#FFFFFF', flexDirection: 'column' }}>
      {/* Match Header - Different styles for Chat vs Betting */}
      {activeTab === 'betting' ? (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#111111', 
          borderBottom: '2px solid #00FFB2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#00FFB2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}
          >
            <ArrowLeft size={20} /> Back
          </button>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: '12px', color: 'rgba(0, 255, 178, 0.6)', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Today's Match</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#00FFB2' }}>MI vs CSK</p>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>MI: 145/8 (18.3 overs)</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(0, 255, 178, 0.8)' }}>
              <Users size={16} />
              <span>2,342</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', margin: '4px 0 0 0' }}>Online</p>
          </div>
        </div>
      ) : (
        // Chat Tab Score Card Header
        <div style={{ 
          padding: '12px 16px',
          backgroundColor: '#111111',
          borderBottom: '1px solid rgba(0, 255, 178, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button 
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#00FFB2', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', padding: '4px 8px' }}
          >
            <ArrowLeft size={16} />
          </button>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0', color: '#00FFB2' }}>MI 145/8 vs CSK</p>
            <p style={{ fontSize: '11px', color: 'rgba(0, 255, 178, 0.6)', margin: '2px 0 0 0' }}>18.3 Overs</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(0, 255, 178, 0.8)' }}>
            <Users size={14} />
            <span>2.3K</span>
          </div>
        </div>
      )}

      {/* Tab Navigation - Only show on Betting tab */}
      {activeTab === 'betting' && (
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#0a0a0a', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0 16px'
        }}>
          <button
            onClick={() => setActiveTab('betting')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'betting' ? '#00FFB2' : 'rgba(255, 255, 255, 0.4)',
              borderBottom: activeTab === 'betting' ? '2px solid #00FFB2' : 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Zap size={16} /> Betting
          </button>
          <button
            onClick={() => navigate('/chat')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'chat' ? '#00FFB2' : 'rgba(255, 255, 255, 0.4)',
              borderBottom: activeTab === 'chat' ? '2px solid #00FFB2' : 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            💬 Chat
          </button>
        </div>
      )}

      {/* Chat Tab Buttons - Compact toggle */}
      {activeTab === 'chat' && (
        <div style={{ 
          padding: '8px 16px',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('betting')}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px',
              borderRadius: '6px'
            }}
          >
            <Zap size={14} style={{ marginRight: '4px', display: 'inline' }} /> Betting
          </button>
          <button
            onClick={() => navigate('/chat')}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #00FFB2',
              backgroundColor: 'rgba(0, 255, 178, 0.1)',
              color: '#00FFB2',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px',
              borderRadius: '6px'
            }}
          >
            💬 Chat
          </button>
        </div>
      )}

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: activeTab === 'chat' ? '16px 16px 80px 16px' : '16px', paddingBottom: activeTab === 'chat' ? 'clamp(80px, 15vh, 100px)' : '16px' }}>
        {activeTab === 'betting' ? (
          <div>
            {/* Phase Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPhase('pre-match')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: currentPhase === 'pre-match' ? '2px solid #FF6F00' : '1px solid #2A3F55',
                  backgroundColor: currentPhase === 'pre-match' ? '#FF6F00' : '#112240',
                  color: currentPhase === 'pre-match' ? '#FFFFFF' : '#90CAF9',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Pre-Match
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPhase('next-over')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: currentPhase === 'next-over' ? '2px solid #FF6F00' : '1px solid #2A3F55',
                  backgroundColor: currentPhase === 'next-over' ? '#FF6F00' : '#112240',
                  color: currentPhase === 'next-over' ? '#FFFFFF' : '#90CAF9',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Next Over
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPhase('innings-end')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: currentPhase === 'innings-end' ? '2px solid #FF6F00' : '1px solid #2A3F55',
                  backgroundColor: currentPhase === 'innings-end' ? '#FF6F00' : '#112240',
                  color: currentPhase === 'innings-end' ? '#FFFFFF' : '#90CAF9',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Innings End
              </motion.button>
            </div>

            {/* Phase Components */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              {currentPhase === 'pre-match' && (
                <PreMatchPhase 
                  matchName="MI vs CSK" 
                  onBetAdded={handleBetAdded}
                />
              )}
              {currentPhase === 'next-over' && (
                <NextOverPhase 
                  matchName="MI vs CSK"
                  score="MI 145/8"
                  currentOver={18}
                  timeRemaining={120}
                  currentOdds={{
                    runs: { '0-5': 2.5, '6-9': 2.0, '10-13': 3.5, '14+': 5.0 },
                    wicket: { 'Yes': 2.2, 'No': 1.9 }
                  }}
                  onBetAdded={handleBetAdded}
                />
              )}
              {currentPhase === 'innings-end' && (
                <InningsEndPhase 
                  matchName="MI vs CSK"
                  inningsResult="MI — 182/4 (20 ov)"
                  targetScore={183}
                  onBetAdded={handleBetAdded}
                />
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <img 
                  src={msg.avatar} 
                  alt="avatar"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#00FFB2', margin: '0 0 4px 0' }}>{msg.user}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', margin: 0, wordBreak: 'break-word' }}>{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Chat Only */}
      {activeTab === 'chat' && (
        <div style={{ 
          padding: '12px 16px',
          paddingBottom: '16px',
          backgroundColor: '#111111', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 255, 178, 0.2)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: '10px 16px',
              backgroundColor: '#00FFB2',
              border: 'none',
              borderRadius: '8px',
              color: '#000000',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalRoom;
