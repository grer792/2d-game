# Snake (Bonker Snake)

Classic snake game with canvas rendering, sound effects via Web Audio API, mobile D-pad support, and swipe controls.

## Files in this folder (DO NOT edit files outside this folder)
- `index.html` — Full game, self-contained canvas game
- `play.html` — BonkerGames wrapper (header, sidebar, game bar, play-next, notifications)
- `thumb.png` — Game thumbnail (add when available)

## URL
- Play page: `/game/snake` → this folder's `play.html`
- Game ID: `snake`

## Key implementation notes
- CELL size: 20px grid
- Speed: 120ms per tick interval
- Controls: Arrow keys, WASD, swipe gestures, on-screen D-pad (mobile)
- Food: pulsing circle with glow effect
- Snake head: brighter purple with glow, body fades with distance
- Sound: Web Audio API — sfxEat (two-tone beep), sfxMove (quiet tick), sfxDie (descending sawtooth)

## DO NOT
- Edit files in other game folders
- Edit `/assets/header-auth.js`
- Edit `/vercel.json` (unless adding a new route for a new game)
- Edit the root `/index.html` (unless updating this game's card)
