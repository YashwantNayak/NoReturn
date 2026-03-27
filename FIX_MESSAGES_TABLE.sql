-- 🔧 SUPABASE FIX SCRIPT - Run these if messages won't send

-- ✅ Step 1: Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages';

-- ✅ Step 2: Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'messages';

-- ✅ Step 3: Add room_id column if missing
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS room_id TEXT DEFAULT 'global';

-- ✅ Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ✅ Step 5: Ensure RLS allows inserts (enable if you see RLS errors)
-- Uncomment if you get "new row violates row-level security policy"
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated inserts" ON messages
--   FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- CREATE POLICY "Allow select all" ON messages
--   FOR SELECT USING (true);

-- ✅ Step 6: Test insert (replace with actual uids)
INSERT INTO messages (user_id, display_name, photo_url, content, room_id)
VALUES (
  auth.uid(),
  'Test User',
  'https://via.placeholder.com/150',
  'Test message',
  'global'
)
RETURNING id, content, created_at;

-- ✅ Debug: Check if columns exist
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'messages' AND column_name = 'room_id'
) as room_id_exists;

-- ✅ Debug: Check table structure
\d messages;

-- ✅ Debug: Count messages
SELECT COUNT(*) as total_messages FROM messages;
