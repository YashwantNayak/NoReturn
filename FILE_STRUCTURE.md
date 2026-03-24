# RoomBlast Web - File Structure & Documentation

## Root Level Files

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point for the React app. Contains root div where React mounts |
| `package.json` | Project dependencies, scripts, and metadata. Defines npm commands (dev, build, etc.) |
| `tsconfig.json` | TypeScript compiler configuration for strict type checking |
| `vite.config.ts` | Vite bundler configuration with React plugin configuration |
| `metadata.json` | App metadata including name "RoomBlast Web" and description |
| `README.md` | Quick start guide for running the project locally |

---

## `/src` Directory

### **Main Files**

| File | Purpose |
|------|---------|
| `main.tsx` | React app entry point. Creates root and renders App component in strict mode |
| `App.tsx` | Main app component with: routes setup, auth context provider, navigation components, protected route logic |
| `index.css` | Global CSS styles and Tailwind CSS imports for entire application |
| `supabaseClient.ts` | Supabase client configuration with auth settings (persistence, auto-refresh, implicit flow) |
| `supabase.ts` | Additional Supabase utilities and helpers (if needed) |

---

## `/src/components` - Reusable UI Components

| Component | Purpose |
|-----------|---------|
| `Navbar.tsx` | Top navigation bar with logo, user info, and main navigation links |
| `BottomNav.tsx` | Mobile bottom navigation bar for quick access to main pages |
| `ErrorBoundary.tsx` | React error boundary component to catch and display errors gracefully |

---

## `/src/context` - State Management

| File | Purpose |
|------|---------|
| `AppContext.tsx` | Global app state using React Context API. Manages: user auth state, loading states, rooms list, bets list, coin balance. Handles Supabase auth initialization and user session management |

---

## `/src/pages` - Page Components (Routes)

| Page | Purpose |
|------|---------|
| `Home.tsx` | Landing/dashboard page showing: welcome message, today's live IPL match, quick action buttons, user stats |
| `Auth.tsx` | Authentication page for login/signup. Handles user registration and login flow |
| `GlobalRoom.tsx` | Global community room where all users can chat and discuss predictions together |
| `FullPageChat.tsx` | Full-screen chat interface for extended conversation in a room |
| `Room.tsx` | Individual room page (currently empty - awaiting implementation). Will show room-specific predictions and participants |
| `CreateJoinRoom.tsx` | UI for creating new prediction rooms or joining existing ones with room codes |
| `Betting.tsx` | Main betting/prediction interface with: multiple bet categories (pre-match, powerplay, next-over, innings), bet amount selection, prediction submission, multiplier display |
| `PreMatchPhase.tsx` | Pre-match prediction phase showing bets available before match starts (match winner, toss winner) |
| `NextOverPhase.tsx` | Live over-by-over predictions during match (next over runs, wickets, boundaries) |
| `InningsEndPhase.tsx` | Innings-end predictions (total score, highest scorer) |
| `Leaderboard.tsx` | Leaderboard displaying: player rankings, win rates, coin balances, current streaks |
| `Profile.tsx` | User profile page showing: personal stats, history, settings, coin balance, achievements |

---

## `/public` Directory

| File | Purpose |
|------|---------|
| `manifest.json` | Web app manifest for PWA support. Defines app name, icons, display mode |

---

## Summary of Data Flow

```
index.html
    ↓
main.tsx (React entry point)
    ↓
App.tsx (Setup routes + context)
    ↓
AppContext.tsx (Global state - auth, user data)
    ↓
Pages (Home, Auth, Room, Betting, etc.)
    ↓
Components (Navbar, BottomNav, etc.)
    ↓
Supabase (Backend data + real-time updates)
```

---

## Key Decisions

1. **Context API** instead of Redux for simpler state management
2. **Supabase** for authentication and real-time database capabilities
3. **React Router v7** for modern routing without extra complexity
4. **Tailwind CSS** for rapid UI development with utility-first approach
5. **TypeScript** throughout for type safety and better DX
6. **Vite** for fast development and optimized production builds

---

## File Status

✅ **Configured**: `supabaseClient.ts`, `App.tsx`, `AppContext.tsx`, `Home.tsx`, `Betting.tsx`  
🚧 **In Progress**: `Room.tsx` (empty, awaiting implementation)  
⏳ **To Do**: Some phase pages may need full implementation

