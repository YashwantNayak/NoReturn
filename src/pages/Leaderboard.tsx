import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { Trophy, Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardPlayer {
  id: string;
  displayName: string;
  photoURL: string;
  coins: number;
  winRate?: number;
  initialCoins?: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAppContext();
  const [displayedPlayers, setDisplayedPlayers] = useState<LeaderboardPlayer[]>([]);
  const [allPlayers, setAllPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingFresh, setIsFetchingFresh] = useState(true); // Background fetch indicator
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const INITIAL_LOAD = 10;
  const LOAD_MORE_COUNT = 10;
  const CACHE_KEY = 'leaderboard_cache';
  const CACHE_EXPIRY_KEY = 'leaderboard_cache_expiry';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached leaderboard data
   */
  const getCachedLeaderboard = (): LeaderboardPlayer[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (!cached || !expiry) return null;
      
      // Check if cache expired
      if (Date.now() > parseInt(expiry)) {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        return null;
      }
      
      console.log('[Leaderboard] Loading from cache...');
      return JSON.parse(cached);
    } catch (err) {
      console.warn('[Leaderboard] Cache read error:', err);
      return null;
    }
  };

  /**
   * Save leaderboard data to cache
   */
  const setCachedLeaderboard = (players: LeaderboardPlayer[]): void => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(players));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
      console.log('[Leaderboard] Cache saved ✅');
    } catch (err) {
      console.warn('[Leaderboard] Cache write error:', err);
    }
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Step 1: Try to load from cache first
        const cachedPlayers = getCachedLeaderboard();
        if (cachedPlayers && cachedPlayers.length > 0) {
          setDisplayedPlayers(cachedPlayers.slice(0, INITIAL_LOAD));
          setAllPlayers(cachedPlayers);
          setHasMore(cachedPlayers.length > INITIAL_LOAD);
          console.log(`[Leaderboard] Displaying ${INITIAL_LOAD} cached players`);
        } else {
          // No cache, show loading
          setLoading(true);
        }

        // Step 2: Fetch fresh data in background
        setIsFetchingFresh(true);
        console.log('[Leaderboard] Fetching fresh data...');

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, display_name, photo_url, coins, win_rate')
          .order('coins', { ascending: false })
          .limit(1000); // Fetch all for caching

        if (fetchError) {
          console.error('[Leaderboard] Supabase error:', fetchError);
          throw fetchError;
        }

        const mappedData = mapPlayers(data || []);
        
        // Update state with fresh data
        setAllPlayers(mappedData);
        setDisplayedPlayers(mappedData.slice(0, INITIAL_LOAD));
        setHasMore(mappedData.length > INITIAL_LOAD);
        
        // Save to cache
        setCachedLeaderboard(mappedData);
        
        console.log(`[Leaderboard] ✅ Fresh data loaded: ${mappedData.length} players`);
      } catch (err: any) {
        console.error('[Leaderboard] Error fetching:', err.message);
        if (!allPlayers.length) {
          // Only show error if no cached data
          setError(`Failed to load leaderboard: ${err.message}`);
        }
      } finally {
        setLoading(false);
        setIsFetchingFresh(false);
      }
    };

    loadLeaderboard();
  }, []);

  const mapPlayers = (data: any[]): LeaderboardPlayer[] => {
    return data.map((player: any) => ({
      id: player.id,
      displayName: player.display_name || 'Unknown',
      photoURL: player.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(player.display_name || player.id)}`,
      coins: player.coins || 0,
      winRate: player.win_rate || 0,
    }));
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      
      const offset = displayedPlayers.length;
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url, coins, win_rate')
        .order('coins', { ascending: false })
        .range(offset, offset + LOAD_MORE_COUNT);

      if (fetchError) throw fetchError;

      const newPlayers = mapPlayers(data || []);
      const updatedDisplayed = [...displayedPlayers, ...newPlayers];
      
      setDisplayedPlayers(updatedDisplayed);
      setHasMore(newPlayers.length === LOAD_MORE_COUNT + 1);
      
      console.log(`[Leaderboard] Loaded ${newPlayers.length} more players`);
    } catch (err: any) {
      console.error('[Leaderboard] Error loading more:', err.message);
      setError('Failed to load more players');
    } finally {
      setLoadingMore(false);
    }
  };

  const colors = {
    dark: '#000000',
    cardBg: '#111111',
    primary: '#00FFB2',
    accent: '#FF7A00',
    muted: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(0, 255, 178, 0.2)',
  };

  const top3 = displayedPlayers.slice(0, 3);
  const restPlayers = displayedPlayers.slice(3);

  return (
    <div style={{ padding: '20px 16px 100px 16px', backgroundColor: colors.dark, minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Trophy size={28} color={colors.accent} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: colors.primary }}>LEADERBOARD</h1>
        </div>
        {/* <p style={{ fontSize: '12px', color: colors.muted, margin: '10px 0 0 0' }}>
          {isFetchingFresh && <span>.</span>}
        </p> */}
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: colors.muted }}>
          {/* <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '12px' }}>
            ⚙️
          </div> */}
          <p>Loading leaderboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error && displayedPlayers.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#FF5252' }}>
          <p>{error}</p>
        </div>
      ) : displayedPlayers.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: colors.muted }}>
          <p>No players found yet. Be the first!</p>
        </div>
      ) : (
        <>
          {/* Podium Section - Top 3 */}
          {top3.length > 0 && (
            <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '16px',
                height: '280px',
                maxWidth: '420px',
                paddingTop: '200px',
              }}>
                {/* 2nd Place */}
                {top3[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100px',
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <img
                        src={top3[1].photoURL}
                        width="56"
                        height="56"
                        style={{
                          borderRadius: '50%',
                          border: `2px solid ${colors.accent}`,
                          marginBottom: '8px',
                          marginLeft: '1px',
                          objectFit: 'cover',
                        }}
                        alt={top3[1].displayName}
                        loading="lazy"
                        decoding="async"
                      />
                      <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0', color: '#FFFFFF' }}>
                        {top3[1].displayName}
                      </p>
                      <p style={{ fontSize: '10px', color: colors.muted, margin: '2px 0 0 0' }}>
                        🪙 {top3[1].coins.toLocaleString()}
                      </p>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '140px',
                      backgroundColor: colors.accent,
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#000000',
                    }}>
                      2
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '120px',
                    }}
                  >
                    <img
                      src={top3[0].photoURL}
                      width="64"
                      height="64"
                      style={{
                        borderRadius: '50%',
                        border: '3px solid #FFD700',
                        marginBottom: '8px',
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                        objectFit: 'cover',
                      }}
                      alt={top3[0].displayName}
                      loading="lazy"
                      decoding="async"
                    />
                    <Crown size={20} color="#FFD700" fill="#FFD700" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0', color: '#FFD700' }}>
                      {top3[0].displayName}
                    </p>
                    <p style={{ fontSize: '10px', color: colors.muted, margin: '2px 0 0 0' }}>
                      🪙 {top3[0].coins.toLocaleString()}
                    </p>
                    <div style={{
                      width: '100%',
                      height: '180px',
                      backgroundColor: colors.primary,
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '56px',
                      fontWeight: 'bold',
                      color: '#000000',
                      marginTop: '8px',
                    }}>
                      1
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100px',
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <img
                        src={top3[2].photoURL}
                        width="56"
                        height="56"
                        style={{
                          borderRadius: '50%',
                          border: '2px solid #CD7F32',
                          marginBottom: '8px',
                          marginLeft: '1px',
                          objectFit: 'cover',
                        }}
                        alt={top3[2].displayName}
                        loading="lazy"
                        decoding="async"
                      />
                      <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0', color: '#FFFFFF' }}>
                        {top3[2].displayName}
                      </p>
                      <p style={{ fontSize: '10px', color: colors.muted, margin: '2px 0 0 0' }}>
                        🪙 {top3[2].coins.toLocaleString()}
                      </p>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '100px',
                      backgroundColor: '#CD7F32',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#000000',
                    }}>
                      3
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Rest of Leaderboard Table */}
          {restPlayers.length > 0 && (
            <div style={{
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}>
              {/* Table Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 100px',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(0, 255, 178, 0.08)',
                  borderBottom: `1px solid ${colors.border}`,
                  fontSize: '11px',
                  fontWeight: '600',
                  color: colors.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <span>Rank</span>
                <span>Player</span>
                <span style={{ textAlign: 'right' }}>Coins</span>
              </div>

              {/* Table Rows */}
              {restPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 3) * 0.05 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr 100px',
                    padding: '14px 16px',
                    borderBottom: index < restPlayers.length - 1 ? `0.5px solid ${colors.border}` : 'none',
                    alignItems: 'center',
                    backgroundColor: player.id === user?.id ? 'rgba(0, 255, 178, 0.06)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: player.id === user?.id ? colors.primary : colors.muted,
                    }}
                  >
                    {index + 4}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={player.photoURL}
                      width="40"
                      height="40"
                      style={{
                        borderRadius: '50%',
                        backgroundColor: '#222',
                        border: player.id === user?.id ? `1px solid ${colors.primary}` : 'none',
                        objectFit: 'cover',
                      }}
                      alt={player.displayName}
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          margin: '0',
                          color: player.id === user?.id ? colors.primary : '#FFFFFF',
                        }}
                      >
                        {player.displayName}
                        {player.id === user?.id && ' (You)'}
                      </p>
                      <p
                        style={{
                          fontSize: '11px',
                          color: colors.muted,
                          margin: '2px 0 0 0',
                        }}
                      >
                        {player.winRate || 0}% Win Rate
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.primary,
                    }}
                  >
                    🪙 {player.coins.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  padding: '12px 32px',
                  backgroundColor: loadingMore ? 'rgba(0, 255, 178, 0.5)' : colors.primary,
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  opacity: loadingMore ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {loadingMore ? 'Loading...' : 'Load More Players'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
