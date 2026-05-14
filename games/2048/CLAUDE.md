# 2048

Slide tiles to combine them and reach 2048. Pure JS, no dependencies.

## Files in this folder (DO NOT edit files outside this folder)
- `index.html` — Full game, self-contained
- `play.html` — BonkerGames wrapper
- `thumb.png` — Game thumbnail (add when available)

## URL
- Play page: `/game/2048` → this folder's `play.html`
- Game ID: `2048`

## Key implementation notes
- 4x4 grid, rotate-to-slide approach (always slide left after rotation)
- Tile colours: purple gradient for low values, accent/food colours for high values
- Sound: pitch scales with merged tile value (higher tile = higher pitch)
- Swipe support for mobile

## DO NOT
- Edit files in other game folders
- Edit `/assets/header-auth.js`
- Edit `/vercel.json` (unless adding a new route)
- Edit the root `/index.html` (unless updating this game's card)
