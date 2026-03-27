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
  userPhoto,
  shouldShowUserInfo = true
}: { 
  msg: Message; 
  isMe: boolean; 
  userPhoto?: string;
  shouldShowUserInfo?: boolean;
}) => {
  const timeStr = useMemo(() => {
    return new Date(msg.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [msg.created_at]);

  // If showing user info (first message from user)
  if (!isMe && shouldShowUserInfo) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '6px',
          alignItems: 'flex-end',
          marginBottom: '-9px',
        }}
      >
        <img
          src={
            msg.photo_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.display_name}`
          }
          width={28}
          height={28}
          style={{ borderRadius: '50%', flexShrink: 0 }}
          alt={msg.display_name}
          loading="lazy"
        />

        <div style={{ maxWidth: '65%' }}>
          <p
            style={{
              margin: '0 0 1px 4px',
              fontSize: '11px',
              color: '#00FFB2',
              fontWeight: 'bold',
            }}
          >
            {msg.display_name}
          </p>

          <div
            style={{
              padding: '8px 14px',
              borderRadius: '10px 10px 10px 1px',
              backgroundColor: '#1a1a1a',
              color: '#FFFFFF',
              fontSize: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              wordWrap: 'break-word',
            }}
          >
            {msg.content}
          </div>

          {/* <p
            style={{
              margin: '3px 4px 0',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'left',
            }}
          >
            {timeStr}
          </p> */}
        </div>
      </div>
    );
  }

  // If NOT showing user info (subsequent message from same user)
  if (!isMe && !shouldShowUserInfo) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginLeft: '35px',
          marginBottom: '-9px',
        }}
      >
        <div style={{ maxWidth: '65%' }}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '1px 10px 10px 10px',
              backgroundColor: '#1a1a1a',
              color: '#FFFFFF',
              fontSize: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              wordWrap: 'break-word',
            }}
          >
            {msg.content}
          </div>

          {/* <p
            style={{
              margin: '2px 4px 0',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'left',
            }}
          >
            {timeStr}
          </p> */}
        </div>
      </div>
    );
  }

  // My messages (from current user) - FIRST message shows avatar
  if (isMe && shouldShowUserInfo) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '6px',
          alignItems: 'flex-end',
          marginBottom: '-10px',
        }}
      >
        <div style={{ maxWidth: '65%' }}>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px 10px 1px 10px',
              backgroundColor: '#00FFB2',
              color: '#000000',
              fontSize: '16px',
              border: 'none',
              wordWrap: 'break-word',
            }}
          >
            {msg.content}
          </div>

          {/* <p
            style={{
              margin: '3px 4px 0',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'right',
            }}
          >
            {timeStr}
          </p> */}
        </div>

        <img
          src={
            userPhoto ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=user`
          }
          width={28}
          height={28}
          style={{ borderRadius: '50%', flexShrink: 0 }}
          alt="You"
          loading="lazy"
        />
      </div>
    );
  }

  // My messages (from current user) - SUBSEQUENT messages (no avatar)
  if (isMe && !shouldShowUserInfo) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginRight: '35px',
          marginBottom: '-10px',
        }}
      >
        <div style={{ maxWidth: '65%' }}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '10px 1px 10px 10px',
              backgroundColor: '#00FFB2',
              color: '#000000',
              fontSize: '16px',
              border: 'none',
              wordWrap: 'break-word',
            }}
          >
            {msg.content}
          </div>

          {/* <p
            style={{
              margin: '2px 4px 0',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'right',
            }}
          >
            {timeStr}
          </p> */}
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return null
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
  const inputRef = useRef<HTMLInputElement>(null);
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

    let isActive = true;
    let channel: any = null;

    const loadMessages = async () => {
      try {
        setError(null);
        setLoading(true);

        console.log(`[Chat] Loading messages for room: ${currentRoomId}`);

        // Fetch existing messages
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('id, user_id, display_name, photo_url, content, created_at')
          // .eq('room_id', currentRoomId) // Uncomment once table has room_id
          .order('created_at', { ascending: true })
          .limit(100);

        if (fetchError) {
          console.error('[Chat] Fetch error:', fetchError);
          throw fetchError;
        }

        if (isActive) {
          setMessages(data || []);
          shouldAutoScroll.current = true;
          console.log(`[Chat] Loaded ${data?.length || 0} messages`);
        }
      } catch (err: any) {
        console.error('[Chat] Failed to load messages:', err.message || err);
        if (isActive) {
          setError('Could not load messages');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    const setupRealtimeSubscription = async () => {
      console.log(`[Chat] Setting up realtime subscription for room: ${currentRoomId}`);

      // Create unique channel name per room
      const channelName = `chat:${currentRoomId}`;

      try {
        channel = supabase.channel(channelName, {
          config: {
            broadcast: { self: false }, // Don't receive own messages through subscription
          },
        });

        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              // filter: `room_id=eq.${currentRoomId}`, // Uncomment once table has room_id
            },
            (payload: any) => {
              console.log('[Chat] New message received (realtime):', payload.new);
              if (isActive) {
                setMessages((prev) => {
                  // Avoid duplicates
                  const exists = prev.some((m) => m.id === payload.new.id);
                  if (exists) {
                    console.log('[Chat] Duplicate message ignored');
                    return prev;
                  }
                  return [...prev, payload.new as Message];
                });
              }
            }
          )
          .on('subscribe', () => {
            console.log(`[Chat] Realtime subscription active for room: ${currentRoomId}`);
          })
          .on('error', (err: any) => {
            console.error('[Chat] Subscription error:', err);
            if (isActive) {
              setError('Real-time connection lost. Trying to reconnect...');
            }
          })
          .subscribe();
      } catch (err: any) {
        console.error('[Chat] Failed to setup realtime:', err.message || err);
      }
    };

    // Load messages first
    loadMessages();

    // Then setup realtime subscription
    setupRealtimeSubscription();

    // Cleanup on unmount or room change
    return () => {
      isActive = false;
      console.log(`[Chat] Cleaning up subscription for room: ${currentRoomId}`);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, currentRoomId]);

  // Optimized message send with debounce
  const handleSend = useCallback(async () => {
    // Check current state - don't include isSending in deps!
    if (!newMessage.trim() || !user) return;

    try {
      setIsSending(true);
      setError(null);

      console.log(`[Chat] Sending message to room: ${currentRoomId}`);
      console.log(`[Chat] User ID: ${user.id}, Display Name: ${user.displayName}`);

      const messageData = {
        user_id: user.id,
        display_name: user.displayName,
        photo_url: user.photoURL || '',
        content: newMessage.trim(),
        // room_id: currentRoomId, // Uncomment once table has room_id column
      };

      console.log('[Chat] Message data:', messageData);

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) {
        console.error('[Chat] Supabase error details:', error);
        console.error('[Chat] Error code:', error.code);
        console.error('[Chat] Error details:', error.details);
        console.error('[Chat] Error hint:', error.hint);
        throw new Error(`${error.message} (Code: ${error.code})`);
      }

      console.log('[Chat] Message sent successfully!');
      setNewMessage('');
    } catch (err: any) {
      console.error('[Chat] Failed to send message:', err.message || err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
      // Focus with multiple attempts to ensure it works
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
      // Backup focus for reliability
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [newMessage, user, currentRoomId]);

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
          messages.map((msg, index) => {
            const isMe = msg.user_id === user?.id;
            // Show user info only on first message or when user changes
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const shouldShowUserInfo = !prevMsg || prevMsg.user_id !== msg.user_id;
            
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMe={isMe}
                userPhoto={user?.photoURL}
                shouldShowUserInfo={shouldShowUserInfo}
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
          ref={inputRef}
          type="text"
          inputMode="text"
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '15px',
            color: '#FFFFFF',
            fontSize: '16px',
            outline: '2px solid transparent',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            height: '44px',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          placeholder="Type your message..."
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
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          onFocus={(e) => {
            e.target.style.borderColor = '#009367';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            e.target.style.boxShadow = 'none';
          }}
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
                ? '#007e59'
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
        
        /* Hide browser/mobile keyboard suggestions and autocomplete icons */
        input::-webkit-autofill,
        input::-webkit-contacts-auto-fill-button {
          display: none !important;
        }
        
        /* Disable autocomplete suggestions dropdown */
        input::placeholder {
          opacity: 1 !important;
          color: rgba(255, 255, 255, 0.4) !important;
        }
        
        /* Hide datalist suggestions */
        datalist {
          display: none;
        }
        
        /* Disable mobile keyboard toolbar suggestions */
        input[type="text"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        /* Gboard/Keyboard toolbar suppression - remove action suggestions */
        input:not([type="password"]):not([type="email"]):not([type="tel"]):not([type="number"]) {
          -webkit-user-select: text;
          user-select: text;
        }
        
        /* iOS keyboard optimization */
        @supports (-webkit-touch-callout: none) {
          input[type="text"] {
            font-size: 16px;
            -webkit-appearance: none;
            -webkit-user-select: text;
          }
        }
        
        /* Android keyboard optimization */
        @supports (display: grid) {
          input[type="text"] {
            -webkit-appearance: none;
          }
        }
        
        @media (max-width: 768px) {
          input:focus, textarea:focus {
            font-size: 16px;
          }
          
          /* Ensure no mobile toolbar suggestions appear */
          input[type="text"] {
            -webkit-appearance: none;
            appearance: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FullPageChat;
