# 🎰 NoReturn11 Betting System - Complete Plan

## Overview
The betting system is divided into **3 distinct phases** based on match progression. Each phase offers different betting opportunities with dynamic odds and multipliers.

---

## 📊 Phase Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BETTING PHASES                         │
├─────────────────────────────────────────────────────────┤
│ Phase 1: Pre-Match    │ Phase 2: Next Over │ Phase 3: Innings │
│                       │                     │                  │
│ Before match starts   │ During live play    │ After innings    │
│                       │                     │                  │
│ Static odds           │ Dynamic odds        │ Static odds      │
│ Team predictions      │ Over predictions    │ Chase/MOM bets   │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1️⃣: PRE-MATCH PHASE

**When:** Before the match starts  
**Component:** `PreMatchPhase.tsx`  
**UI:** Team selection buttons + runs prediction pills  

### Betting Options:

#### 1. **Match Winner** 🏆
- **Question:** "Who will win the match?"
- **Options:** Team 1 (MI) vs Team 2 (CSK)
- **Selection Type:** Toggle buttons
- **Odds:** Default 1.8x multiplier
- **Purpose:** Long-term team prediction

#### 2. **Toss Winner** 🪙
- **Question:** "Who wins the toss?"
- **Options:** Team 1 (MI) vs Team 2 (CSK)
- **Selection Type:** Toggle buttons
- **Odds:** Default 1.9x multiplier
- **Purpose:** Early match advantage prediction

#### 3. **Runs in Over 1** 📈
- **Question:** "How many runs in over 1?"
- **Options:**
  - `0-5 runs` (odds: 2.5x)
  - `6-9 runs` (odds: 2.0x)
  - `10+ runs` (odds: 3.5x)
- **Selection Type:** Pill buttons
- **Purpose:** Aggressive/cautious start prediction

### Pre-Match Phase Features:
- ✅ Multiple bets can be selected at once
- ✅ Coin display in top-right corner
- ✅ Bet slip modal for amount entry
- ✅ Real-time coin balance check
- ✅ Confirmation before placement

**User Flow:**
```
Select Bets → Enter Amount → Deduct Coins → Store in Database
```

---

## Phase 2️⃣: NEXT OVER PHASE (LIVE)

**When:** During active match play  
**Component:** `NextOverPhase.tsx`  
**UI:** Scrollable phase with real-time odds + countdown timer  

### Betting Options:

#### 1. **Runs in Next Over** 📊
- **Question:** "How many runs in over [X]?"
- **Options:**
  - `0-5 runs` (odds: 2.5x)
  - `6-9 runs` (odds: 2.8x)
  - `10-13 runs` (odds: 3.5x)
  - `14+ runs` (odds: 5.0x)
- **Selection Type:** Pill buttons
- **Dynamic Odds:** YES - odds update in real-time
- **Visual Indicator:** Green (↑ odds went up) / Red (↓ odds went down)
- **Purpose:** Live betting on current over

#### 2. **Wicket in Next Over** 🎯
- **Question:** "Will a wicket fall in next over?"
- **Options:**
  - `Yes` (odds: 2.2x)
  - `No` (odds: 1.9x)
- **Selection Type:** Binary choice
- **Dynamic Odds:** YES - adjusts based on match situation
- **Purpose:** High-tension betting during play

### Live Phase Unique Features:
- ⏱️ **Countdown Timer:** Shows seconds remaining to place bet
- 📡 **Real-time Odds Updates:** Odds change based on:
  - Current match situation
  - Player stats
  - Betting volume
- 🔄 **Odds Change Animation:** Flash green (up) or red (down) for 900ms
- 📍 **Location Indicator:** "Over [X] complete — window open"
- 💾 **Local Storage:** Previous odds tracked for change detection

**Odds Storage:**
```javascript
localStorage.setItem(`odds_${key}`, currentValue.toString())
```

**User Flow:**
```
View Live Stats → Check Odds → Select Prediction → Race Clock → Place Bet
```

---

