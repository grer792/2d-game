# Breakout

Classic brick-breaking game. Mouse/keyboard/touch paddle control. Pure JS canvas, no dependencies.

## Files in this folder (DO NOT edit files outside this folder)
- `index.html` — Full game, self-contained
- `play.html` — BonkerGames wrapper
- `thumb.png` — Game thumbnail (add when available)

## URL
- Play page: `/game/breakout` → this folder's `play.html`
- Game ID: `breakout`

## Key implementation notes
- 6 rows × 10 cols bricks, each row has a gradient colour pair
- PAD_W_RATIO=0.14, BALL_R=7, PAD_H=12, 3 lives
- Score = 10*(row+1) per brick, bricks start at margin_top=H*0.12
- Ball-brick collision uses ox vs oy overlap to determine which side was hit
- Controls: Arrow/WASD keys, mousemove, touchmove
- Sound: sfxBrick(row), sfxPaddle(), sfxWall(), sfxWin(), sfxLose()

## DO NOT
- Edit files in other game folders
- Edit `/assets/header-auth.js`
- Edit `/vercel.json` (unless adding a new route)
- Edit the root `/index.html` (unless updating this game's card)
