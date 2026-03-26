import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { AuthChangeEvent } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  coins: number;
  winRate: number;
  streak: number;
  role?: string;
}

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  rooms: any[];
  bets: any[];
  coins: number;
  isAuthReady: boolean;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const subscriptionRef = useRef<any>(null);
  const isLoggingOutRef = useRef(false);

  // Initialize auth on mount with session restoration
  useEffect(() => {
    let isUnmounted = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const initAuth = async () => {
      try {
        // Restore existing session first
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !isUnmounted) {
          await handleUserSession(session.user);
        }
      } catch (error) {
        console.error('Session restore error:', error);
      }

      // Set up listener for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session) => {
          if (isUnmounted || isLoggingOutRef.current) return;

          try {
            if (session?.user) {
              await handleUserSession(session.user);
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
          }

          if (!isUnmounted) {
            setLoading(false);
            setIsAuthReady(true);
          }
        }
      );

      subscriptionRef.current = subscription;

      // Safety timeout
      if (!isUnmounted) {
        timeoutId = setTimeout(() => {
          if (!isUnmounted) {
            setLoading(false);
            setIsAuthReady(true);
          }
        }, 5000);
      }
    };

    initAuth();

    return () => {
      isUnmounted = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Handle user session with retry logic for resilience
  const handleUserSession = async (authUser: any) => {
    const maxRetries = 2;
    let retries = 0;

    const fetchProfile = async (): Promise<void> => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          if (retries < maxRetries) {
            retries++;
            console.warn(`Profile fetch retry ${retries}/${maxRetries}`);
            await new Promise(r => setTimeout(r, 1000));
            return fetchProfile();
          }
          console.error('Profile fetch failed:', profileError.message);
        }

        if (profile) {
          const userProfile: UserProfile = {
            id: profile.id,
            displayName: profile.display_name || authUser.user_metadata?.full_name || 'User',
            email: profile.email,
            photoURL: profile.photo_url || authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
            coins: profile.coins || 5000,
            winRate: profile.win_rate || 0,
            streak: profile.streak || 0,
          };
          setUser(userProfile);
        } else {
          // New user - profile should be created by database trigger
          // But add as fallback in case trigger hasn't fired yet
          const newProfile: UserProfile = {
            id: authUser.id,
            displayName: authUser.user_metadata?.full_name || 'User',
            email: authUser.email || '',
            photoURL: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
            coins: 5000,
            winRate: 0,
            streak: 0,
          };
          setUser(newProfile);

          // Ensure profile exists (idempotent - won't duplicate)
          try {
            const { error: upsertError } = await supabase.from('profiles').upsert(
              {
                id: authUser.id,
                display_name: newProfile.displayName,
                email: newProfile.email,
                photo_url: newProfile.photoURL,
                coins: newProfile.coins,
                win_rate: newProfile.winRate,
                streak: newProfile.streak,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );

            if (upsertError) {
              console.warn('Profile upsert warning:', upsertError);
              // Not critical - trigger should have created it
            }
          } catch (err) {
            console.error('Profile upsert error:', err);
            // Fallback already set above
          }
        }
      } catch (error) {
        console.error('Error handling user session:', error);
        // Fallback profile
        setUser({
          id: authUser.id,
          displayName: authUser.user_metadata?.full_name || 'User',
          email: authUser.email || '',
          photoURL: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
          coins: 5000,
          winRate: 0,
          streak: 0,
        });
      }
    };

    await fetchProfile();
  };

  // Real-time listeners for rooms and bets if user is logged in
  useEffect(() => {
    if (!user) return;
    // TODO: Implement real-time subscriptions for rooms and bets
    // const { data: subscription } = supabase
    //   .from('rooms')
    //   .on('*', payload => {
    //     console.log('Room change:', payload);
    //   })
    //   .subscribe();
  }, [user]);

  // Logout function with proper lifecycle cleanup
  const logout = async () => {
    try {
      isLoggingOutRef.current = true;
      setLoading(true);

      // Unsubscribe from listener
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // Clear auth and state
      await supabase.auth.signOut();
      setUser(null);
      setRooms([]);
      setBets([]);

      // Clean all storage keys
      const keysToRemove = ['roomblast-auth', 'roomblast-auth-v2', 'supabase.auth.token'];
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          // Storage might be read-only
        }
      });

      setLoading(false);
      isLoggingOutRef.current = false;
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setLoading(false);
      isLoggingOutRef.current = false;
    }
  };

  return (
    <AppContext.Provider value={{ user, loading, rooms, bets, coins: user?.coins || 0, isAuthReady, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