## Phase 3️⃣: INNINGS END PHASE

**When:** After first innings completes  
**Component:** `InningsEndPhase.tsx`  
**UI:** Innings result bar + prediction pills + player cards  

### Betting Options:

#### 1. **Can Chase** 🎪
- **Question:** "Can [Team 2] chase [Target]?"
- **Target:** Displayed dynamically (e.g., "Can CSK chase 183?")
- **Options:**
  - `Yes` (odds: 2.5x)
  - `No` (odds: 1.7x)
- **Selection Type:** Binary choice
- **Purpose:** Second innings outcome prediction

#### 2. **Man of the Match** ⭐
- **Question:** "Who will be Man of the Match?"
- **Options:** Dynamic player list (typically 4-5 key players)
  - Example: Rohit Sharma, Hardik Pandya, Sky, Bumrah
- **Each Player Shows:**
  - Player name
  - Season average stat (e.g., "4.5 Avg")
  - Odds (e.g., 2.8x)
- **Selection Type:** Card buttons with hover effect
- **Purpose:** Individual performance prediction

### Innings End Phase Features:
- 🟢 **Green Innings Bar:** Shows completed innings result
  - Format: "MI — 182/4 (20 ov)"
  - Shows final score and wickets
- 📊 **Displayed Target:** Target for chasing team
- 🎴 **Player Cards:** Hover reveal odds
- ✅ Single selection from player list (MOM is exclusive)

**User Flow:**
```
View Innings Summary → Select Chase Outcome → Select MOM → Enter Amount → Place Bet
```

---

## 🎯 Betting Flow Diagram

```
USER JOURNEY:
┌─────────┐
│  START  │
└────┬────┘
     │
     ├─→ [PRE-MATCH PHASE] ──→ Select team/runs ──→ Confirm ──→ Bet Placed ✅
     │
     ├─→ [NEXT OVER PHASE] ──→ Monitor Countdown ──→ Select ──→ Check Odds ──→ Confirm ──→ Bet Placed ✅
     │   (Live during innings)
     │
     └─→ [INNINGS END] ──→ Chase/MOM Selection ──→ Confirm ──→ Bet Placed ✅
```

---

## 💰 Betting Mechanics

### Bet Slip Flow:
```
1. User selects prediction(s)
2. Clicks "Place Bet" button
3. Bet Slip Modal Opens
4. Shows:
   - Selected prediction(s)
   - Odds/Multiplier
   - Current coins balance
5. User enters amount
6. System validates:
   - Coins available ≥ bet amount
   - Minimum bet met
7. On confirmation:
   - Deduct coins from user account
   - Store bet in database
   - Show success message
```

### Bet Database Structure:
```typescript
{
  room_id: string;
  user_id: string;
  match_id: string;
  type: 'pre-match' | 'next-over' | 'innings-end';
  predictions: Record<string, string>;
  amount: number;
  status: 'pending' | 'won' | 'lost';
  created_at: timestamp;
}
```

---

## 🎨 UI Components Used

| Phase | Components | Key Features |
|-------|-----------|--------------|
| **Pre-Match** | Team cards, Pills, Modal | Static layout, Multiple select |
| **Next Over** | Pills, Timer, Odds flash, Modal | Dynamic, Real-time updates |
| **Innings End** | Pills, Player cards, Modal | Seasonal stats display |

### Color Scheme:
- **Primary Accent:** `#FF7A00` (Orange)
- **Highlight:** `#00FFB2` (Cyan/Green)
- **Background:** `#111111` (Dark)
- **Text:** `#FFFFFF` (White)
- **Odds Up:** `#4CAF50` (Green flash)
- **Odds Down:** `#F44336` (Red flash)

---

## 📱 State Management

### Component States:
```typescript
// Pre-Match & Innings End
selectedBets: Record<string, string>     // Stores user selections
betAmount: number                        // Bet amount
showBetSlip: boolean                     // Modal visibility

// Next Over
countdown: number                        // Seconds remaining
oddChanges: Record<string, 'up'|'down'> // For flash animation
```

