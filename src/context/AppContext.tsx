import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);

  // Initialize auth on mount
  useEffect(() => {
    let isUnmounted = false;

    // Pehle onAuthStateChange set karo — phir getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isUnmounted) return;

        if (session?.user) {
          await handleUserSession(session.user);
        } else {
          setUser(null);
        }

        // Har case mein loading false karo
        if (!isUnmounted) {
          setLoading(false);
          setIsAuthReady(true);
        }
      }
    );

    // Safety net — 4 second baad force loading false
    const timer = setTimeout(() => {
      if (!isUnmounted) {
        setLoading(false);
        setIsAuthReady(true);
      }
    }, 4000);

    return () => {
      isUnmounted = true;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  // Handle user session - fetch profile in background
  const handleUserSession = async (authUser: any) => {
    try {
      // Fetch user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch warning:', profileError.message);
      }

      if (profile) {
        // Profile exists, use it
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
        // New user - show with default values
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

        // Create profile in background
        await supabase.from('profiles').upsert({
          id: authUser.id,
          display_name: newProfile.displayName,
          email: newProfile.email,
          photo_url: newProfile.photoURL,
          coins: newProfile.coins,
          win_rate: newProfile.winRate,
          streak: newProfile.streak,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error handling user session:', error);
      // Fallback user profile
      const fallbackProfile: UserProfile = {
        id: authUser.id,
        displayName: authUser.user_metadata?.full_name || 'User',
        email: authUser.email || '',
        photoURL: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
        coins: 5000,
        winRate: 0,
        streak: 0,
      };
      setUser(fallbackProfile);
    }
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

  return (
    <AppContext.Provider value={{ user, loading, rooms, bets, coins: user?.coins || 0, isAuthReady }}>
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
