# Supabase Realtime Chat - Production Guide

## Changes Made

### 1. **Fixed FullPageChat.tsx**
- ✅ Added room-specific channels (`chat:${roomId}`)
- ✅ Added `room_id` filter to subscription
- ✅ Added `isActive` flag to prevent state updates on unmounted components
- ✅ Added comprehensive console logging for debugging
- ✅ Added duplicate message detection
- ✅ Added subscription error handling
- ✅ Added `room_id` to message insert
- ✅ Updated dependencies to include `currentRoomId`

### 2. **Created Reusable Hook: useRealtimeMessages.ts**
- ✅ `useRealtimeMessages(roomId, userId, limit)` hook for other components
- ✅ Automatic subscription cleanup
- ✅ Duplicate prevention
- ✅ Error handling with logging
- ✅ Send message function included

---

## Why Realtime Wasn't Working

### Root Causes:
1. **No room_id filtering**: Messages fetched/subscribed globally, not per room
2. **Missing room_id in insert**: Sent messages without room context
3. **No subscription cleanup**: Subscriptions lingered after navigation, causing duplicates
4. **No error handling**: Silent failures when subscription failed
5. **No state cleanup**: Updates attempted on unmounted components (memory leak)

### Why `_redirects` Triggered It:
- `_redirects` doesn't break WebSocket connections (it's a URL rewrite, not a redirect)
- However, it may have caused browser to reload/refresh service worker
- This exposed the broken subscription logic that was "working" through browser caching
- page refresh now correctly hit the SPA entry point, but realtime wasn't properly reconnecting

---

## Database Schema Required

Your `messages` table MUST have:

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  content TEXT NOT NULL,
  room_id TEXT NOT NULL,  -- ADD THIS if missing
  created_at TIMESTAMP DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Important**: If `room_id` column doesn't exist, add it to your messages table.

---

## Enable Realtime in Supabase Console

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Database** → **Replication** → **Publications**
3. Enable realtime for `messages` table:
   - Find `supabase_realtime` publication
   - Ensure `messages` table is in the "Replicated" list
   - If not, click "Add" and select `messages`
4. Row Level Security (RLS) should allow SELECT for authenticated users

---

## Usage

### Option A: Direct Implementation (FullPageChat.tsx)
Already implemented. Just test with:
```bash
npm run dev
```

### Option B: Use Reusable Hook
```tsx
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';

function MyChat() {
  const { messages, loading, error, sendMessage } = useRealtimeMessages({
    roomId: 'my-room-id',
    limit: 100
  });

  return (
    // render messages
  );
}
```

---

## Testing Realtime

1. **Open two browser tabs** with your app
2. **Send a message in Tab 1**
3. **Verify it appears instantly in Tab 2** (without refresh)
4. **Check browser DevTools console** for `[Chat]` logs

Console output should show:
```
[Chat] Loading messages for room: global
[Chat] Loaded 25 messages
[Chat] Setting up realtime subscription for room: global
[Chat] Realtime subscription active for room: global
[Chat] New message received (realtime): {id: "...", content: "..."}
```

---

## Scalability Optimizations

### 1. **Message Pagination**
Current: Loads last 100 messages. For thousands of users:
```tsx
const [hasMore, setHasMore] = useState(true);
const [offset, setOffset] = useState(0);

const loadMore = async () => {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .range(offset, offset + 50);
  setOffset(prev => prev + 50);
};
```

### 2. **Debounce Typing**
Add message composition debouncing:
```tsx
const [debouncedContent, setDebouncedContent] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedContent(content); // Send typing indicator
  }, 300);
  return () => clearTimeout(timer);
}, [content]);
```

### 3. **Connection Pooling**
Supabase handles this automatically, but monitor connection limits in console if >100 concurrent users.

### 4. **Message Caching**
Use React Query for automatic caching:
```tsx
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['messages', roomId],
  queryFn: () => fetchMessages(roomId),
  staleTime: 5 * 60 * 1000, // 5 min
});
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Messages only appear after refresh | No room_id filter | ✅ Already fixed |
| Duplicate messages | Missing duplicate detection | ✅ Already fixed |
| Realtime not connecting | RLS policy blocks | Enable public SELECT in RLS |
| Lag with 100+ users | No pagination | Implement pagination + virtual scrolling |
| Memory leak | No cleanup | ✅ Already fixed with `isActive` flag |
| WebSocket heartbeat timeout | Too many subscriptions | Unsubscribe unused channels |

---

## Deployment Checklist

- [ ] `_redirects` file in `public/` folder ✅
- [ ] `netlify.toml` with build config ✅
- [ ] `room_id` column added to `messages` table
- [ ] Realtime enabled for `messages` table in Supabase
- [ ] RLS policy allows authenticated users to SELECT messages
- [ ] Test in production: send message from one device, verify on another
- [ ] Monitor Supabase realtime stats for connection health

---

## Performance Benchmarks (Recommended)

- **<50 users**: Current setup perfect
- **50-200 users**: Add message pagination (every 50 messages)
- **200-1000 users**: Add Redis caching layer + message compression
- **1000+ users**: Consider message sharding by time windows
