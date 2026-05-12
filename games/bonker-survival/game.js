'use strict';
// ═══════════════════════════════════════════
//  RIVER CURRENT SURVIVAL  –  Bonker Games
//  Hold SPACE / UP / W to swim against the current.
//  Don't get swept to the bottom!
// ═══════════════════════════════════════════

const W = 800, H = 600;
const WALL = 52; // rocky side-wall width
const PLAY_L = WALL, PLAY_R = W - WALL, PLAY_W = PLAY_R - PLAY_L;

// Physics
const SWIM    = 310;  // upward accel when pressing (px/s²)
const CUR0    = 75;   // starting downward force (px/s²)
const CUR_K   = 48;   // difficulty scale: current = CUR0 + sqrt(t)*CUR_K
const DRAG    = 0.97; // per-frame vertical velocity drag
const HDRAG   = 0.86;
const HSPD    = 200;
const MAX_VY  = 420;

// ── Game state (module-level so all fns share it) ──────────────────────────
let scene;                         // Phaser scene ref, set in create()
let playerX, playerY, velX, velY;
let alive, started, score, difficulty, current, spawnCd;
let chunks = [];                   // {gfx, x, y, vx, vy, r, hitR, shape}
let wLines = [], bubs = [];        // water fx
let waveT = 0;

// UI refs
let playerGfx, hudText, startText;
let goPanel, goTitle, goSub, goHint;
let dangerGfx;

// Input refs
let cursors, spaceKey, wKey, aKey, dKey;

// ── Phaser config ──────────────────────────────────────────────────────────
new Phaser.Game({
  type: Phaser.AUTO,
  width: W, height: H,
  backgroundColor: '#061420',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: { preload, create, update }
});

function preload() {}

