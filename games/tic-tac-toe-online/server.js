const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 4177);
const PUBLIC_DIR = __dirname;
const rooms = new Map();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function createEmptyRoom(id, playerId) {
  return {
    id,
    board: Array(9).fill(null),
    players: { X: playerId, O: null },
    turn: 'X',
    status: 'waiting',
    winner: null,
    winLine: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    clients: new Set()
  };
}

function publicRoom(room) {
  return {
    id: room.id,
    board: room.board,
    players: room.players,
    turn: room.turn,
    status: room.status,
    winner: room.winner,
    winLine: room.winLine,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt
  };
}

function makeRoomId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  do {
    id = '';
    for (let i = 0; i < 6; i += 1) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  } while (rooms.has(id));
  return id;
}

function getMark(room, playerId) {
  if (room.players.X === playerId) return 'X';
  if (room.players.O === playerId) return 'O';
  return null;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function broadcast(room) {
  const payload = `event: state\ndata: ${JSON.stringify({ room: publicRoom(room) })}\n\n`;
  for (const client of room.clients) {
    client.write(payload);
  }
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  if (board.every(Boolean)) return { winner: null, line: [] };
  return null;
}

function resetRoom(room) {
  room.board = Array(9).fill(null);
  room.turn = 'X';
  room.status = room.players.X && room.players.O ? 'playing' : 'waiting';
  room.winner = null;
  room.winLine = [];
  room.updatedAt = Date.now();
}

function serveFile(req, res, pathname) {
  const filePath = pathname === '/'
    ? path.join(PUBLIC_DIR, 'index.html')
    : path.join(PUBLIC_DIR, pathname);
  const resolved = path.resolve(filePath);

  if (!resolved.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(resolved, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const ext = path.extname(resolved);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/rooms') {
    const body = await readJson(req);
    const playerId = String(body.playerId || '').trim();
    if (!playerId) {
      sendJson(res, 400, { error: 'Missing player id' });
      return;
    }

    const id = makeRoomId();
    const room = createEmptyRoom(id, playerId);
    rooms.set(id, room);
    sendJson(res, 201, { mark: 'X', room: publicRoom(room) });
    return;
  }

  const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})(?:\/([a-z]+))?$/);
  if (!match) {
    sendJson(res, 404, { error: 'Unknown API route' });
    return;
  }

  const roomId = match[1];
  const action = match[2] || '';
  const room = rooms.get(roomId);
  if (!room) {
    sendJson(res, 404, { error: 'Room not found' });
    return;
  }

  if (req.method === 'GET' && action === 'events') {
    const playerId = String(url.searchParams.get('playerId') || '').trim();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write(`event: state\ndata: ${JSON.stringify({ mark: getMark(room, playerId), room: publicRoom(room) })}\n\n`);
    room.clients.add(res);
    req.on('close', () => room.clients.delete(res));
    return;
  }

  if (req.method === 'POST' && action === 'join') {
    const body = await readJson(req);
    const playerId = String(body.playerId || '').trim();
    if (!playerId) {
      sendJson(res, 400, { error: 'Missing player id' });
      return;
    }

    let mark = getMark(room, playerId);
    if (!mark) {
      if (!room.players.O) {
        room.players.O = playerId;
        mark = 'O';
        room.status = 'playing';
        room.updatedAt = Date.now();
      } else {
        sendJson(res, 409, { error: 'Room is already full' });
        return;
      }
    }

    broadcast(room);
    sendJson(res, 200, { mark, room: publicRoom(room) });
    return;
  }

  if (req.method === 'POST' && action === 'move') {
    const body = await readJson(req);
    const playerId = String(body.playerId || '').trim();
    const index = Number(body.index);
    const mark = getMark(room, playerId);

    if (!mark) {
      sendJson(res, 403, { error: 'You are not in this room' });
      return;
    }
    if (room.status !== 'playing') {
      sendJson(res, 409, { error: 'The game is not ready' });
      return;
    }
    if (room.turn !== mark) {
      sendJson(res, 409, { error: 'Not your turn' });
      return;
    }
    if (!Number.isInteger(index) || index < 0 || index > 8 || room.board[index]) {
      sendJson(res, 400, { error: 'Invalid move' });
      return;
    }

    room.board[index] = mark;
    const result = checkWinner(room.board);
    if (result && result.winner) {
      room.status = 'won';
      room.winner = result.winner;
      room.winLine = result.line;
    } else if (result) {
      room.status = 'draw';
      room.winner = null;
      room.winLine = [];
    } else {
      room.turn = mark === 'X' ? 'O' : 'X';
    }
    room.updatedAt = Date.now();
    broadcast(room);
    sendJson(res, 200, { mark, room: publicRoom(room) });
    return;
  }

  if (req.method === 'POST' && action === 'rematch') {
    const body = await readJson(req);
    const playerId = String(body.playerId || '').trim();
    const mark = getMark(room, playerId);
    if (!mark) {
      sendJson(res, 403, { error: 'You are not in this room' });
      return;
    }

    resetRoom(room);
    broadcast(room);
    sendJson(res, 200, { mark, room: publicRoom(room) });
    return;
  }

  sendJson(res, 404, { error: 'Unknown API route' });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch(error => {
      sendJson(res, 400, { error: error.message || 'Bad request' });
    });
    return;
  }

  serveFile(req, res, decodeURIComponent(url.pathname));
});

server.listen(PORT, () => {
  console.log(`Online Tic Tac Toe running at http://localhost:${PORT}`);
});
