import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vqsxdljtvqfmrfdpyybq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxc3hkbGp0dnFmbXJmZHB5eWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjA5NjUsImV4cCI6MjA4OTgzNjk2NX0.VOJLPssFbitmqFm9JOWhkMqV9N1m3yrCOFXvSyIhnOk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
})