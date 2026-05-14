# Tic Tac Toe Online

Tic Tac Toe with AI mode, same-device 2-player, and Firebase online multiplayer. Sound effects via Web Audio API.

## Files in this folder (DO NOT edit files outside this folder)
- `index.html` — Game logic + Firebase multiplayer, self-contained
- `play.html` — BonkerGames wrapper (header, sidebar, game bar, play-next, notifications)
- `thumb.png` — Game thumbnail

## URL
- Play page: `/game/tic-tac-toe` → this folder's `play.html`
- Game ID: `tic-tac-toe`

## Firebase
- Multiplayer rooms stored at: `tttRooms/{roomId}`
- Room fields: `xPlayer`, `oPlayer`, `xName`, `oName`, `board[9]`, `turn`, `status`, `winner`, `winLine`, `xScore`, `oScore`
- Rules: `tttRooms` has `.read: true, .write: true` in Firebase Console

## Key implementation notes
- AI: checks win → block → center(4) → corners → random sides
- Sound: Web Audio API, no files needed. sfxPlace(mark), sfxWin(), sfxDraw()
- Room URL: iframe-aware, checks window.parent.location first
- prevBoard tracked to detect moves in online mode for sound triggering

## DO NOT
- Edit files in other game folders
- Edit `/assets/header-auth.js`
- Edit `/vercel.json` (unless adding a new route for a new game)
- Edit the root `/index.html` (unless updating this game's card)
