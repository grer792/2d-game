# Bonker Bird (Flappy Bird)

Tap-to-fly arcade game. Canvas rendering, responsive physics, Firebase best score, Web Audio API sound.

## Files in this folder (DO NOT edit files outside this folder)
- `index.html` — Full game, self-contained canvas game
- `play.html` — BonkerGames wrapper (header, sidebar, game bar, play-next, notifications)
- `thumb.png` — Game thumbnail (add when available)

## URL
- Play page: `/game/flappy-bird` → this folder's `play.html`
- Game ID: `flappy-bird`

## Key implementation notes
- All physics constants scale relative to a 600px reference height via `sc() = H / 600`
- Constants accessed via getter object `K` (GRAVITY, FLAP_V, BIRD_R, PIPE_W, PIPE_GAP, PIPE_SPEED, etc.)
- State machine: `gs` = `'idle'` | `'playing'` | `'dead'`
- idle: bird bobs with sin wave, faint example pipe, title card overlay
- playing: full physics + pipe collision loop via `update()`
- dead: bird falls to ground, score card shown after brief delay, tap restarts
- Collision hitbox is 0.82× bird radius for fairness
- First pipe spawns after one full PIPE_EVERY interval (not at frame 0)
- Best score: localStorage (`bgBirdBest`) + Firebase `users/{uid}/scores/flappy-bird`

## Sound
- `sfxFlap()` — short ascending sine beep on tap
- `sfxScore()` — two-tone ding on pipe pass
- `sfxHit()` — sawtooth crunch on collision
- `sfxDie()` — three-note descending sawtooth

## DO NOT
- Edit files in other game folders
- Edit `/assets/header-auth.js`
- Edit `/vercel.json` (unless adding a new route for a new game)
- Edit the root `/index.html` (unless updating this game's card)