// ── CREATE ─────────────────────────────────────────────────────────────────
function create() {
  scene = this;

  // Water gradient background
  const bgG = scene.add.graphics().setDepth(0);
  for (let y = 0; y <= H; y += 3) {
    const t = y / H;
    bgG.fillStyle(Phaser.Display.Color.GetColor(
      Math.floor(Phaser.Math.Linear(9, 4, t)),
      Math.floor(Phaser.Math.Linear(30, 14, t)),
      Math.floor(Phaser.Math.Linear(50, 24, t))
    ), 1);
    bgG.fillRect(PLAY_L, y, PLAY_W, 3);
  }

  // Surface shimmer line
  const sfG = scene.add.graphics().setDepth(1);
  sfG.fillStyle(0x7ef8ff, 0.07);
  sfG.fillRect(PLAY_L, 0, PLAY_W, 5);

  // Rocky side walls
  buildWalls();

  // River bed
  const bedG = scene.add.graphics().setDepth(1);
  bedG.fillStyle(0x1a2a38, 1);
  bedG.fillRect(PLAY_L, H - 18, PLAY_W, 18);
  bedG.fillStyle(0x263644, 1);
  for (let x = PLAY_L + 14; x < PLAY_R - 14; x += 30) {
    bedG.fillCircle(x + Math.sin(x * 0.4) * 7, H - 9, 4 + (x % 10 > 5 ? 3 : 0));
  }

  // Danger vignette (near bed, shown when sinking)
  dangerGfx = scene.add.graphics().setDepth(3);

  // Animated water current lines
  for (let i = 0; i < 26; i++) {
    wLines.push({
      gfx:   scene.add.graphics().setDepth(2),
      x:     Phaser.Math.Between(PLAY_L + 8, PLAY_R - 8),
      y:     Phaser.Math.Between(-H, H),
      len:   Phaser.Math.Between(16, 52),
      spd:   Phaser.Math.FloatBetween(0.65, 1.45),
      alpha: Phaser.Math.FloatBetween(0.06, 0.22),
      cx:    Phaser.Math.FloatBetween(-9, 9)
    });
  }

  // Bubbles
  for (let i = 0; i < 22; i++) {
    bubs.push({
      gfx:   scene.add.graphics().setDepth(2),
      x:     Phaser.Math.Between(PLAY_L + 6, PLAY_R - 6),
      y:     Phaser.Math.Between(0, H),
      r:     Phaser.Math.FloatBetween(1.5, 4.5),
      rise:  Phaser.Math.FloatBetween(10, 36),
      phase: Phaser.Math.FloatBetween(0, Math.PI * 2)
    });
  }

  // Player graphics object
  playerGfx = scene.add.graphics().setDepth(5);

  // HUD
  hudText = scene.add.text(PLAY_L + 10, 10, '', {
    fontSize: '14px', color: '#7ef8ff',
    fontFamily: 'Segoe UI, sans-serif',
    stroke: '#000000', strokeThickness: 3
  }).setDepth(10);

  // Start prompt
  startText = scene.add.text(W / 2, H / 2,
    'Hold  SPACE  or  ↑  to swim up\nagainst the river current!', {
      fontSize: '22px', color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif',
      align: 'center', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(10);

  // Game-over panel
  goPanel = scene.add.rectangle(W/2, H/2, 400, 220, 0x000000, 0.84).setDepth(20).setVisible(false);
  goTitle = scene.add.text(W/2, H/2 - 76, 'SWEPT AWAY!', {
    fontSize: '38px', color: '#ff4d6d',
    fontFamily: 'Segoe UI, sans-serif', stroke: '#000', strokeThickness: 5
  }).setOrigin(0.5).setDepth(21).setVisible(false);
  goSub = scene.add.text(W/2, H/2 - 8, '', {
    fontSize: '17px', color: '#dddddd',
    fontFamily: 'Segoe UI, sans-serif',
    align: 'center', stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5).setDepth(21).setVisible(false);
  goHint = scene.add.text(W/2, H/2 + 62, '[ SPACE ]  to try again', {
    fontSize: '16px', color: '#7ef8ff',
    fontFamily: 'Segoe UI, sans-serif', stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5).setDepth(21).setVisible(false);

  // Input
  cursors  = scene.input.keyboard.createCursorKeys();
  spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  wKey     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  aKey     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  dKey     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  resetGame();
}

// ── BUILD ROCKY WALLS ──────────────────────────────────────────────────────
function buildWalls() {
  for (let side = 0; side < 2; side++) {
    const ox = side === 0 ? 0 : PLAY_R;
    const g = scene.add.graphics().setDepth(1);

    // Base stone
    g.fillStyle(0x253045, 1);
    g.fillRect(ox, 0, WALL, H);

    // Brick pattern
    for (let y = 0; y < H; y += 22) {
      for (let xi = 0; xi < WALL; xi += 18) {
        if ((Math.floor(y / 22) + Math.floor(xi / 18)) % 2 === 0) {
          g.fillStyle(0x1c2538, 1);
          g.fillRect(ox + xi + 1, y + 1, 16, 20);
        }
      }
    }

    // Inner glow edge
    const ex = side === 0 ? WALL - 5 : PLAY_R;
    g.fillStyle(0x3a4e6a, 0.4);
    g.fillRect(ex, 0, 5, H);

    // Algae patches
    g.fillStyle(0x2a5a38, 0.65);
    for (let y = 28; y < H; y += 50 + (ox % 18)) {
      const ax = side === 0 ? WALL - 10 : PLAY_R + 10;
      g.fillCircle(ax, y, 5);
      g.fillCircle(ax + (side === 0 ? -6 : 6), y + 14, 3);
    }
  }
}

// ── RESET ──────────────────────────────────────────────────────────────────
function resetGame() {
  chunks.forEach(c => c.gfx.destroy());
  chunks = [];
  playerX = W / 2;
  playerY = H / 2 - 20;
  velX = 0; velY = 0;
  alive = true; started = false;
  score = 0; difficulty = 0;
  current = CUR0; spawnCd = 0; waveT = 0;

  dangerGfx.clear();
  startText.setVisible(true);
  goPanel.setVisible(false);
  goTitle.setVisible(false);
  goSub.setVisible(false);
  goHint.setVisible(false);
}

// ── UPDATE ─────────────────────────────────────────────────────────────────
function update(time, delta) {
  const dt = Math.min(delta / 1000, 0.05);
  waveT += dt;

  const swim = spaceKey.isDown || cursors.up.isDown || wKey.isDown;

  // Dead: wait for restart
  if (!alive) {
    if (Phaser.Input.Keyboard.JustDown(spaceKey)) resetGame();
    tickWater(dt);
    return;
  }

  // Pre-start: wait for first swim press
  if (!started) {
    drawPlayer(false);
    tickWater(dt);
    if (swim) { started = true; startText.setVisible(false); }
    return;
  }

  // ── Difficulty ramp ──
  difficulty += dt;
  current = CUR0 + Math.sqrt(difficulty) * CUR_K;
  score += dt;

  // ── Player physics ──
  // Vertical: current drags down, swimming pushes up
  velY = velY * DRAG + current * dt;
  if (swim) velY -= SWIM * dt;
  velY = Phaser.Math.Clamp(velY, -MAX_VY, MAX_VY);

  // Horizontal
  const goL = cursors.left.isDown  || aKey.isDown;
  const goR = cursors.right.isDown || dKey.isDown;
  if      (goL) velX = -HSPD;
  else if (goR) velX =  HSPD;
  else          velX *= HDRAG;

  playerX = Phaser.Math.Clamp(playerX + velX * dt, PLAY_L + 14, PLAY_R - 14);
  playerY += velY * dt;

  // Ceiling bounce
  if (playerY < 12) { playerY = 12; velY = Math.abs(velY) * 0.22; }

  // Hit river bed → die
  if (playerY > H - 24) { playerY = H - 24; die(); return; }

  // Danger vignette near bottom
  const dangerT = Phaser.Math.Clamp((playerY - H * 0.62) / (H * 0.28), 0, 1);
  dangerGfx.clear();
  if (dangerT > 0) {
    dangerGfx.fillStyle(0xff1a1a, dangerT * 0.28);
    dangerGfx.fillRect(PLAY_L, H - 110, PLAY_W, 110);
  }

  // ── Spawn obstacles ──
  spawnCd -= delta;
  if (spawnCd <= 0) {
    const interval = Math.max(460, 2600 - difficulty * 110);
    spawnCd = interval * (0.82 + Math.random() * 0.36);
    spawnChunk();
    if (difficulty > 9)  spawnChunk();
    if (difficulty > 20) spawnChunk();
  }

  // ── Move + collide obstacles ──
  for (let i = chunks.length - 1; i >= 0; i--) {
    const c = chunks[i];
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    drawChunk(c);

    // Circle vs circle collision
    const dx = playerX - c.x, dy = playerY - c.y;
    if (dx * dx + dy * dy < (c.hitR + 13) * (c.hitR + 13)) { die(); return; }

    if (c.y > H + 90 || c.x < PLAY_L - 90 || c.x > PLAY_R + 90) {
      c.gfx.destroy();
      chunks.splice(i, 1);
    }
  }

  // ── Water FX ──
  tickWater(dt);

  // ── Draw player ──
  drawPlayer(swim);

  // ── HUD ──
  hudText.setText(`Time: ${Math.floor(score)}s   Current: ${Math.floor(current)} px/s`);
}

// ── WATER ANIMATION ────────────────────────────────────────────────────────
function tickWater(dt) {
  const spd = current || CUR0;

  // Flowing current lines (move downward)
  for (const wl of wLines) {
    wl.y += wl.spd * spd * dt * 0.62;
    if (wl.y > H + wl.len) {
      wl.y = -wl.len * 2 - Math.random() * 50;
      wl.x = Phaser.Math.Between(PLAY_L + 8, PLAY_R - 8);
    }
    const g = wl.gfx; g.clear();
    g.lineStyle(1.5, 0x55ddff, wl.alpha);
    g.beginPath();
    g.moveTo(wl.x + Math.sin(wl.y * 0.035) * wl.cx, wl.y);
    g.lineTo(wl.x + Math.sin((wl.y + wl.len) * 0.035) * wl.cx, wl.y + wl.len);
    g.strokePath();
  }

  // Bubbles (naturally rise but current partially drags them down)
  for (const b of bubs) {
    b.y += (spd * 0.09 - b.rise) * dt;
    b.phase += dt * 1.9;
    if (b.y < -8)    { b.y = H + 8;  b.x = Phaser.Math.Between(PLAY_L+6, PLAY_R-6); }
    if (b.y > H + 8) { b.y = -8;     b.x = Phaser.Math.Between(PLAY_L+6, PLAY_R-6); }
    const g = b.gfx; g.clear();
    g.lineStyle(1, 0x99eeff, 0.28);
    g.strokeCircle(b.x + Math.sin(b.phase) * 3, b.y, b.r);
  }
}

// ── SPAWN OBSTACLE ─────────────────────────────────────────────────────────
function spawnChunk() {
  const r     = Phaser.Math.Between(12, 27);
  const shape = Math.floor(Math.random() * 3); // 0=round, 1=log, 2=jagged
  const hitR  = shape === 1 ? r * 1.55 : r;

  let cx, cy, cvx, cvy;
  if (Math.random() < 0.4) {
    // Drop from top
    cx  = Phaser.Math.Between(PLAY_L + r + 8, PLAY_R - r - 8);
    cy  = -r - 5;
    cvx = Phaser.Math.FloatBetween(-55, 55);
    cvy = current * Phaser.Math.FloatBetween(0.55, 1.3);
  } else {
    // Sweep in from a side wall
    const left = Math.random() < 0.5;
    cx  = left ? PLAY_L - r : PLAY_R + r;
    cy  = Phaser.Math.Between(38, H - 80);
    cvx = left ? Phaser.Math.FloatBetween(72, 165) : Phaser.Math.FloatBetween(-165, -72);
    cvy = current * Phaser.Math.FloatBetween(0.12, 0.65);
  }

  const gfx = scene.add.graphics().setDepth(4);
  const c = { gfx, x: cx, y: cy, vx: cvx, vy: cvy, r, hitR, shape };
  drawChunk(c);
  chunks.push(c);
}

// ── DRAW OBSTACLE ──────────────────────────────────────────────────────────
function darken(hex, amt) {
  return (
    (Math.max(0, ((hex >> 16) & 0xFF) - amt) << 16) |
    (Math.max(0, ((hex >>  8) & 0xFF) - amt) <<  8) |
     Math.max(0,  (hex        & 0xFF) - amt)
  );
}

function drawChunk(c) {
  const { gfx, x, y, r, shape } = c;
  gfx.clear();

  if (shape === 1) {
    // ── Log ──
    const lw = r * 3.1, lh = r * 0.62;
    gfx.fillStyle(0x7a5c3a, 1);
    gfx.fillRoundedRect(x - lw/2, y - lh/2, lw, lh, 4);
    gfx.lineStyle(1.5, 0x5a3c1a, 1);
    gfx.strokeRoundedRect(x - lw/2, y - lh/2, lw, lh, 4);
    // wood grain
    gfx.lineStyle(1, 0x9a7c5a, 0.35);
    for (let i = -1; i <= 1; i++) {
      const gx = x + i * (lw / 3.2);
      gfx.lineBetween(gx, y - lh * 0.28, gx, y + lh * 0.28);
    }

  } else if (shape === 0) {
    // ── Round rock ──
    const col = 0x4a5a7a;
    gfx.fillStyle(col, 1);
    gfx.fillCircle(x, y, r);
    gfx.lineStyle(2, darken(col, 24), 1);
    gfx.strokeCircle(x, y, r);
    gfx.fillStyle(0xffffff, 0.12);
    gfx.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.42);

  } else {
    // ── Jagged rock ──
    const col = 0x384868;
    const pts = 8, step = (Math.PI * 2) / pts;
    const radii = [];
    for (let i = 0; i < pts; i++) radii.push(r * (i % 2 === 0 ? 1.0 : 0.60));

    gfx.fillStyle(col, 1);
    gfx.beginPath();
    for (let i = 0; i < pts; i++) {
      const a = step * i - Math.PI / 2;
      const rpx = x + Math.cos(a) * radii[i];
      const rpy = y + Math.sin(a) * radii[i];
      if (i === 0) gfx.moveTo(rpx, rpy); else gfx.lineTo(rpx, rpy);
    }
    gfx.closePath();
    gfx.fillPath();

    gfx.lineStyle(1.5, darken(col, 20), 1);
    gfx.beginPath();
    for (let i = 0; i < pts; i++) {
      const a = step * i - Math.PI / 2;
      const rpx = x + Math.cos(a) * radii[i];
      const rpy = y + Math.sin(a) * radii[i];
      if (i === 0) gfx.moveTo(rpx, rpy); else gfx.lineTo(rpx, rpy);
    }
    gfx.closePath();
    gfx.strokePath();
  }
}

// ── DRAW PLAYER ────────────────────────────────────────────────────────────
function drawPlayer(swimming) {
  const g = playerGfx;
  g.clear();
  g.setPosition(playerX, playerY);

  // Tilt: nose up when rising, nose down when sinking
  const tiltDeg = Phaser.Math.Clamp(velY / MAX_VY, -1, 1) * 20;
  g.setAngle(tiltDeg);

  // Glow when swimming
  if (swimming) {
    g.fillStyle(0x44aaff, 0.13);
    g.fillEllipse(0, 0, 50, 38);
  }

  // Oxygen tank
  g.fillStyle(0x888888, 1);
  g.fillRoundedRect(-13, -8, 6, 15, 2);
  g.lineStyle(1, 0x555555, 1);
  g.strokeRoundedRect(-13, -8, 6, 15, 2);
  g.fillStyle(0xcc2222, 1);
  g.fillCircle(-10, -10, 2.5);

  // Wetsuit body
  g.fillStyle(0x0d1c36, 1);
  g.fillEllipse(-2, 0, 34, 22);

  // Accent stripe (brand purple)
  g.fillStyle(0x7c5cfc, 1);
  g.fillRect(-7, -6, 5, 13);

  // Head / mask housing
  g.fillStyle(0x182740, 1);
  g.fillCircle(12, -2, 11);

  // Mask lens
  g.fillStyle(0x33bbee, 0.72);
  g.fillEllipse(13, -3, 15, 9);
  g.lineStyle(1.5, 0x1166aa, 1);
  g.strokeEllipse(13, -3, 15, 9);

  // Snorkel tube
  g.fillStyle(0xff8822, 1);
  g.fillRect(20, -14, 3, 15);
  g.fillCircle(21, -14, 3);

  // Fins (animated kick)
  const kick = Math.sin(waveT * (swimming ? 11 : 5)) * (swimming ? 5 : 1.5);
  g.fillStyle(0x1155aa, 1);
  g.fillTriangle(-4, -7,  -21, -13 + kick, -16,  2 + kick);
  g.fillTriangle(-4,  7,  -21,  15 + kick, -14,  2 + kick);

  // Bubbles exhaled from mask when swimming
  if (swimming && Math.random() < 0.35) {
    g.fillStyle(0xaaffff, 0.42);
    g.fillCircle(19 + Math.random() * 5, -11 + Math.random() * 5, 1.5 + Math.random() * 2);
  }
}

// ── DIE ────────────────────────────────────────────────────────────────────
function die() {
  alive = false;
  goPanel.setVisible(true);
  goTitle.setVisible(true);
  goSub.setText(`Survived: ${Math.floor(score)}s\nCurrent: ${Math.floor(current)} px/s`).setVisible(true);
  goHint.setVisible(true);
}
