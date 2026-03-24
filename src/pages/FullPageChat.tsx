import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send, ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  avatar: string;
}

const FullPageChat: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      padding: 0,
      margin: 0,
      zIndex: 9999,
    }}>
      {/* Chat Header - Minimal */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#111111',
        borderBottom: '1px solid rgba(0, 255, 178, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={() => navigate('/global-room')}
          style={{
            background: 'none',
            border: 'none',
            color: '#00FFB2',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0', color: '#00FFB2' }}>MI 145/8 vs CSK</p>
          <p style={{ fontSize: '11px', color: 'rgba(0, 255, 178, 0.6)', margin: '2px 0 0 0' }}>18.3 Overs</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(0, 255, 178, 0.8)' }}>
          <Users size={16} />
          <span>2.3K</span>
        </div>
      </div>

      {/* Messages Container - Full Height Scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.user === user?.displayName ? 'row-reverse' : 'row',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <img
              src={msg.avatar}
              width="36"
              height="36"
              style={{ borderRadius: '50%', flexShrink: 0 }}
              alt={msg.user}
            />
            <div style={{ maxWidth: '75%' }}>
              {msg.user !== user?.displayName && (
                <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.6, margin: 0 }}>
                  {msg.user}
                </p>
              )}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: msg.user === user?.displayName ? '#00FFB2' : 'rgba(255, 255, 255, 0.08)',
                  color: msg.user === user?.displayName ? '#000000' : '#FFFFFF',
                  wordWrap: 'break-word',
                }}
              >
                <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.4' }}>{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed Bottom */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '14px 16px',
          backgroundColor: '#111111',
          borderTop: '1px solid rgba(0, 255, 178, 0.2)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
        }}
      >
        <input
          type="text"
          placeholder="Type message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(0, 255, 178, 0.2)',
            borderRadius: '20px',
            color: '#FFFFFF',
            outline: 'none',
            fontSize: '14px',
          }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#00FFB2',
            border: 'none',
            color: '#000000',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default FullPageChat;
