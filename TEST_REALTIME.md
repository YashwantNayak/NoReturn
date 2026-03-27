# Quick Test Guide - Supabase Realtime Chat

## Step 1: Database Setup (Required)

Run this SQL in Supabase SQL Editor to add `room_id` if missing:

```sql
-- Add room_id column if it doesn't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS room_id TEXT DEFAULT 'global';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Update existing rows to have room_id
UPDATE messages SET room_id = 'global' WHERE room_id IS NULL;
```

## Step 2: Enable Realtime in Supabase Dashboard

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Database** → **Replication**
3. Find **supabase_realtime** publication
4. Check that `messages` table is replicated
5. If not, click **Add** and select `messages` table

## Step 3: Verify Code Changes

Check that your `FullPageChat.tsx` has:
- ✅ `room_id` in the `.select()` query
- ✅ `.eq('room_id', currentRoomId)` filter
- ✅ `room_id: currentRoomId` in insert payload
- ✅ `isActive` flag for cleanup
- ✅ Console logs with `[Chat]` prefix

## Step 4: Test Realtime

### Test Case 1: Send + Receive on Same Device
1. Open your app
2. Open **DevTools** (F12) → **Console** tab
3. Open chat
4. **Type a message and send**
5. **Expected**: Message appears immediately + console shows:
   ```
   [Chat] Setting up realtime subscription for room: global
   [Chat] Realtime subscription active for room: global
   [Chat] Sending message to room: global
   [Chat] Message sent successfully: [id]
   ```

### Test Case 2: Cross-Device Realtime
1. **Device A**: Open browser with chat
2. **Device B**: Open another browser tab/window with same URL
3. **Device A**: Send a message
4. **Expected**: Message appears instantly on Device B without refresh
5. **Device B** console should show:
   ```
   [Chat] New message received (realtime): {id: "...", content: "..."}
   ```

### Test Case 3: Page Refresh
1. Send a message
2. **Refresh the page** (F5 or Cmd+R)
3. **Expected**: 
   - Old messages still visible
   - Realtime subscription reconnects automatically
   - New messages from other users appear without refresh

### Test Case 4: Navigation
1. Send a message in chat
2. Close chat (navigate back)
3. Re-open chat
4. **Expected**:
   - New channel created: `chat:global` (or room ID)
   - Old subscription cleaned up
   - Console shows cleanup logs

## Debugging Checklist

| Issue | Check |
|-------|-------|
| Messages don't appear instantly | DevTools Console - look for `[Chat]` logs |
| RLS Error 403 | RLS policy must allow SELECT for authenticated users |
| Channel doesn't subscribe | Check Supabase realtime is enabled for `messages` table |
| Memory leak/slowdown | Console should show cleanup logs on navigation |
| Duplicate messages | Check duplicate detection: `const exists = prev.some(m => m.id === payload.new.id)` |

## Console Log Guide

```
[Chat] Loading messages for room: global
  → Initial fetch started

[Chat] Loaded 25 messages
  → Messages fetched successfully

[Chat] Setting up realtime subscription for room: global
  → Channel created and subscribing

[Chat] Realtime subscription active for room: global
  → Subscription confirmed, ready for live updates

[Chat] New message received (realtime): {...}
  → Live message from another user arrived

[Chat] Sending message to room: global
  → User pressed send

[Chat] Message sent successfully: [uuid]
  → Message inserted to database

[Chat] Cleaning up subscription for room: global
  → Component unmounted or room changed, subscription removed
```

## Production Deployment

Before going live:
- [ ] Test on production Supabase project
- [ ] Verify `messages` table has `room_id` column
- [ ] Enable realtime for `messages` table
- [ ] Test with 2+ concurrent users
- [ ] Monitor Supabase dashboard for connection health
- [ ] Check browser DevTools for any errors

## Quick Rollback (if needed)

If realtime stops working, you can temporarily revert to polling:
```tsx
// Instead of realtime subscription, use polling:
const messageRefresh = setInterval(() => {
  loadMessages(); // Refetch every 2 seconds
}, 2000);

return () => clearInterval(messageRefresh);
```

But realtime should be working with the implementation above.
