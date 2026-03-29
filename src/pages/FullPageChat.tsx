import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  user_id: string;
  display_name: string;
  photo_url: string;
  content: string;
  created_at: string;
  room_id?: string;
}

// Optimized Message List with Batch Rendering
const OptimizedMessageList = React.memo(({ messages, user }: any) => {
  // Batch messages into groups to reduce re-renders - memoize properly
  const messageBatches = useMemo(() => {
    const batches = [];
    for (let i = 0; i < messages.length; i += 20) {
      batches.push(messages.slice(i, i + 20));
    }
    return batches;
  }, [messages]); // Actually depend on messages array, not just length

  // Memoize user info flags to avoid recalculating
  const userInfoFlags = useMemo(() => {
    return messages.map((msg: Message, idx: number) => {
      const prevMsg = idx > 0 ? messages[idx - 1] : null;
      return !prevMsg || prevMsg.user_id !== msg.user_id;
    });
  }, [messages]);

  return (
    <AnimatePresence mode="wait">
      {messageBatches.map((batch, batchIndex) => (
        <React.Fragment key={`batch-${batchIndex}`}>
          {batch.map((msg: Message, msgIndex: number) => {
            const globalIndex = batchIndex * 20 + msgIndex;
            const isMe = msg.user_id === user?.id;
            const shouldShowUserInfo = userInfoFlags[globalIndex];

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'tween', duration: 0.15 }}
              >
                <MessageBubble
                  msg={msg}
                  isMe={isMe}
                  userPhoto={user?.photoURL}
                  shouldShowUserInfo={shouldShowUserInfo}
                />
              </motion.div>
            );
          })}
        </React.Fragment>
      ))}
    </AnimatePresence>
  );
});

OptimizedMessageList.displayName = 'OptimizedMessageList';

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
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.display_name || msg.user_id)}`
          }
          width={28}
          height={28}
          style={{ borderRadius: '50%', flexShrink: 0 }}
          alt={msg.display_name}
          loading="lazy"
          decoding="async"
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
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.user_id)}`
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
  const messageIdsRef = useRef<Set<string>>(new Set()); // Fast O(1) duplicate check
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Debounce rapid updates

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
          // Pre-populate message IDs for fast duplicate detection
          (data || []).forEach((msg: Message) => {
            messageIdsRef.current.add(msg.id);
          });
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
              
              // Fast O(1) duplicate check using Set
              if (messageIdsRef.current.has(payload.new.id)) {
                console.log('[Chat] Duplicate message ignored');
                return;
              }
              
              messageIdsRef.current.add(payload.new.id);
              
              // Debounce rapid updates to prevent excessive re-renders
              if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
              }
              
              updateTimeoutRef.current = setTimeout(() => {
                if (isActive) {
                  setMessages((prev) => {
                    // Double-check it doesn't exist
                    const exists = prev.some((m) => m.id === payload.new.id);
                    if (exists) return prev;
                    
                    const updated = [...prev, payload.new as Message];
                    
                    // Keep only last 100 messages to manage memory
                    if (updated.length > 100) {
                      const removed = updated.slice(0, updated.length - 100);
                      removed.forEach((msg) => messageIdsRef.current.delete(msg.id));
                      return updated.slice(-100);
                    }
                    
                    return updated;
                  });
                }
              }, 50); // Debounce by 50ms to batch rapid updates
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
      // Clear debounce timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      // Clear message IDs cache
      messageIdsRef.current.clear();
    };
  }, [user, currentRoomId]);

  // Optimized message send with retry logic
  const handleSend = useCallback(async () => {
    // Check current state - don't include isSending in deps!
    if (!newMessage.trim() || !user) return;

    const messageData = {
      user_id: user.id,
      display_name: user.displayName,
      photo_url: user.photoURL || '',
      content: newMessage.trim(),
      // room_id: currentRoomId, // Uncomment once table has room_id column
    };

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        setIsSending(true);
        if (attempt === 0) setError(null);

        console.log(`[Chat] Sending message (attempt ${attempt + 1}/${maxRetries})`);

        const { error } = await supabase
          .from('messages')
          .insert([messageData]);

        if (error) {
          throw error;
        }

        console.log('[Chat] Message sent successfully!');
        setNewMessage('');
        setIsSending(false);
        return; // Success - exit function
      } catch (err: any) {
        lastError = err;
        console.error(`[Chat] Attempt ${attempt + 1} failed:`, err.message);

        // If it's not a network error, don't retry
        if (err.code && err.code !== 'NETWORK_ERROR' && attempt > 0) {
          break;
        }

        // Exponential backoff: 300ms, 600ms, 1200ms
        if (attempt < maxRetries - 1) {
          const delayMs = 300 * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }

    // All retries failed
    setError(
      lastError?.message ||
      'Failed to send message. Check connection and try again.'
    );
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

      {/* MESSAGES CONTAINER — Optimized Middle Section */}
      <div
        ref={messagesContainerRef}
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
          <motion.div
            key="skeleton-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'contents' }}
          >
            {/* Smart skeleton loaders with smooth animation */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  damping: 20,
                  stiffness: 300,
                  delay: i * 0.05,
                }}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 255, 178, 0.1)',
                    flexShrink: 0,
                    animation: 'pulse 1.5s ease-in-out infinite',
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
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '300px',
                      height: '42px',
                      backgroundColor: 'rgba(0, 255, 178, 0.1)',
                      borderRadius: '16px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : messages.length === 0 && !error ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            No messages yet. Start the conversation!
          </motion.div>
        ) : (
          <motion.div
            key="messages-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'contents' }}
          >
            <OptimizedMessageList 
              messages={messages}
              user={user}
            />
          </motion.div>
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
