import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Coins, Clock } from 'lucide-react';

interface NextOverPhaseProps {
  matchName: string;
  score: string;
  currentOver: number;
  timeRemaining: number;
  currentOdds?: Record<string, number>;
  onBetAdded?: (bet: any) => void;
}

const NextOverPhase: React.FC<NextOverPhaseProps> = ({
  matchName,
  score,
  currentOver = 13,
  timeRemaining = 45,
  currentOdds = {},
  onBetAdded,
}) => {
  const { user } = useAppContext();
  const [selectedBets, setSelectedBets] = useState<Record<string, string>>({});
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [oddChanges, setOddChanges] = useState<Record<string, 'up' | 'down' | null>>({});
  const [countdown, setCountdown] = useState(timeRemaining);

  // Color palette
  const colors = {
    dark: '#000000',
    cardBg: '#111111',
    border: 'rgba(0, 255, 178, 0.2)',
    accent: '#FF7A00',
    muted: 'rgba(255, 255, 255, 0.5)',
    blue: '#00FFB2',
    green: '#4CAF50',
    red: '#F44336',
  };

  // Track odds changes
  useEffect(() => {
    const newChanges: Record<string, 'up' | 'down' | null> = {};
    Object.keys(currentOdds).forEach((key) => {
      const prevOdds = localStorage.getItem(`odds_${key}`);
      const currentValue = currentOdds[key];
      if (prevOdds && parseFloat(prevOdds) !== currentValue) {
        newChanges[key] = parseFloat(prevOdds) < currentValue ? 'up' : 'down';
        setTimeout(() => setOddChanges({}), 900);
      }
      localStorage.setItem(`odds_${key}`, currentValue.toString());
    });
    setOddChanges(newChanges);
  }, [currentOdds]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Style helpers
  const topBarStyle = {
    background: '#000000',
    padding: '7px 12px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  };

  const timerBarStyle = {
    background: '#111111',
    padding: '10px 12px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    borderTop: `0.5px solid ${colors.border}`,
    fontSize: '11px',
    color: colors.blue,
  };

  const sectionStyle = {
    padding: '14px 12px',
    borderTop: `0.5px solid ${colors.border}`,
  };

  const secTitleStyle = {
    fontSize: '18px',
    fontWeight: '500' as const,
    color: '#fff',
    marginBottom: '12px',
  };

  const pillsRow = {
    display: 'flex' as const,
    gap: '10px',
    flexWrap: 'wrap' as const,
  };

  const pillStyle = (id: string, isSelected: boolean, flashColor?: string) => ({
    padding: '10px 14px',
    borderRadius: '6px',
    border: isSelected
      ? `0.5px solid ${colors.accent}`
      : hoveredPill === id
        ? `0.5px solid ${colors.blue}`
        : `0.5px solid rgba(255, 255, 255, 0.1)`,
    fontSize: '13px',
    fontWeight: '500' as const,
    cursor: 'pointer' as const,
    color: isSelected ? '#fff' : colors.blue,
    background: flashColor
      ? flashColor === 'up'
        ? colors.green
        : colors.red
      : isSelected
        ? colors.accent
        : colors.cardBg,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  const handlePillClick = (category: string, value: string) => {
    setSelectedBets((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  const handlePlaceBet = async () => {
    if (Object.keys(selectedBets).length === 0) return;

    try {
      if (onBetAdded) {
        onBetAdded({
          type: 'next-over',
          over: currentOver,
          predictions: selectedBets,
          amount: betAmount,
          timestamp: new Date(),
        });
      }
      setSelectedBets({});
      setBetAmount(100);
      setShowBetSlip(false);
      alert('Bet placed successfully!');
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet');
    }
  };

  const runsOptions = [
    { label: '0–5', oddKey: 'runs_0_5', defaultOdd: 2.5 },
    { label: '6–9', oddKey: 'runs_6_9', defaultOdd: 2.8 },
    { label: '10–13', oddKey: 'runs_10_13', defaultOdd: 3.5 },
    { label: '14+', oddKey: 'runs_14_plus', defaultOdd: 5.0 },
  ];

  const wicketOptions = [
    { label: 'Yes', oddKey: 'wicket_yes', defaultOdd: 2.2 },
    { label: 'No', oddKey: 'wicket_no', defaultOdd: 1.9 },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100%',
        backgroundColor: colors.dark,
      }}
    >
      {/* Top Bar */}
      <div style={topBarStyle}>
        <span style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>
          {matchName} • {score}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.blue }}>
          <Coins size={14} /> {user?.coins.toLocaleString() || 0}
        </div>
      </div>

      {/* Timer Bar */}
      <div style={timerBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF7A00' }} />
          <span>Over {currentOver} complete — window open</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={12} />
          <span>{formatTime(countdown)}</span>
        </div>
      </div>
      <div style={{ paddingBottom: '60px' }}>
        {/* Section 1: Runs in This Over */}
        <div style={sectionStyle}>
          <h3 style={secTitleStyle}>Over {currentOver} — How many runs?</h3>
          <div style={pillsRow}>
              {runsOptions.map((option) => {
                const oddValue = currentOdds[option.oddKey] || option.defaultOdd;
                const flash = oddChanges[option.oddKey];
                return (
                  <button
                    key={option.label}
                    onClick={() => handlePillClick('runs', option.label)}
                    onMouseEnter={() => setHoveredPill(`runs-${option.label}`)}
                    onMouseLeave={() => setHoveredPill(null)}
                    style={{
                      ...pillStyle(
                        `runs-${option.label}`,
                        selectedBets.runs === option.label,
                        flash
                      ),
                    } as React.CSSProperties}
                  >
                    {oddValue.toFixed(1)}x {option.label}
                  </button>
                );
              })}
            </div>
        </div>

        {/* Section 2: Wicket This Over */}
        <div style={sectionStyle}>
          <h3 style={secTitleStyle}>Wicket this over?</h3>
          <div style={pillsRow}>
              {wicketOptions.map((option) => {
                const oddValue = currentOdds[option.oddKey] || option.defaultOdd;
                const flash = oddChanges[option.oddKey];
                return (
                  <button
                    key={option.label}
                    onClick={() => handlePillClick('wicket', option.label)}
                    onMouseEnter={() => setHoveredPill(`wicket-${option.label}`)}
                    onMouseLeave={() => setHoveredPill(null)}
                    style={{
                      ...pillStyle(
                        `wicket-${option.label}`,
                        selectedBets.wicket === option.label,
                        flash
                      ),
                    } as React.CSSProperties}
                  >
                    {oddValue.toFixed(1)}x {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bet Slip Bar (Bottom) */}
        {Object.keys(selectedBets).length > 0 && (
          <button
            onClick={() => setShowBetSlip(true)}
            style={{
              background: colors.accent,
              border: 'none',
              padding: '12px',
              textAlign: 'center' as const,
              color: '#000',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '0',
            }}
          >
            PLACE BET ({Object.keys(selectedBets).length} selected)
          </button>
        )}

      {/* Bet Slip Modal */}
      {showBetSlip && (
        <div
          style={{
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowBetSlip(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.cardBg,
              borderRadius: '12px',
              padding: '20px',
              width: '90%',
              maxWidth: '300px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3 style={{ color: colors.blue, marginTop: 0 }}>Confirm Bet</h3>
            <div style={{ color: '#fff', fontSize: '12px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Over:</strong> {currentOver}
              </div>
              {Object.entries(selectedBets).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '8px' }}>
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>

            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '12px',
                background: colors.dark,
                border: `0.5px solid ${colors.border}`,
                borderRadius: '6px',
                color: colors.blue,
                boxSizing: 'border-box',
              }}
              placeholder="Bet amount"
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowBetSlip(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: colors.dark,
                  border: `0.5px solid ${colors.border}`,
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceBet}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: colors.accent,
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextOverPhase;
