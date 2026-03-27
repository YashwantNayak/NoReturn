import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

interface Message {
  id: string;
  user_id: string;
  display_name: string;
  photo_url: string;
  content: string;
  created_at: string;
  room_id: string;
}

interface UseRealtimeMessagesOptions {
  roomId: string;
  userId?: string;
  limit?: number;
}

export const useRealtimeMessages = (options: UseRealtimeMessagesOptions) => {
  const { roomId, userId, limit = 100 } = options;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isActiveRef = useRef(true);
  const channelRef = useRef<any>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      console.log(`[useRealtimeMessages] Fetching messages for room: ${roomId}`);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('id, user_id, display_name, photo_url, content, created_at, room_id')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (fetchError) {
        console.error('[useRealtimeMessages] Fetch error:', fetchError);
        throw fetchError;
      }

      if (isActiveRef.current) {
        setMessages(data || []);
        console.log(`[useRealtimeMessages] Fetched ${data?.length || 0} messages`);
      }
    } catch (err: any) {
      console.error('[useRealtimeMessages] Failed to fetch messages:', err.message || err);
      if (isActiveRef.current) {
        setError(err.message || 'Failed to fetch messages');
      }
    } finally {
      if (isActiveRef.current) setLoading(false);
    }
  }, [roomId, limit]);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback(() => {
    const channelName = `messages:${roomId}`;

    console.log(`[useRealtimeMessages] Setting up realtime for room: ${roomId}`);

    try {
      channelRef.current = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
        },
      });

      channelRef.current
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload: any) => {
            console.log('[useRealtimeMessages] New message received:', payload.new?.id);
            if (isActiveRef.current) {
              setMessages((prev) => {
                // Avoid duplicates
                const exists = prev.some((m) => m.id === payload.new.id);
                if (exists) return prev;
                return [...prev, payload.new as Message];
              });
            }
          }
        )
        .on('subscribe', () => {
          console.log(`[useRealtimeMessages] Subscribed to room: ${roomId}`);
        })
        .on('error', (err: any) => {
          console.error('[useRealtimeMessages] Subscription error:', err);
          if (isActiveRef.current) {
            setError('Real-time connection lost');
          }
        })
        .subscribe();
    } catch (err: any) {
      console.error('[useRealtimeMessages] Failed to setup realtime:', err.message || err);
    }
  }, [roomId]);

  // Initialize
  useEffect(() => {
    isActiveRef.current = true;

    fetchMessages();
    setupRealtimeSubscription();

    // Cleanup
    return () => {
      isActiveRef.current = false;
      console.log(`[useRealtimeMessages] Cleaning up room: ${roomId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, fetchMessages, setupRealtimeSubscription]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, user: any) => {
      if (!content.trim() || !user) return;

      try {
        console.log(`[useRealtimeMessages] Sending message to room: ${roomId}`);

        const { error: insertError } = await supabase.from('messages').insert({
          user_id: user.id,
          display_name: user.displayName,
          photo_url: user.photoURL,
          content: content.trim(),
          room_id: roomId,
        });

        if (insertError) throw insertError;

        console.log('[useRealtimeMessages] Message sent successfully');
      } catch (err: any) {
        console.error('[useRealtimeMessages] Send error:', err.message || err);
        if (isActiveRef.current) {
          setError('Failed to send message');
        }
        throw err;
      }
    },
    [roomId]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
};
