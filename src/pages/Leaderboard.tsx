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
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[Leaderboard] Fetching from profiles table...');

        // Fetch from profiles table with snake_case column names
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, display_name, photo_url, coins, win_rate')
          .order('coins', { ascending: false })
          .limit(50);

        if (fetchError) {
          console.error('[Leaderboard] Supabase error:', fetchError);
          throw fetchError;
        }

        console.log('[Leaderboard] Fetched data:', data);

        // Map database fields to component interface (snake_case → camelCase)
        if (data && data.length > 0) {
          const mappedData: LeaderboardPlayer[] = data.map((player: any) => ({
            id: player.id,
            displayName: player.display_name || 'Unknown',
            photoURL: player.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.display_name}`,
            coins: player.coins || 0,
            winRate: player.win_rate || 0,
          }));
          setLeaderboard(mappedData);
          console.log('[Leaderboard] Mapped data:', mappedData);
        } else {
          console.log('[Leaderboard] No data from database');
          setLeaderboard([]);
        }
      } catch (err: any) {
        console.error('[Leaderboard] Error fetching:', err);
        console.error('[Leaderboard] Error message:', err.message);
        setError(`Failed to load leaderboard: ${err.message}`);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const colors = {
    dark: '#000000',
    cardBg: '#111111',
    primary: '#00FFB2',
    accent: '#FF7A00',
    muted: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(0, 255, 178, 0.2)',
  };

  const top3 = leaderboard.slice(0, 3);
  const restPlayers = leaderboard.slice(3);

  return (
    <div style={{ padding: '20px 16px 100px 16px', backgroundColor: colors.dark, minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Trophy size={28} color={colors.accent} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: colors.primary }}>LEADERBOARD</h1>
        </div>
        <p style={{ fontSize: '12px', color: colors.muted, margin: '10px 0 0 0' }}>.</p>
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: colors.muted }}>
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#FF5252' }}>
          <p>{error}</p>
        </div>
      ) : leaderboard.length === 0 ? (
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
        </>
      )}
    </div>
  );
};

export default Leaderboard;
