import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useMatch } from '../context/MatchContext';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Zap, Check, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Betting: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAppContext();
  const { liveMatch, isLoading: matchLoading, error: matchError } = useMatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pre-match' | 'powerplay' | 'next-over' | 'innings'>('next-over');
  const [selectedBet, setSelectedBet] = useState<any>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [loading, setLoading] = useState(false);

  // Generate betting options dynamically based on liveMatch (reactive like Home.tsx)
  const getBettingOptions = () => {
    if (!liveMatch) {
      return {
        'pre-match': [
          { id: 'pm1', title: 'Match Winner', options: ['Team 1', 'Team 2'], multiplier: 1.8 },
          { id: 'pm2', title: 'Toss Winner', options: ['Team 1', 'Team 2'], multiplier: 1.9 },
        ],
        'powerplay': [
          { id: 'pp1', title: 'Powerplay Runs', options: ['< 45', '45-55', '> 55'], multiplier: 2.5 },
          { id: 'pp2', title: 'Powerplay Wickets', options: ['0', '1', '2+'], multiplier: 3.0 },
        ],
        'next-over': [
          { id: 'no1', title: 'Runs in Next Over', options: ['0-5', '6-10', '11-15', '16+'], multiplier: 2.2 },
          { id: 'no2', title: 'Wicket in Next Over', options: ['Yes', 'No'], multiplier: 4.5 },
          { id: 'no3', title: 'Boundary in Next Over', options: ['Yes', 'No'], multiplier: 1.8 },
        ],
        'innings': [
          { id: 'in1', title: 'Total Innings Score', options: ['< 180', '180-200', '> 200'], multiplier: 2.0 },
          { id: 'in2', title: 'Highest Run Scorer', options: ['Rohit', 'Hardik', 'Sky'], multiplier: 3.5 },
        ]
      };
    }

    // LIVE DATA - Use actual team names from database
    return {
      'pre-match': [
        { id: 'pm1', title: 'Match Winner', options: [liveMatch.team1_sname, liveMatch.team2_sname], multiplier: 1.8 },
        { id: 'pm2', title: 'Toss Winner', options: [liveMatch.team1_sname, liveMatch.team2_sname], multiplier: 1.9 },
      ],
      'powerplay': [
        { id: 'pp1', title: 'Powerplay Runs', options: ['< 45', '45-55', '> 55'], multiplier: 2.5 },
        { id: 'pp2', title: 'Powerplay Wickets', options: ['0', '1', '2+'], multiplier: 3.0 },
      ],
      'next-over': [
        { id: 'no1', title: 'Runs in Next Over', options: ['0-5', '6-10', '11-15', '16+'], multiplier: 2.2 },
        { id: 'no2', title: 'Wicket in Next Over', options: ['Yes', 'No'], multiplier: 4.5 },
        { id: 'no3', title: 'Boundary in Next Over', options: ['Yes', 'No'], multiplier: 1.8 },
      ],
      'innings': [
        { id: 'in1', title: 'Total Innings Score', options: ['< 180', '180-200', '> 200'], multiplier: 2.0 },
        { id: 'in2', title: 'Highest Run Scorer', options: ['Rohit', 'Hardik', 'Sky'], multiplier: 3.5 },
      ]
    };
  };

  const bettingOptions = getBettingOptions();

  // Debug - console log liveMatch on every render
  console.log('[Betting] liveMatch:', {
    loading: matchLoading,
    team1: liveMatch?.team1_sname,
    team2: liveMatch?.team2_sname,
    score: `${liveMatch?.t1_inn1_runs}/${liveMatch?.t1_inn1_wickets}`,
    match: liveMatch?.match_desc,
  });

  const handlePlaceBet = async () => {
    if (!user || !roomId || !selectedBet || !betAmount) return;
    if (user.coins < betAmount) {
      alert('Insufficient coins!');
      return;
    }

    setLoading(true);
    try {
      const betData = {
        room_id: roomId,
        user_id: user.id,
        match_id: liveMatch?.match_id || 'unknown',
        type: activeTab,
        prediction: selectedBet.option,
        multiplier: selectedBet.multiplier,
        amount: betAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      // Insert bet into Supabase
      const { error: betError } = await supabase
        .from('bets')
        .insert([betData]);

      if (betError) throw betError;

      // Update user's coins in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: user.coins - betAmount })
        .eq('id', user.id);

      if (updateError) throw updateError;

      alert('Bet placed successfully!');
      setSelectedBet(null);
    } catch (error) {
      console.error('Error placing bet', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: '12px 20px',
    backgroundColor: activeTab === tab ? '#00FFB2' : 'rgba(255, 255, 255, 0.05)',
    color: activeTab === tab ? '#000000' : '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  });

  return (
    <div style={{ padding: 'clamp(16px, 5vw, 32px)', maxWidth: '800px', margin: '0 auto', color: '#FFFFFF' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate(`/room/${roomId}`)}
          style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={20} /> Back to Room
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', backgroundColor: 'rgba(255, 122, 0, 0.1)', border: '1px solid #FF7A00', borderRadius: '12px', color: '#FF7A00', fontWeight: 'bold' }}>
          <Coins size={20} /> {user?.coins.toLocaleString()}
        </div>
      </header>

      {/* Live Match Score Card */}
      {!matchLoading && liveMatch && (
        (() => {
          // Dynamic innings detection - check which innings has runs
          const team1Runs = liveMatch.t1_inn1_runs > 0 ? liveMatch.t1_inn1_runs : liveMatch.t1_inn2_runs;
          const team1Wickets = liveMatch.t1_inn1_runs > 0 ? liveMatch.t1_inn1_wickets : liveMatch.t1_inn2_wickets;
          const team1Overs = liveMatch.t1_inn1_runs > 0 ? liveMatch.t1_inn1_overs : liveMatch.t1_inn2_overs;

          const team2Runs = liveMatch.t2_inn1_runs > 0 ? liveMatch.t2_inn1_runs : liveMatch.t2_inn2_runs;
          const team2Wickets = liveMatch.t2_inn1_runs > 0 ? liveMatch.t2_inn1_wickets : liveMatch.t2_inn2_wickets;
          const team2Overs = liveMatch.t2_inn1_runs > 0 ? liveMatch.t2_inn1_overs : liveMatch.t2_inn2_overs;

          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'rgba(0, 255, 178, 0.08)',
                border: '1px solid rgba(0, 255, 178, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '0' }}>
                {/* Team 1 */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 6px 0', fontWeight: '500' }}>
                    {liveMatch.team1_sname}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00FFB2', margin: '0 0 4px 0' }}>
                    {team1Runs}/{team1Wickets}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    ({team1Overs} ov)
                  </p>
                </div>

                {/* Team 2 */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 6px 0', fontWeight: '500' }}>
                    {liveMatch.team2_sname}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: team2Runs > 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)', margin: '0 0 4px 0' }}>
                    {team2Runs > 0 ? `${team2Runs}/${team2Wickets}` : '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    {team2Runs > 0 ? `(${team2Overs} ov)` : 'Yet to bat'}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button onClick={() => setActiveTab('pre-match')} style={tabStyle('pre-match')}>Pre-Match</button>
        <button onClick={() => setActiveTab('powerplay')} style={tabStyle('powerplay')}>Powerplay</button>
        <button onClick={() => setActiveTab('next-over')} style={tabStyle('next-over')}>Next Over</button>
        <button onClick={() => setActiveTab('innings')} style={tabStyle('innings')}>Innings</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {bettingOptions[activeTab].map((bet) => (
          <div key={bet.id} style={{ 
            backgroundColor: '#111111', 
            borderRadius: '16px', 
            padding: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{bet.title}</h3>
              <span style={{ color: '#00FFB2', fontWeight: 'bold', fontSize: '14px' }}>x{bet.multiplier} Multiplier</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {bet.options.map((option) => (
                <button 
                  key={option}
                  onClick={() => setSelectedBet({ ...bet, option })}
                  style={{ 
                    padding: '12px 24px', 
                    borderRadius: '10px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    backgroundColor: selectedBet?.id === bet.id && selectedBet?.option === option ? '#00FFB2' : 'rgba(255, 255, 255, 0.02)', 
                    color: selectedBet?.id === bet.id && selectedBet?.option === option ? '#000000' : '#FFFFFF',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flex: 1,
                    minWidth: '100px'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedBet && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBet(null)}
              style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 99
              }}
            />
            
            {/* Popup */}
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ 
                position: 'fixed', 
                top: '25%',
                left: '4%',
                transform: 'translate(-50%, -50%)',
                width: 'calc(100% - 32px)',
                maxWidth: '420px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#111111', 
                padding: '24px', 
                borderRadius: '20px', 
                border: '2px solid #00FFB2',
                // boxShadow: '0 20px 60px rgba(0, 255, 178, 0.15)',
                zIndex: 100,
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(0, 255, 178, 0.2)' }}>
                <p style={{ fontSize: '10px', color: 'rgba(0, 255, 178, 0.6)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px 0', fontWeight: '600' }}>Your Prediction</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#00FFB2', margin: 0 }}>{selectedBet.option}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: '4px 0 0 0' }}>{selectedBet.title}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' }}>Multiplier</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF7A00', margin: 0 }}>x{selectedBet.multiplier}</p>
                  </div>
                </div>
              </div>

              {/* Win Amount Display */}
              <div style={{ 
                backgroundColor: 'rgba(0, 255, 178, 0.08)', 
                padding: '16px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                border: '1px solid rgba(0, 255, 178, 0.15)'
              }}>
                <p style={{ fontSize: '10px', color: 'rgba(0, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: '600' }}>If You Win</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00FFB2', margin: 0 }}>🪙 {(betAmount * selectedBet.multiplier).toLocaleString()}</p>
              </div>

              {/* Bet Amount Input */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>Bet Amount</label>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>Available: 🪙 {(user?.coins || 0).toLocaleString()}</span>
                </div>
                <input 
                  type="number" 
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                    border: '2px solid rgba(0, 255, 178, 0.3)', 
                    borderRadius: '10px', 
                    color: '#00FFB2',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#00FFB2')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(0, 255, 178, 0.3)')}
                  min="0"
                  max={user?.coins}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {[100, 500, 1000, 5000].map((amount) => (
                  <button 
                    key={amount}
                    onClick={() => setBetAmount(Math.min(amount, user?.coins || 0))}
                    style={{ 
                      padding: '12px 8px', 
                      borderRadius: '10px', 
                      border: betAmount === amount ? '2px solid #00FFB2' : '1px solid rgba(255, 255, 255, 0.15)', 
                      backgroundColor: betAmount === amount ? 'rgba(0, 255, 178, 0.15)' : 'rgba(255, 255, 255, 0.03)', 
                      color: betAmount === amount ? '#00FFB2' : '#FFFFFF',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onHover
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedBet(null)}
                  style={{ 
                    flex: 1, 
                    padding: '14px', 
                    borderRadius: '10px', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    color: '#FFFFFF', 
                    fontWeight: 'bold', 
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePlaceBet}
                  disabled={loading || (user?.coins || 0) < betAmount}
                  style={{ 
                    flex: 2, 
                    padding: '14px', 
                    borderRadius: '10px', 
                    border: 'none', 
                    backgroundColor: (user?.coins || 0) < betAmount ? '#333333' : '#00FFB2', 
                    color: (user?.coins || 0) < betAmount ? '#666666' : '#000000', 
                    fontWeight: 'bold', 
                    fontSize: '15px',
                    cursor: (user?.coins || 0) < betAmount ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Placing...' : <><Zap size={18} /> Lock Bet</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Betting;
