// Placeholder Supabase configuration
// TODO: Replace with your actual Supabase credentials

export const supabase = {
  auth: {
    signInWithOAuth: async () => { throw new Error('Supabase not implemented'); },
    signUp: async () => { throw new Error('Supabase not implemented'); },
    signInWithPassword: async () => { throw new Error('Supabase not implemented'); },
    signOut: async () => { throw new Error('Supabase not implemented'); },
    getSession: async () => null,
    onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: () => ({
      order: () => ({
        limit: () => ({ data: [], error: null }),
      }),
      eq: () => ({
        data: [],
        error: null,
      }),
      single: async () => ({ data: null, error: null }),
    }),
    insert: async (data: any) => ({ data: null, error: null }),
    update: async (data: any) => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
};
