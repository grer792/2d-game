# _template — Game Blueprint

This folder is the blueprint for every BonkerGames game. Copy it to create a new game.

## How to use
1. Copy this entire folder to `games/[your-game-name]/`
2. In `play.html`, replace every `REPLACE:` placeholder (search for "REPLACE")
3. Build the actual game in `index.html`
4. Add `thumb.png` to the folder
5. Add a route in `/vercel.json`
6. Add a card to the main `/index.html` game grid
7. Add this game to play-next panels in other games' play.html files

## Files
- `play.html` — BonkerGames wrapper. DO NOT put game logic here.
- `index.html` — The game itself. DO NOT put BonkerGames chrome here.

## Placeholders to replace in play.html
| Placeholder | Example |
|---|---|
| REPLACE:GAME_TITLE | Snake |
| REPLACE:GAME_SLUG | snake |
| REPLACE:GAME_FOLDER | snake |
| REPLACE:GAME_META_DESC | Play Snake free in your browser... |
| REPLACE:GAME_BAR_TITLE | Bonker Snake |
| REPLACE:GAME_LIKE_COUNT | 5K |
| REPLACE:SIDEBAR_ACTIVE_CATEGORY | active class on the right sidebar item |

## Rules
- Only edit files inside your own game folder
- Do not modify other games' files
- Do not modify assets/header-auth.js
- Do not modify vercel.json without adding a route for this game
- Do not modify the root index.html except to add this game's card
