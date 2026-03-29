import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useMatch } from '../context/MatchContext';
import { PlayCircle, Trophy, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';

interface LeaderboardPlayer {
  id: string;
  displayName: string;
  photoURL: string;
  coins: number;
  winRate?: number;
}

const Home: React.FC = () => {
  const { user } = useAppContext();
  const { liveMatch, isLoading: matchLoading, error: matchError } = useMatch();
  const navigate = useNavigate();
  const [topPlayers, setTopPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        setLoadingLeaderboard(true);
        
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, display_name, photo_url, coins, win_rate')
          .order('coins', { ascending: false })
          .limit(3);

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          const mappedData: LeaderboardPlayer[] = data.map((player: any) => ({
            id: player.id,
            displayName: player.display_name || 'Unknown',
            photoURL: player.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.display_name}`,
            coins: player.coins || 0,
            winRate: player.win_rate || 0,
          }));
          setTopPlayers(mappedData);
        }
      } catch (error) {
        console.error('Error fetching top players:', error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchTopPlayers();
  }, []);

  if (!user) return null;

  return (
    <div style={{ padding: 'clamp(16px, 5vw, 32px)', maxWidth: '1200px', margin: '0 auto', color: '#FFFFFF', paddingBottom: 'clamp(32px, 5vw, 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 'bold', margin: '0 0 8px 0' }}>Hi {user.displayName} </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>Ready for today's IPL action?</p>
      </div>

      {/* Today's Live Match */}
      {matchLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(0, 255, 178, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #00FFB2',
            marginBottom: '40px',
            boxShadow: '0 0 30px rgba(0, 255, 178, 0.1)',
          }}
        >
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>Loading match data...</p>
          </div>
        </motion.div>
      ) : matchError ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255, 112, 112, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #FF5252',
            marginBottom: '40px',
            boxShadow: '0 0 30px rgba(255, 82, 82, 0.1)',
          }}
        >
          <div style={{ textAlign: 'center', color: '#FF5252' }}>
            <p>Error loading match: {matchError}</p>
          </div>
        </motion.div>
      ) : liveMatch ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(0, 255, 178, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #00FFB2',
            marginBottom: '40px',
            boxShadow: '0 0 30px rgba(0, 255, 178, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Flame size={20} color="#FF7A00" />
            <span 
              style={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                color: liveMatch.state === 'In Progress' ? '#FF7A00' : '#00FFB2'
              }}
            >
              {liveMatch.state === 'In Progress' ? 'LIVE NOW' : liveMatch.state}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#00FFB2', margin: '0 0 4px 0' }}>
              {liveMatch.team1_sname} vs {liveMatch.team2_sname}
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              {liveMatch.series_name}
            </p>
          </div>

          {/* Scores Section — Dynamic innings detection */}
          {(() => {
            // Team 1 actual score (check which innings has runs)
            const team1Runs = liveMatch.t1_inn1_runs > 0 ? liveMatch.t1_inn1_runs : liveMatch.t1_inn2_runs;
            const team1Wickets = liveMatch.t1_inn1_runs > 0 ? liveMatch.t1_inn1_wickets : liveMatch.t1_inn2_wickets;
            const team1Overs = liveMatch.t1_inn1_runs > 0 ? liveMatch.t1_inn1_overs : liveMatch.t1_inn2_overs;

            // Team 2 actual score (check which innings has runs)
            const team2Runs = liveMatch.t2_inn1_runs > 0 ? liveMatch.t2_inn1_runs : liveMatch.t2_inn2_runs;
            const team2Wickets = liveMatch.t2_inn1_runs > 0 ? liveMatch.t2_inn1_wickets : liveMatch.t2_inn2_wickets;
            const team2Overs = liveMatch.t2_inn1_runs > 0 ? liveMatch.t2_inn1_overs : liveMatch.t2_inn2_overs;

            const bothTeamsHaveZero = team1Runs === 0 && team2Runs === 0;

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {/* Team 1 Score */}
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 6px 0', fontWeight: '500' }}>
                    {liveMatch.team1_sname}
                  </p>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', color: team1Runs > 0 ? '#00FFB2' : 'rgba(255, 255, 255, 0.3)', margin: '0 0 2px 0' }}>
                    {team1Runs > 0 ? `${team1Runs}/${team1Wickets}` : '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    {team1Runs > 0 ? `(${team1Overs} ov)` : bothTeamsHaveZero ? 'Yet to bat' : 'Finished'}
                  </p>
                </div>

                {/* Team 2 Score */}
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 6px 0', fontWeight: '500' }}>
                    {liveMatch.team2_sname}
                  </p>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', color: team2Runs > 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)', margin: '0 0 2px 0' }}>
                    {team2Runs > 0 ? `${team2Runs}/${team2Wickets}` : '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    {team2Runs > 0 ? `(${team2Overs} ov)` : bothTeamsHaveZero ? 'Yet to bat' : 'Finished'}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Status Section */}
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontWeight: '500' }}>
              {liveMatch.state === 'In Progress' 
                ? `⚡ LIVE · ${liveMatch.t1_inn1_overs} overs`
                : liveMatch.state === 'Complete'
                ? liveMatch.status
                : liveMatch.status}
            </p>
          </div>

          <button 
            onClick={() => navigate('/global-room')}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#00FFB2',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <PlayCircle size={20} /> Join Live Betting
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(100, 100, 100, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '40px',
            boxShadow: '0 0 30px rgba(100, 100, 100, 0.1)',
          }}
        >
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>No live match at the moment. Stay tuned!</p>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>Your Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Coins</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#FF7A00', margin: 0 }}>🪙 {user?.coins.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Win Rate</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#00FFB2', margin: 0 }}>{user?.winRate || 0}%</p>
          </div>
          <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Streak</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>{user?.streak || 0} 🔥</p>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="#FFD700" /> Top Players Today
          </h2>
        </div>
        <div style={{ backgroundColor: '#111111', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {loadingLeaderboard ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
              <p>Loading top players...</p>
            </div>
          ) : topPlayers.length > 0 ? (
            <>
              {topPlayers.map((player, index) => {
                const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                return (
                  <div key={player.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: index < topPlayers.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: rankColors[index], width: '20px' }}>
                      {index + 1}
                    </span>
                    <img 
                      src={player.photoURL} 
                      alt={player.displayName}
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%',
                        border: `2px solid ${rankColors[index]}`,
                        objectFit: 'cover'
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>{player.displayName}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', margin: '2px 0 0 0' }}>Win Rate: {player.winRate || 0}%</p>
                    </div>
                    <p style={{ fontWeight: 'bold', color: '#00FFB2', fontSize: '14px', margin: 0 }}>🪙 {player.coins.toLocaleString()}</p>
                  </div>
                );
              })}
            </>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
              <p>No players found</p>
            </div>
          )}
          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: 'none',
              color: '#00FFB2',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            View Full Leaderboard
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
