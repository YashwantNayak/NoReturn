import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Coins } from 'lucide-react';

interface PreMatchPhaseProps {
  matchName: string;
  onBetAdded?: (bet: any) => void;
}

const PreMatchPhase: React.FC<PreMatchPhaseProps> = ({ matchName, onBetAdded }) => {
  const { user } = useAppContext();
  const [selectedBets, setSelectedBets] = useState<Record<string, string>>({});
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [selectedBetForSlip, setSelectedBetForSlip] = useState<any>(null);

  // Color palette
  const colors = {
    dark: '#000000',
    cardBg: '#111111',
    border: 'rgba(0, 255, 178, 0.2)',
    accent: '#FF7A00',
    muted: 'rgba(255, 255, 255, 0.5)',
    blue: '#00FFB2',
  };

  // Style helpers
  const topBarStyle = {
    background: '#111111',
    padding: '7px 12px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
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

  const pillStyle = (id: string, isSelected: boolean) => ({
    padding: '10px 14px',
    borderRadius: '6px',
    border: isSelected
      ? `0.5px solid ${colors.accent}`
      : hoveredPill === id
        ? `0.5px solid ${colors.blue}`
        : `0.5px solid rgba(255, 255, 255, 0.1)`,
    fontSize: '16px',
    fontWeight: '500' as const,
    cursor: 'pointer' as const,
    color: isSelected ? '#fff' : colors.blue,
    background: isSelected ? colors.accent : colors.cardBg,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  const teamCardStyle = (id: string, isSelected: boolean) => ({
    flex: 1,
    background: isSelected ? 'rgba(255, 122, 0, 0.1)' : colors.cardBg,
    border: isSelected ? `1px solid ${colors.accent}` : `0.5px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center' as const,
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
  });

  const handlePillClick = (category: string, value: string) => {
    setSelectedBets((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  const handleTeamSelect = (category: string, team: string) => {
    setSelectedBets((prev) => ({
      ...prev,
      [category]: prev[category] === team ? '' : team,
    }));
  };

  const handlePlaceBet = async () => {
    if (Object.keys(selectedBets).length === 0 || !selectedBetForSlip) return;

    try {
      if (onBetAdded) {
        onBetAdded({
          type: 'pre-match',
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

  const teams = ['MI', 'CSK'];
  const runsOptions = [
    { label: '0–5', odds: '2.5' },
    { label: '6–9', odds: '2.0' },
    { label: '10+', odds: '3.5' },
  ];

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
        <span style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>
          {matchName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: colors.blue }}>
          <Coins size={14} /> {user?.coins.toLocaleString() || 0}
        </div>
      </div>
      {/* Scrollable Content */}
      <div style={{ paddingBottom: '100px' }}>
        {/* Section 1: Match Winner */}
        <div style={sectionStyle}>
          <h2 style={secTitleStyle}>Match winner?</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => handleTeamSelect('matchWinner', team)}
                  style={{
                    ...teamCardStyle(`mw-${team}`, selectedBets.matchWinner === team),
                  } as React.CSSProperties}
                >
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                    {team}
                  </div>
                </button>
              ))}
            </div>
        </div>

        {/* Section 2: Toss Winner */}
        <div style={sectionStyle}>
          <h3 style={secTitleStyle}>Toss winner?</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => handleTeamSelect('tossWinner', team)}
                  style={{
                    ...teamCardStyle(`tw-${team}`, selectedBets.tossWinner === team),
                  } as React.CSSProperties}
                >
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                    {team}
                  </div>
                </button>
              ))}
            </div>
        </div>

        {/* Section 3: Runs in Over 1 */}
        <div style={sectionStyle}>
          <h3 style={secTitleStyle}>Runs in over 1?</h3>
          <div style={pillsRow}>
              {runsOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handlePillClick('runsOver1', option.label)}
                  onMouseEnter={() => setHoveredPill(`ro1-${option.label}`)}
                  onMouseLeave={() => setHoveredPill(null)}
                  style={{
                    ...pillStyle(
                      `ro1-${option.label}`,
                      selectedBets.runsOver1 === option.label
                    ),
                  } as React.CSSProperties}
                >
                  {option.odds}x {option.label}
                </button>
              ))}
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

export default PreMatchPhase;
