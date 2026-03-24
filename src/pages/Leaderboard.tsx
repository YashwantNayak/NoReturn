import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'motion/react';

const Leaderboard: React.FC = () => {
  const { user } = useAppContext();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalLeaderboard = async () => {
      try {
        // Dummy data for demonstration
        const dummyData = [
          {
            id: '1',
            displayName: 'codyfisher',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=codyfisher',
            coins: 5413,
            winRate: 51.24,
            initialCoins: 1000,
          },
          {
            id: '2',
            displayName: 'floydmiles',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=floydmiles',
            coins: 3241,
            winRate: 51.24,
            initialCoins: 1000,
          },
          {
            id: '3',
            displayName: 'jacobjones',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jacobjones',
            coins: 2856,
            winRate: 51.24,
            initialCoins: 1000,
          },
          {
            id: '4',
            displayName: 'Crosszero',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=crosszero1',
            coins: 2342,
            winRate: 48.6,
            initialCoins: 1000,
          },
          {
            id: '5',
            displayName: 'shadowNinja',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadowNinja',
            coins: 1956,
            winRate: 50.2,
            initialCoins: 1000,
          },
          {
            id: '6',
            displayName: 'thunderStrike',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thunderStrike',
            coins: 1723,
            winRate: 49.8,
            initialCoins: 1000,
          },
          {
            id: '7',
            displayName: 'vortexForce',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vortexForce',
            coins: 1542,
            winRate: 47.3,
            initialCoins: 1000,
          },
          {
            id: '8',
            displayName: 'phoenixRise',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phoenixRise',
            coins: 1234,
            winRate: 52.1,
            initialCoins: 1000,
          },
          {
            id: '9',
            displayName: 'eclipseShadow',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eclipseShadow',
            coins: 980,
            winRate: 46.5,
            initialCoins: 1000,
          },
          {
            id: '10',
            displayName: 'titanForce',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=titanForce',
            coins: 756,
            winRate: 49.2,
            initialCoins: 1000,
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setGlobalLeaderboard(dummyData);
          setLoading(false);
        }, 300);

        /* Uncomment below to use real Firestore data
        const q = query(collection(db, 'users'), orderBy('coins', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        setGlobalLeaderboard(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
        */
      } catch (error) {
        // TODO: Replace with Supabase error handling
        console.error('Error loading leaderboard:', error);
        setLoading(false);
      }
    };

    fetchGlobalLeaderboard();
  }, []);

  const colors = {
    dark: '#000000',
    cardBg: '#111111',
    primary: '#00FFB2',
    accent: '#FF7A00',
    muted: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(0, 255, 178, 0.2)',
  };

  const getNetWinning = (player: any) => {
    return (player.coins - (player.initialCoins || 1000)) || 0;
  };

  const getNetWinningColor = (value: number) => {
    return value >= 0 ? colors.primary : '#FF5252';
  };

  const top3 = globalLeaderboard.slice(0, 3);
  const restPlayers = globalLeaderboard.slice(3);

  return (
    <div style={{ padding: '20px 16px', backgroundColor: colors.dark, minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Trophy size={28} color={colors.accent} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: colors.primary }}>LEADERBOARD</h1>
        </div>
        <p style={{ fontSize: '0px', color: colors.muted, margin: '10px 0 0 0' }}>.</p>
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: colors.muted }}>Loading leaderboard...</div>
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
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundImage: `url(${top3[1].photoURL})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: `2px solid ${colors.accent}`,
                        margin: '0 auto 8px',
                      }} />
                      <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0', color: '#FFFFFF' }}>
                        {top3[1].displayName}
                      </p>
                      <p style={{ fontSize: '10px', color: colors.muted, margin: '2px 0 0 0' }}>
                        {top3[1].winRate || 0}%
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
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundImage: `url(${top3[0].photoURL})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: `3px solid #FFD700`,
                      marginBottom: '8px',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                    }} />
                    <Crown size={24} color="#FFD700" fill="#FFD700" style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0', color: '#FFD700' }}>
                      {top3[0].displayName}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.muted, margin: '2px 0 0 0' }}>
                      {top3[0].winRate || 0}%
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
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundImage: `url(${top3[2].photoURL})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: `2px solid #CD7F32`,
                        margin: '0 auto 8px',
                      }} />
                      <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0', color: '#FFFFFF' }}>
                        {top3[2].displayName}
                      </p>
                      <p style={{ fontSize: '10px', color: colors.muted, margin: '2px 0 0 0' }}>
                        {top3[2].winRate || 0}%
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 90px 120px',
                padding: '14px 16px',
                backgroundColor: 'rgba(0, 255, 178, 0.08)',
                borderBottom: `1px solid ${colors.border}`,
                fontSize: '11px',
                fontWeight: '600',
                color: colors.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                <span>Rank</span>
                <span>User</span>
                <span style={{ textAlign: 'right' }}>Win %</span>
                <span style={{ textAlign: 'right' }}>Net Win (₹)</span>
              </div>

              {/* Table Rows */}
              {restPlayers.map((player, index) => {
                const netWinning = getNetWinning(player);
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.05 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '50px 1fr 90px 120px',
                      padding: '14px 16px',
                      borderBottom: index < restPlayers.length - 1 ? `0.5px solid ${colors.border}` : 'none',
                      alignItems: 'center',
                      backgroundColor: player.id === user?.uid ? 'rgba(0, 255, 178, 0.06)' : 'transparent',
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: player.id === user?.uid ? colors.primary : colors.muted,
                    }}>
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
                          border: player.id === user?.uid ? `1px solid ${colors.primary}` : 'none',
                        }}
                        alt=""
                      />
                      <div>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          margin: '0',
                          color: player.id === user?.uid ? colors.primary : '#FFFFFF',
                        }}>
                          {player.displayName}
                          {player.id === user?.uid && ' (You)'}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'right',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.accent,
                    }}>
                      {player.winRate || 0}%
                    </div>

                    <div style={{
                      textAlign: 'right',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: getNetWinningColor(netWinning),
                    }}>
                      {netWinning >= 0 ? '+' : ''}{netWinning.toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
