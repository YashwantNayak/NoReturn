# 🏏 RoomBlast Web - Project Information

## Overview
**RoomBlast Web** is a real-time IPL 2026 prediction game web application where users can create private rooms with friends and play fun prediction games using virtual coins. It's like a fantasy cricket prediction experience focused on individual match predictions rather than long-term leagues.

## Project Description
- **Name**: RoomBlast Web
- **Type**: Real-time Web Application
- **Purpose**: Enable users to predict IPL match outcomes with friends in private rooms
- **Virtual Currency**: Users play with virtual coins - they can place bets on various match predictions and win/lose coins based on accuracy

## Key Features

### 1. **Authentication System**
- Supabase Auth integration for user login/registration
- Session persistence across browser refreshes
- User profile management with stats tracking

### 2. **Room System**
- Create and join private prediction rooms with friends
- Real-time room management
- Chat functionality within rooms

### 3. **Prediction/Betting System**
- Multiple bet types:
  - **Pre-Match**: Match Winner, Toss Winner
  - **Powerplay**: Powerplay runs, wickets
  - **Next Over**: Runs in next over, boundary prediction, wicket prediction
  - **Innings**: Total score, highest scorer
- Dynamic multipliers based on bet difficulty
- Coin-based wagering system

### 4. **Game Phases**
- **Pre-Match Phase**: Bets before match starts
- **Next Over Phase**: Live predictions during match
- **Innings End Phase**: End of innings predictions
- **Leaderboard**: Track user rankings and stats

### 5. **User Dashboard**
- Home page with live match info
- Leaderboard showing top players and win rates
- User profile with stats (coins, win rate, streak)
- Global chat for community interaction

## Technology Stack

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite 6**: Lightning-fast bundler
- **React Router 7**: Client-side navigation
- **Tailwind CSS 4**: Styling and utility-first CSS
- **Lucide React**: Icon library
- **Motion 12**: Animation library for smooth transitions
- **Google Gemini AI**: Integrated for potential match analysis features

### Backend & Services
- **Supabase**: Authentication, real-time database, and backend services
- **Express.js**: Backend API (development)

### Development Tools
- **TypeScript**: Strict type checking
- **TSX**: TypeScript execution for Node.js
- **Autoprefixer**: CSS vendor prefixing

## Project Structure

```
roomblast-web/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # React Context for state management
│   ├── pages/               # Page components for routes
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   ├── supabaseClient.ts    # Supabase client configuration
│   └── supabase.ts          # Additional Supabase utilities
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── metadata.json            # App metadata
```

## Data Model

### User Profile
- `id`: Unique user identifier
- `displayName`: User's display name
- `email`: User email
- `photoURL`: Profile picture
- `coins`: Virtual currency balance
- `winRate`: Win percentage
- `streak`: Current winning streak
- `role`: User role (if any)

### Rooms
- Private rooms where users can gather to predict IPL matches
- Real-time updates for all room participants
- Chat functionality

### Bets
- User predictions with:
  - Bet type (pre-match, powerplay, next-over, innings)
  - Bet amount (in coins)
  - Prediction choice
  - Multiplier (risk/reward ratio)
  - Outcome (pending, won, lost)

## Current Status
- Core architecture in place
- Authentication and user management working
- Betting system framework built
- UI components with animations
- Database schema with Supabase

## Scripts

```bash
npm run dev        # Start development server on port 3000
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run clean      # Remove build artifacts
npm run lint       # Check TypeScript types
```

## Environment Setup
- Requires `.env.local` file with:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
  - `VITE_GEMINI_API_KEY`: Google Gemini API key (optional)

## Design Aesthetics
- **Dark Theme**: Black backgrounds with green accents
- **Color Scheme**: 
  - Primary: `#00FFB2` (Bright Green - represents cricket field)
  - Accent: `#FF7A00` (Orange - live/hot)
  - Background: `#000000` (Black - sleek look)
- **Animations**: Smooth transitions and loading states using Motion library
- **Responsive**: Mobile-optimized with clamp() for fluid scaling

## Next Steps / TODO
- Complete room creation and joining flow
- Implement real-time prediction updates
- Add live match data integration
- Complete leaderboard functionality
- Add chat system
- Deploy to production
