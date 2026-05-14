# Bonker Chess

Multiplayer chess game with AI mode, pawn promotion modal, Firebase online play, and sound effects.

## Files in this folder (DO NOT edit files outside this folder)
- `index.html` — Chess game using chess.js v1.4.0 (via esm.run CDN)
- `play.html` — BonkerGames wrapper (header, sidebar, game bar, play-next, notifications)
- `thumb.png` — Game thumbnail
- `move.mp3` — Move sound (from Lichess open source)
- `capture.mp3` — Capture sound (from Lichess open source)
- `check.mp3` — Check/notify sound (from Lichess open source)

## URL
- Play page: `/game/bonker-chess` → this folder's `play.html`
- Game ID: `bonker-chess`

## Firebase
- Multiplayer rooms stored at: `chessRooms/{roomId}`
- Room fields: `white`, `black`, `whiteName`, `blackName`, `fen`, `moves`, `status`, `createdAt`
- Rules: `chessRooms` has `.read: true, .write: true` in Firebase Console

## Key implementation notes
- chess.js returns 4 moves for pawn promotion (q/r/b/n) — detect with `.some(m => m.promotion)` and show modal
- Room URL sharing: `roomUrl()` checks `window.parent.location` first (iframe-aware)
- Username: reads `profiles/${user.uid}/username` from Firebase

## DO NOT
- Edit files in other game folders
- Edit `/assets/header-auth.js`
- Edit `/vercel.json` (unless adding a new route for a new game)
- Edit the root `/index.html` (unless updating this game's card)