### Context Access:
```typescript
const { user } = useAppContext()
// Access to: user.id, user.coins, user balance
```

---

## 🔄 Real-time Features

### Next Over Phase Real-time:
1. **Odds Updates:** `currentOdds` prop receives latest odds
2. **Change Detection:** Compare with localStorage
3. **Animation:** Flash overlay on odds change (900ms)
4. **Countdown:** Decrement every 1 second
5. **Status:** Updates "Over [X] complete — window open"

### Implementation Pattern:
```typescript
useEffect(() => {
  // Track odds changes
  detectOddsMovement(currentOdds)
  triggerFlashAnimation()
}, [currentOdds])

useEffect(() => {
  // Countdown timer
  const interval = setInterval(() => {
    setCountdown(prev => prev > 0 ? prev - 1 : 0)
  }, 1000)
  return () => clearInterval(interval)
}, [])
```

---

## ✅ Validation Rules

### Before Bet Placement:
- ✅ User has selected at least 1 prediction
- ✅ Bet amount entered
- ✅ User coins ≥ bet amount
- ✅ Bet amount > 0
- ✅ Match/Over window still open (for live phase)

### Error Handling:
```
❌ Insufficient coins → Alert user
❌ Invalid amount → Prevent input
❌ Time window closed → Disable betting
❌ Network error → Retry with feedback
```

---

## 📊 Odds Reference

### Pre-Match Phase:
| Betting Type | Default Odds |
|------|------|
| Match Winner | 1.8x |
| Toss Winner | 1.9x |
| Runs in Over 1 (0-5) | 2.5x |
| Runs in Over 1 (6-9) | 2.0x |
| Runs in Over 1 (10+) | 3.5x |

### Next Over Phase:
| Betting Type | Default Odds |
|------|------|
| Runs (0-5) | 2.5x |
| Runs (6-9) | 2.8x |
| Runs (10-13) | 3.5x |
| Runs (14+) | 5.0x |
| Wicket Yes | 2.2x |
| Wicket No | 1.9x |

### Innings End Phase:
| Betting Type | Default Odds |
|------|------|
| Chase Yes | 2.5x |
| Chase No | 1.7x |
| Man of Match | 2.3-3.5x (varies) |

---

## 🚀 Integration Points

### GlobalRoom.tsx Connection:
```tsx
// Phase selector buttons
[Pre-Match] [Next Over] [Innings End]

// Conditional rendering
{currentPhase === 'pre-match' && <PreMatchPhase {...props} />}
{currentPhase === 'next-over' && <NextOverPhase {...props} />}
{currentPhase === 'innings-end' && <InningsEndPhase {...props} />}
```

### Props Passed to Components:
```typescript
// PreMatchPhase
matchName: string
onBetAdded?: (bet) => void

// NextOverPhase
matchName: string
score: string
currentOver: number
timeRemaining: number
currentOdds?: Record<string, number>
onBetAdded?: (bet) => void

// InningsEndPhase
matchName: string
inningsResult: string
targetScore: number
players?: Array<{name, stat, odds}>
onBetAdded?: (bet) => void
```

---

## 📝 Future Enhancements

- [ ] Parlay bets (combine multiple bets)
- [ ] Live streaming integration
- [ ] Mobile app optimization
- [ ] Bet history/analytics dashboard
- [ ] VIP tier odds multipliers
- [ ] Promotional bonus coins
- [ ] Responsible gaming limits
- [ ] Bet insurance feature

---

## 🔗 File Structure

```
src/pages/
├── Betting.tsx               # OLD - Legacy page (reference only)
├── PreMatchPhase.tsx        # ✅ Phase 1 Component
├── NextOverPhase.tsx        # ✅ Phase 2 Component
├── InningsEndPhase.tsx      # ✅ Phase 3 Component
└── GlobalRoom.tsx           # 🔀 Phase router
```

---

*Last Updated: 2026-03-28*  
*Total Phases: 3 | Total Betting Types: 8+*
