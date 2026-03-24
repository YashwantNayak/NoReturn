import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Coins } from 'lucide-react';

interface InningsEndPhaseProps {
  matchName: string;
  inningsResult: string;
  targetScore: number;
  players?: Array<{ name: string; stat: string; odds: number }>;
  onBetAdded?: (bet: any) => void;
}

const InningsEndPhase: React.FC<InningsEndPhaseProps> = ({
  matchName,
  inningsResult = 'MI — 182/4 (20 ov)',
  targetScore = 183,
  players = [
    { name: 'Rohit Sharma', stat: '4.5 Avg', odds: 2.8 },
    { name: 'Hardik Pandya', stat: '3.2 Avg', odds: 2.5 },
    { name: 'Sky', stat: '3.8 Avg', odds: 2.3 },
    { name: 'Bumrah', stat: '1.2 Avg', odds: 3.5 },
  ],
  onBetAdded,
}) => {
  const { user } = useAppContext();
  const [selectedBets, setSelectedBets] = useState<Record<string, string>>({});
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [hoveredMom, setHoveredMom] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [showBetSlip, setShowBetSlip] = useState(false);

  // Color palette
  const colors = {
    dark: '#000000',
    cardBg: '#111111',
    border: 'rgba(0, 255, 178, 0.2)',
    accent: '#FF7A00',
    muted: 'rgba(255, 255, 255, 0.5)',
    blue: '#00FFB2',
    green: '#1B5E20',
  };

  // Style helpers
  const topBarStyle = {
    background: '#111111',
    padding: '7px 12px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  };

  const inningsBarStyle = {
    background: colors.green,
    padding: '10px 12px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    fontSize: '18px',
    fontWeight: '500' as const,
    color: '#fff',
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

  const momCardStyle = (playerName: string, isSelected: boolean) => ({
    background: isSelected ? 'rgba(255, 122, 0, 0.1)' : colors.cardBg,
    border: isSelected ? `1px solid ${colors.accent}` : `0.5px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '8px',
    transition: 'all 0.15s',
  });

  const handlePillClick = (category: string, value: string) => {
    setSelectedBets((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value,
    }));
  };

  const handleMomClick = (playerName: string) => {
    setSelectedBets((prev) => ({
      ...prev,
      mom: prev.mom === playerName ? '' : playerName,
    }));
  };

  const handlePlaceBet = async () => {
    if (Object.keys(selectedBets).length === 0) return;

    try {
      if (onBetAdded) {
        onBetAdded({
          type: 'innings-end',
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

  const chaseOptions = [
    { label: 'Yes', odds: 2.5 },
    { label: 'No', odds: 1.7 },
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

      {/* Innings Result Bar */}
      <div style={inningsBarStyle}>
        <span>{inningsResult}</span>
        <span>Target: {targetScore}</span>
      </div>
      <div style={{ paddingBottom: '60px' }}>
        {/* Section 1: Can Chase */}
        <div style={sectionStyle}>
          <h3 style={secTitleStyle}>Can CSK chase {targetScore}?</h3>
          <div style={pillsRow}>
            {chaseOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handlePillClick('chase', option.label)}
                onMouseEnter={() => setHoveredPill(`chase-${option.label}`)}
                onMouseLeave={() => setHoveredPill(null)}
                style={{
                  ...pillStyle(
                    `chase-${option.label}`,
                    selectedBets.chase === option.label
                  ),
                } as React.CSSProperties}
              >
                {option.odds.toFixed(1)}x {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Man of the Match */}
        <div style={sectionStyle}>
          <h3 style={secTitleStyle}>Man of the Match?</h3>
          <div
            style={{
              display: 'grid' as const,
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            {players.map((player) => (
              <button
                key={player.name}
                onClick={() => handleMomClick(player.name)}
                onMouseEnter={() => setHoveredMom(player.name)}
                onMouseLeave={() => setHoveredMom(null)}
                style={{
                  ...momCardStyle(player.name, selectedBets.mom === player.name),
                } as React.CSSProperties}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.muted }}>
                    {player.stat}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' as const }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: colors.blue,
                    }}
                  >
                    {player.odds.toFixed(1)}x
                  </div>
                </div>
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

export default InningsEndPhase;
