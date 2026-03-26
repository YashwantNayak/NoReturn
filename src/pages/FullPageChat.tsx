import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Message {
  id: string;
  user_id: string;
  display_name: string;
  photo_url: string;
  content: string;
  created_at: string;
  room_id?: string;
}

// Memoized Message Component for performance
const MessageBubble = React.memo(({ 
  msg, 
  isMe, 
  userPhoto 
}: { 
  msg: Message; 
  isMe: boolean; 
  userPhoto?: string;
}) => {
  const timeStr = useMemo(() => {
    return new Date(msg.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [msg.created_at]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        gap: '8px',
        alignItems: 'flex-end',
      }}
    >
      {!isMe && (
        <img
          src={
            msg.photo_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.display_name}`
          }
          width={32}
          height={32}
          style={{ borderRadius: '50%', flexShrink: 0 }}
          alt={msg.display_name}
          loading="lazy"
        />
      )}

      <div style={{ maxWidth: '65%' }}>
        {!isMe && (
          <p
            style={{
              margin: '0 0 4px 4px',
              fontSize: '11px',
              color: '#00FFB2',
              fontWeight: 'bold',
            }}
          >
            {msg.display_name}
          </p>
        )}

        <div
          style={{
            padding: '10px 14px',
            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            backgroundColor: isMe ? '#00FFB2' : '#1a1a1a',
            color: isMe ? '#000000' : '#FFFFFF',
            fontSize: '14px',
            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
            wordWrap: 'break-word',
          }}
        >
          {msg.content}
        </div>

        <p
          style={{
            margin: '3px 4px 0',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.3)',
            textAlign: isMe ? 'right' : 'left',
          }}
        >
          {timeStr}
        </p>
      </div>

      {isMe && (
        <img
          src={
            userPhoto ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=user`
          }
          width={32}
          height={32}
          style={{ borderRadius: '50%', flexShrink: 0 }}
          alt="You"
          loading="lazy"
        />
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

const FullPageChat: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>();
  
  // Default to 'messages' table for global chat
  const currentRoomId = roomId || 'global';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Check if user is scrolled near bottom
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
    shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Smart auto-scroll - only scroll if user is at bottom
  useEffect(() => {
    if (!shouldAutoScroll.current || !bottomRef.current) return;
    
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    });
  }, [messages]);

  // Load messages + setup real-time subscription
  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      try {
        setError(null);
        // Optimized query - select only needed columns
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('id, user_id, display_name, photo_url, content, created_at')
          .order('created_at', { ascending: true })
          .limit(50);

        if (fetchError) throw fetchError;

        setMessages(data || []);
        shouldAutoScroll.current = true;
      } catch (err: any) {
        console.error('Failed to load messages:', err);
        setError('Could not load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel('global-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Optimized message send with debounce
  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !user || isSending) return;

    try {
      setIsSending(true);
      setError(null);
      
      const { error } = await supabase.from('messages').insert({
        user_id: user.id,
        display_name: user.displayName,
        photo_url: user.photoURL,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [newMessage, user, isSending]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* HEADER — Fixed at Top */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0, 255, 178, 0.3)',
          backgroundColor: '#111111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          height: '60px',
        }}
      >
        {/* 1. Back Icon Only */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#00FFB2',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
          }}
        >
          <ArrowLeft size={24} />
        </button>

        {/* 2. Match Score in Middle */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#00FFB2' }}>
            MI 145/8 vs CSK
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'rgba(0, 255, 178, 0.6)' }}>
            18.3 Overs
          </p>
        </div>

        {/* 3. Live Member Count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'rgba(0, 255, 178, 0.8)',
            minWidth: '40px',
            justifyContent: 'flex-end',
          }}
        >
          <Users size={16} />
          <span>{messages.length}</span>
        </div>
      </div>

      {/* MESSAGES CONTAINER — Scrollable Middle Section */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: '60px',
          paddingBottom: '120px',
          paddingLeft: '16px',
          paddingRight: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {loading ? (
          // Smart skeleton loaders instead of blocking
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={`skeleton-${i}`}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 255, 178, 0.1)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ maxWidth: '65%' }}>
                  <div
                    style={{
                      width: '100px',
                      height: '12px',
                      backgroundColor: 'rgba(0, 255, 178, 0.1)',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                  />
                  <div
                    style={{
                      width: '200px',
                      height: '32px',
                      backgroundColor: 'rgba(0, 255, 178, 0.1)',
                      borderRadius: '16px',
                    }}
                  />
                </div>
              </div>
            ))}
          </>
        ) : messages.length === 0 && !error ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMe={isMe}
                userPhoto={user?.photoURL}
              />
            );
          })
        )}
        <div ref={bottomRef} style={{ height: '0' }} />
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            borderTop: '1px solid rgba(255, 68, 68, 0.3)',
            color: '#FF6B6B',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {/* INPUT AREA — Fixed at Bottom */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '12px 16px 16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: '#111111',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          height: '70px',
          boxSizing: 'border-box',
        }}
      >
        <input
          type="text"
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            color: '#FFFFFF',
            fontSize: '14px',
            outline: 'none',
            WebkitAppearance: 'none',
            height: '44px',
            boxSizing: 'border-box',
          }}
          placeholder="Message likho..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isSending) {
              e.preventDefault();
              handleSend();
            }
          }}
          maxLength={500}
          disabled={!user || isSending}
          autoComplete="off"
          spellCheck="true"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor:
              newMessage.trim() && !isSending
                ? '#00FFB2'
                : 'rgba(255,255,255,0.1)',
            border: 'none',
            cursor:
              newMessage.trim() && !isSending ? 'pointer' : 'not-allowed',
            fontSize: '20px',
            flexShrink: 0,
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitAppearance: 'none',
            opacity: isSending ? 0.6 : 1,
          }}
        >
          {isSending ? '...' : '➤'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @media (max-width: 768px) {
          input:focus, textarea:focus {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default FullPageChat;
