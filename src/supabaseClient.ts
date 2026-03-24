import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vqsxdljtvqfmrfdpyybq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxc3hkbGp0dnFmbXJmZHB5eWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjA5NjUsImV4cCI6MjA4OTgzNjk2NX0.VOJLPssFbitmqFm9JOWhkMqV9N1m3yrCOFXvSyIhnOk'

// Storage adapter with fallback for private browsing
const createStorageAdapter = () => {
  const testKey = '_roomblast_test_'
  try {
    localStorage.setItem(testKey, 'true')
    localStorage.removeItem(testKey)
    return localStorage
  } catch {
    console.warn('localStorage unavailable - using memory storage')
    const store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach(key => delete store[key]) }
    }
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: createStorageAdapter(),
    storageKey: 'roomblast-auth'
  }
})