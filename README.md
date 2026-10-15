# 🧱📚 Biblobumbo

A gamified, LEGO-style reading app with a Gen Z twist. Every reader is a customisable **3D minifig**.

## What's inside

| Page | What you can do |
| --- | --- |
| **Brick City** (home) | Your 3D minifig on a baseplate next to a tower of finished books (one brick per book). Tap the fig to switch moves (wave, dance, read, celebrate, walk). XP bar, streak, studs, daily quests, badges. |
| **Library** | Search Open Library (title/author, with covers), add books by hand, read the bundled public-domain classics in-app, or upload any `.txt` (e.g. from Project Gutenberg). Track your page, finish books, rate them out of 5 bricks. |
| **Reader** | Paginated reader (← → keys, font size, night mode) with your minifig reading alongside. For physical books, **lock-in mode** runs a focus timer that pays XP. |
| **Hangout** | Post book takes with a vibe tag and a brick rating, react (🔥 💀 😭 🧱 🫶), and reply. |
| **Squad** | Leaderboard by XP, pages or books, with the top 3 minifigs on a 3D podium. |
| **My Fig** | Customise skin, hair (8 styles), hair colour, face, torso colour & print, legs, and accessory (book, glasses, latte, headphones, cape). Spend **studs** in the shop to unlock premium drip; some items need a minimum level. |

### The game loop
- **XP**: +2 per page, +1 per focused minute, +120 per finished book, plus XP for posting, replying and reacting.
- **Studs** 🟡 (currency): earned from pages, finishing books, posts, quests and level-ups. Spend them on fig items.
- **Levels & titles**: Brick Newbie → Page Turner → … → Library Legend.
- **Daily quests**, **reading streaks** and **10 badges**.

## Bonus: NaMo Bricks — The Election Run (`/game/`)

A LEGO-style, Mario-like side-scroller parody served at `/game/` (source in `src/game/`, entry `game/index.html`).

- **Hero:** a NaMo minifig caricature (white hair & beard, glasses, white kurta, saffron jacket).
- **Votes:** ballot boxes to collect. **? blocks** are development projects (Metro, Vande Bharat, highways…), and some give a **Vikas Boost** power-up that absorbs one hit.
- **Obstacles:** protest barricades you have to jump over, and gaps in the road.
- **Opponents:** "RaGa" and "Kejri" caricatures patrol the trail. Jump on them to outplay them; touching them from the side costs a life.
- **Goal:** reach the tricolour flag before election day to win seats (out of 543).
- **Controls:** ← → / A D move · Space / ↑ jump (hold for higher) · Shift run · M mute. On-screen buttons appear on touch devices.

All characters are cartoon caricatures drawn in code (no photos). It's a fan-made parody, not affiliated with or endorsed by any person or party.

## Running it

```bash
npm install
npm run dev       # http://localhost:5173  (game: /game/)
npm test          # unit tests (game rules + store flows)
npm run build     # static build in dist/ (deploy to any static host)
```

## Deploy to Vercel

The repo includes a `vercel.json` (Vite preset, `npm run build`, output `dist/`, long-term caching for hashed assets). The app uses hash-based routes (`/#/library`), so page refreshes work without rewrite rules.

**Option A: dashboard (no CLI)**
1. Go to <https://vercel.com/new> and import `chad3456/biblobumbo`.
2. Settings are picked up from `vercel.json`, so just click **Deploy**.
3. Every push to `main` deploys to production. Pushes to other branches get preview URLs.

**Option B: CLI**
```bash
npm i -g vercel
vercel login
vercel          # preview deploy
vercel --prod   # production deploy
```

## Tech
React 19 + TypeScript + Vite, Three.js via `@react-three/fiber`/`drei` (the minifigs are built from code, so there are no model files), and Zustand for state.

## Good to know
- **Accounts are stored in your browser** (localStorage). Passwords are salted and SHA-256 hashed, but there's no server: accounts, books and posts stay on that device/browser. A few NPC readers are seeded so the Hangout and Squad aren't empty. To add real cross-device sharing, swap `src/store.ts` persistence and `src/lib/auth.ts` for a backend such as Supabase or Firebase.
- The bundled texts (*The Raven*, *Pride and Prejudice* ch. 1, *Alice in Wonderland* ch. 1 excerpt) are public domain.
