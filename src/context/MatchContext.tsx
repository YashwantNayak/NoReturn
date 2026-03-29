import { createContext, useContext, useState, useEffect, useRef, ReactNode, FC, PropsWithChildren } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Match Interface - represents a single cricket match from matche_data table
 */
export interface Match {
  match_id: number;
  series_name: string;
  match_desc: string;
  match_format: string;
  state: string; // 'In Progress' | 'Preview' | 'Complete'
  status: string; // e.g. "RCB won by 6 wkts"
  team1_id: number;
  team1_name: string;
  team1_sname: string; // e.g. "MI"
  team2_id: number;
  team2_name: string;
  team2_sname: string; // e.g. "CSK"
  venue_ground: string;
  venue_city: string;
  t1_inn1_runs: number;
  t1_inn1_wickets: number;
  t1_inn1_overs: string | number;
  t1_inn2_runs: number;
  t1_inn2_wickets: number;
  t1_inn2_overs: string | number;
  t2_inn1_runs: number;
  t2_inn1_wickets: number;
  t2_inn1_overs: string | number;
  t2_inn2_runs: number;
  t2_inn2_wickets: number;
  t2_inn2_overs: string | number;
  start_date: string;
  end_date: string | null;
  updated_at: string;
  created_at: string;
  batting_first?: string; // Team short name that batted first (e.g. "MI" or "CSK")
}

/**
 * MatchContextType - shape of the context value
 */
interface MatchContextType {
  matches: Match[]; // all matches from DB
  liveMatch: Match | null; // first match where state === 'In Progress'
  isLoading: boolean; // true while initial fetch is happening
  error: string | null; // error message if fetch fails
  refetch: () => void; // manual refetch trigger
}

/**
 * Create the context
 */
export const MatchContext = createContext<MatchContextType | undefined>(undefined);

/**
 * MatchProvider - wraps the app and manages match data
 */
export const MatchProvider: FC<PropsWithChildren> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  /**
   * Determine which team batted first based on inningsId logic
   * odd inningsId (1, 3, 5...) = Team batted 1st
   * even inningsId (2, 4, 6...) = Team batted 2nd
   */
  const determineBattingFirst = (match: any): string => {
    try {
      // Check if we have innings data with inningsId
      const t1FirstInnInningsId = match?.t1_inn1_inningsId || null;
      const t2FirstInnInningsId = match?.t2_inn1_inningsId || null;

      // Determine who batted first (odd inningsId = batted 1st)
      if (t1FirstInnInningsId && t1FirstInnInningsId % 2 === 1) {
        return match.team1_sname; // Team1 batted first
      } else if (t2FirstInnInningsId && t2FirstInnInningsId % 2 === 1) {
        return match.team2_sname; // Team2 batted first
      } else {
        // Default: Team1 batted first (typical in most matches)
        return match.team1_sname;
      }
    } catch (err) {
      console.warn('[MatchContext] Error determining batting first:', err);
      return match.team1_sname;
    }
  };

  /**
   * Fetch all matches from Supabase matche_data table
   */
  const fetchMatches = async (): Promise<void> => {
    try {
      console.log('[MatchContext] Fetching all matches...');
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('matche_data')
        .select('*')
        .order('start_date', { ascending: false });

      if (fetchError) {
        console.error('[MatchContext] Fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      console.log(`[MatchContext] Fetched ${data?.length || 0} matches`);
      
      // Transform matches: add batting_first logic based on inningsId
      const transformedMatches = (data || []).map((match: any) => ({
        ...match,
        batting_first: determineBattingFirst(match),
      })) as Match[];
      
      setMatches(transformedMatches);

      // Calculate liveMatch from fetched data (In Progress OR Complete)
      const live = transformedMatches.find((m) => m.state === 'In Progress' || m.state === 'Complete') ?? null;
      setLiveMatch(live);

      console.log('[MatchContext] Live match:', live?.match_desc || 'None', '| Batting first:', live?.batting_first);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to fetch matches';
      console.error('[MatchContext] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Setup realtime subscription to matche_data table
   */
  const setupRealtimeSubscription = (): void => {
    try {
      console.log('[MatchContext] Setting up realtime subscription...');

      channelRef.current = supabase.channel('matche_data_changes', {
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
            table: 'matche_data',
          },
          (payload: any) => {
            console.log('[MatchContext] New match inserted:', payload.new?.match_id);
            const newMatch = {
              ...payload.new,
              batting_first: determineBattingFirst(payload.new),
            } as Match;
            setMatches((prev) => {
              const updated = [newMatch, ...prev];
              // Recalculate liveMatch after insert
              const live = updated.find((m) => m.state === 'In Progress' || m.state === 'Complete') ?? null;
              setLiveMatch(live);
              return updated;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matche_data',
          },
          (payload: any) => {
            console.log('[MatchContext] Match updated:', payload.new?.match_id);
            const updatedMatch = {
              ...payload.new,
              batting_first: determineBattingFirst(payload.new),
            } as Match;
            setMatches((prev) => {
              const updated = prev.map((m) =>
                m.match_id === updatedMatch.match_id ? updatedMatch : m
              );
              // Recalculate liveMatch after update
              const live = updated.find((m) => m.state === 'In Progress' || m.state === 'Complete') ?? null;
              setLiveMatch(live);
              return updated;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'matche_data',
          },
          (payload: any) => {
            console.log('[MatchContext] Match deleted:', payload.old?.match_id);
            const deletedMatchId = payload.old?.match_id;
            setMatches((prev) => {
              const updated = prev.filter((m) => m.match_id !== deletedMatchId);
              // Recalculate liveMatch after delete
              const live = updated.find((m) => m.state === 'In Progress' || m.state === 'Complete') ?? null;
              setLiveMatch(live);
              return updated;
            });
          }
        )
        .on('subscribe', () => {
          console.log('[MatchContext] Realtime subscription active');
        })
        .on('error', (err: any) => {
          console.error('[MatchContext] Subscription error:', err);
          setError('Real-time connection lost');
        })
        .subscribe();
    } catch (err: any) {
      console.error('[MatchContext] Failed to setup realtime:', err);
    }
  };

  /**
   * Initialize: fetch matches and setup realtime
   */
  useEffect(() => {
    if (isInitializedRef.current) return; // Prevent duplicate initialization

    isInitializedRef.current = true;
    setIsLoading(true);

    // Fetch matches first
    fetchMatches().then(() => {
      // Then setup realtime subscription
      setupRealtimeSubscription();
    });

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log('[MatchContext] Unsubscribing from realtime...');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  /**
   * Polling: Refetch data every 20 seconds to ensure accuracy
   */
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      console.log('[MatchContext] Polling refetch (every 20s)...');
      fetchMatches();
    }, 20000); // 20 seconds

    return () => {
      clearInterval(pollingInterval);
      console.log('[MatchContext] Polling stopped');
    };
  }, []);

  /**
   * Manual refetch function
   */
  const refetch = (): void => {
    console.log('[MatchContext] Manual refetch triggered');
    setIsLoading(true);
    fetchMatches();
  };

  const value: MatchContextType = {
    matches,
    liveMatch,
    isLoading,
    error,
    refetch,
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};

/**
 * Custom hook to use MatchContext
 * @throws Error if used outside MatchProvider
 */
export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within MatchProvider');
  }
  return context;
};
