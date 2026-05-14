# BonkerGames — Project Overview for AI Assistants

## What this project is
A free browser game platform at bonkergames.com. Static HTML/CSS/JS site deployed on Vercel. No build tools, no npm, no frameworks — everything runs directly in the browser via CDN.

## Tech stack
- **Hosting:** Vercel (static)
- **Auth + Database:** Firebase (Realtime Database + Auth)
- **Game logic:** Vanilla JS + HTML5 Canvas
- **Fonts:** Google Fonts (Inter)
- **Chess logic only:** chess.js v1.4.0 via esm.run CDN

## Firebase config (use this in every game that needs it)
```js
{
  apiKey: 'AIzaSyBQjDeFUKpleEsc2Fl3yZdnNje0cyAGaKU',
  authDomain: 'd-game-b50ef.firebaseapp.com',
  databaseURL: 'https://d-game-b50ef-default-rtdb.firebaseio.com',
  projectId: 'd-game-b50ef',
  storageBucket: 'd-game-b50ef.firebasestorage.app',
  messagingSenderId: '80712714092',
  appId: '1:80712714092:web:4b15f70196f05942905549'
}
```

## Folder structure
```
/
├── index.html              ← Main page (game grid, hero, notifications)
├── vercel.json             ← URL routing — add a route for every new game
├── assets/
│   ├── logo.png            ← BonkerGames logo (mix-blend-mode: screen)
│   ├── favicon.svg
│   ├── header-auth.js      ← Shared auth/profile/favorites logic
│   └── bomb-character.png
├── games/
│   ├── _template/          ← BLUEPRINT — copy this for every new game
│   │   ├── CLAUDE.md
│   │   ├── index.html      ← Game logic only, no BonkerGames chrome
│   │   └── play.html       ← Full BonkerGames wrapper (header/sidebar/etc)
│   ├── bonker-survival/    ← Each game is self-contained in its folder
│   ├── bonker-chess/
│   ├── tic-tac-toe-online/
│   ├── snake/
│   ├── 2048/
│   └── [new-game]/
```

## Architecture: iframe pattern
Every game uses TWO files:
- `index.html` — the actual game. Self-contained. No BonkerGames chrome. Works standalone.
- `play.html` — the BonkerGames wrapper. Has header, sidebar, game bar, play-next panel, notification panel. Loads `index.html` inside an `<iframe>`.

**Never put BonkerGames chrome inside index.html. Never put game logic inside play.html.**

## URL routing
Routes are defined in `vercel.json`. Pattern: `/game/[slug]` → `/games/[folder]/play.html`

Add a new route for every new game:
```json
{ "source": "/game/snake", "destination": "/games/snake/play.html" }
```

## Adding a new game — checklist
1. Copy `games/_template/` to `games/[game-name]/`
2. Replace all `<!-- REPLACE: ... -->` placeholders in play.html
3. Build the game in index.html
4. Add a route to vercel.json
5. Add a game card to index.html (main page grid)
6. Add the game to play-next panels in other game play.html files
7. Add a thumb.png thumbnail to the game folder

## Shared CSS variables (use these in index.html game files for consistency)
```css
--bg: #13131f;    --bg2: #1c1c2e;   --bg3: #252538;   --bg4: #2e2e45;
--accent: #7c5cfc; --accent-h: #6a4de0;
--text: #ffffff;   --text2: #9898b8;
--border: rgba(255,255,255,0.07);
--red: #ff4d6d;
```

## Sound effects
Use the Web Audio API — no extra files needed. See `games/tic-tac-toe-online/index.html` for the pattern (sfxPlace, sfxWin, sfxDraw functions).
For chess-style sounds, .mp3 files are in `games/bonker-chess/`.

## DO NOT modify without understanding the full impact
- `assets/header-auth.js` — shared across all pages, handles login/profile/favorites/liked
- `vercel.json` — wrong edits break all URL routing
- Firebase Database rules — set in Firebase Console, not in code
- `index.html` (root) — main page, touch only the games grid and notification content
