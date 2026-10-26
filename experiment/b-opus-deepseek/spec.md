# Breakout — Implementation Spec (single-pass build)

You are implementing a complete, polished Breakout game. Read this whole spec before writing code. Every numbered requirement below is mandatory.

## 0. Hard constraints

1. Exactly one file: `index.html`. All HTML, CSS and JavaScript inline (`<style>` and one `<script>`).
2. Rendering only through a single `<canvas>` 2D context. No libraries, frameworks, CDNs, external images, web fonts or audio files. Use only system fonts (`"Courier New", monospace` or `system-ui, sans-serif`). Must work offline when opened via `file://` (double-click).
3. All sound is synthesized with the Web Audio API (`AudioContext` + `OscillatorNode`/`GainNode`, noise via an `AudioBuffer`).
4. No `console` errors. Wrap `localStorage` access in try/catch (file:// may throw in some browsers).
5. Use `"use strict"` and plain ES2017+; no modules, no build step.

## 1. Architecture

Single script, organised in clearly commented sections in this order:

1. **Constants** — logical resolution `W = 960`, `H = 720` (4:3). All game logic uses these logical units, never CSS pixels.
2. **Canvas & scaling** — see §9.
3. **Audio** — `Sound` object (§10).
4. **Input** — `Input` object (§8).
5. **Level data** — `LEVELS` array (§5).
6. **Entities** — factory functions returning plain objects: `makeBall`, `makeBrick`, `makePowerUp`, `makeParticle`, `makeBoss`, `makeBossShot`.
7. **Game state** — one `game` object holding: `state`, `score`, `highScore`, `lives`, `levelIndex`, `paddle`, `balls[]`, `bricks[]`, `powerUps[]`, `particles[]`, `floatTexts[]`, `boss` (or null), `bossShots[]`, `effects` (timers), `shake`, `flash`, `stateTimer`.
8. **Update functions** — `update(dt)` dispatching by state; `updatePlaying(dt)` subdivided into `updatePaddle`, `updateBalls`, `updatePowerUps`, `updateBoss`, `updateParticles`.
9. **Render functions** — `render()` dispatching by state; shared `drawBackground`, `drawHUD`, `drawBricks`, `drawPaddle`, `drawBalls`, `drawBoss`, `drawPowerUps`, `drawParticles`, overlays per screen.
10. **Main loop** — §2.

## 2. Game loop and timing (refresh-rate independent)

- Use `requestAnimationFrame` with a **fixed-timestep accumulator**: `STEP = 1/120` seconds.
- Pseudo-code:
  ```
  let last = performance.now(), acc = 0;
  function frame(now) {
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.25) dt = 0.25;          // tab was hidden / huge hitch
    acc += dt;
    while (acc >= STEP) { update(STEP); acc -= STEP; }
    render();
    requestAnimationFrame(frame);
  }
  ```
- All velocities are in logical units **per second**; all timers in seconds. Nothing may assume 60 fps.
- On `document.visibilitychange` → hidden while playing: auto-pause (state `paused`).

## 3. State machine

States: `title`, `serve` (ball on paddle, waiting to launch), `playing`, `paused`, `levelClear`, `lifeLost`, `gameOver`, `victory`.

| From | Event | To |
|---|---|---|
| `title` | Space / Enter / click | `startNewRun()` → `serve` |
| `serve` | Space / click | launch ball → `playing` |
| `serve`/`playing` | P / Esc | `paused` (remember previous state) |
| `paused` | P / Esc / Space / click | back to remembered state |
| `playing` | last ball lost, lives > 1 | lives−1, `lifeLost` (1.2 s), then `resetServe()` → `serve` |
| `playing` | last ball lost, lives == 1 | lives = 0, save high score, `gameOver` |
| `playing` | all breakable bricks gone (and boss dead on level 5) | `levelClear` (2.5 s) |
| `levelClear` | timer ends, levelIndex < 4 | `loadLevel(levelIndex+1)` → `serve` |
| `levelClear` | boss level cleared | save high score, `victory` |
| `gameOver`/`victory` | Space / Enter / click (after a 0.8 s input-lock so a held key doesn't skip it) | `startNewRun()` → `serve` |

- `startNewRun()`: score = 0, lives = 3, `loadLevel(0)`, clear all effects.
- `loadLevel(i)`: build bricks from `LEVELS[i]`, create boss if level has one, reset paddle width/effects, clear power-ups/shots/extra balls, `resetServe()`, show a "LEVEL n — name" banner for 2 s (drawn during serve).
- `resetServe()`: one ball, `stuck = true`, centred on the paddle; reset ball speed to the level's base speed; clear active timed power-ups (wide/slow/laser end on life loss).
- During `serve`, the ball follows the paddle (sits on top, `y = paddle.y - ball.r - 1`). Draw a dotted aim hint line upward and text "SPACE / CLICK TO LAUNCH".
- Launch direction: upward, at a random angle 10°–20° from vertical, to the left or right at random (never exactly vertical).

## 4. Entities, sizes and physics

### Paddle
- `y = H - 50`, height 16, base width 120, wide width 180, x clamped to `[0, W - width]`. Rounded rectangle with a vertical gradient and a glowing top edge.
- Keyboard speed 720 units/s. With mouse: paddle centre follows mouse x directly (clamped). Keyboard and mouse both work; whichever was used last wins.
- Width changes animate smoothly (lerp toward target over ~0.2 s), keeping the centre.

### Ball
- Radius 8. Fields: `x, y, vx, vy, speed, r, stuck, trail[]`.
- Base speed per level: `[360, 390, 420, 440, 460]` units/s. Speed increases by `+6 units/s` per second of active play (and `+4` per brick hit), capped at `base + 260` and an absolute cap of `720`. When speed changes, re-normalise `(vx, vy)` to the new magnitude.
- **Anti-horizontal rule**: after every bounce, enforce `|vy| >= 0.35 * speed` (minimum angle ~20° from horizontal). If violated, set `vy = sign(vy || -1) * 0.35 * speed` and recompute `vx` preserving sign so the magnitude equals `speed`. Also enforce `|vx| >= 0.05*speed` to avoid perfect vertical loops (nudge randomly).
- **Anti-stuck rule**: keep a counter of consecutive bounces off indestructible bricks/walls without touching paddle or a breakable target; after 12, rotate the velocity by a random ±15°.
- Draw a short fading trail (last 8 positions) and a white core with a coloured glow.

### Paddle bounce angle
- On paddle contact (ball moving down, ball bottom crossing paddle top, ball x within paddle x-range ± r):
  ```
  hit = (ball.x - paddleCenter) / (paddle.width / 2)   // clamp to [-1, 1]
  angle = hit * 60°                                     // from vertical
  vx = speed * sin(angle); vy = -speed * cos(angle)
  ball.y = paddle.y - ball.r - 0.5                      // push out
  ```
- Play paddle sound, small particle puff, reset anti-stuck counter.

### Collision approach (must be tunnel-proof)
- Each fixed step, move each ball in **sub-steps** so it never travels more than `ball.r * 0.5` per sub-step: `n = ceil(speed*dt / (r*0.5))`, then for each sub-step move by `v*dt/n` and resolve collisions.
- Walls: left/right/top reflect and clamp position inside (`x = r` etc.). Top wall is at `y = HUD_HEIGHT` (HUD bar is 48 units tall at the top). Bottom: if `y - r > H`, the ball is removed.
- Ball vs rectangle (bricks, boss): circle–AABB test. Find closest point `(cx, cy)` on the rect to the ball centre; if `dist² < r²`, collision. Determine the side by the penetration: compute overlaps `ox = r - |ball.x - cx|`-style, or simpler: if the closest point lies on a vertical face (cx equals rect.left or rect.right and cy strictly inside) reflect `vx`; if on a horizontal face reflect `vy`; on a corner reflect along the normal `(ball - closest)` normalised (`v = v - 2(v·n)n`). Then push the ball out along the normal so it is no longer overlapping.
- Only reflect if the ball is moving **into** the surface (`v·n < 0`) — prevents double-flips and sticking.
- Handle at most **one brick collision per sub-step** (the one with the deepest penetration / nearest), so the ball never flips twice in one sub-step when hitting the seam between two bricks.
- After any bounce apply the anti-horizontal rule.

## 5. Bricks and level data

### Grid
- 12 columns × up to 10 rows. Brick size 72 × 26, gap 4. Grid width = 12·72 + 11·4 = 908; left offset = (960 − 908)/2 = 26. Top offset = 90 (below the HUD).
- Bricks are created from string maps. One character per cell:

| Char | Meaning |
|---|---|
| `.` | empty |
| `1` | normal brick, 1 hit (colour by row from a palette) |
| `2` | tough brick, 2 hits |
| `3` | tough brick, 3 hits |
| `#` | indestructible (steel) |
| `P` | normal brick guaranteed to drop a power-up |

### Brick types
- **Normal** (`hp = 1`): bright row colour, 50 points.
- **Tough** (`hp = 2` or `3`): darker metallic colour; show damage: each lost hit adds visible crack lines (pre-generated random line segments per brick, draw `maxHp - hp` sets of cracks) and the fill darkens/brightness changes; a small number pip of remaining hits optional. Points: 100 per hit taken + 150 on destruction.
- **Indestructible** (`#`): grey steel with rivets and diagonal hatch; on hit plays a metallic "clink", sparks, but never breaks and does **not** count toward clearing.
- On every hit: brick flashes white for 0.08 s, spawn 6–10 particles in the brick's colour. On destruction: 14–20 particles, floating score text (“+50”), 4-unit screen shake for 0.1 s.
- Level is cleared when the count of bricks with `type !== 'steel'` and `alive` is 0 (and boss dead if present).

### The 5 levels (exact maps, 12 chars wide)

Level 1 — "Warm Up" (base speed 360)
```
............
.1111111111.
.1111111111.
.11P1111P11.
.1111111111.
.1111111111.
```

Level 2 — "Pyramid" (base 390)
```
.....22.....
....1221....
...11P111...
..1112211...
.111111P111.
111122221111
```

Level 3 — "Fortress" (base 420)
The steel frame is open at the top corners and at the sides of rows 4–6 so every breakable brick is reachable:
```
#.########.#
#2222222222#
#1111P11111#
.1.33..33.1.
.1111111P11.
............
...##..##...
```

Level 4 — "Checkerboard" (base 440)
```
2.2.2.2.2.2.
.1.1.1.1.1.1
3.P.3.3.P.3.
.1.1.1.1.1.1
2.2.2.2.2.2.
#..#....#..#
.1111111111.
```

Level 5 — "The Core" (boss level, base 460)
Bricks form a shield in front of the boss area; the boss occupies the upper area. Bricks start at row offset y = 300 (override `top` to 300 for this level).
```
..#..##..#..
.1P1.11.1P1.
.2222..2222.
```

Store each level as `{ name, speed, top, map: [...strings], boss: bool }`. Validate on load that all strings are 12 chars (pad with `.` if not). Each row colour: palette `['#ff4d6d','#ff8c42','#ffd23f','#4ade80','#22d3ee','#818cf8','#e879f9']` indexed by row.

## 6. Power-ups

- Drop chance on breaking a non-`P` brick: 18%. `P` bricks always drop. Boss also drops one each time its HP crosses a 25% threshold.
- Power-up object: a capsule 36×16 falling at 160 units/s, letter icon, coloured, gently pulsing. Caught when it overlaps the paddle rect; removed when `y > H`.
- Types (choose randomly with weights):

| Key | Letter | Colour | Effect | Duration |
|---|---|---|---|---|
| `wide` | W | `#4ade80` | paddle width → 180 | 12 s (refresh timer if caught again) |
| `multi` | M | `#22d3ee` | each current ball (in-play, max 6 total) spawns 2 copies rotated ±25° | instant |
| `slow` | S | `#facc15` | all balls' speed × 0.7, speed growth paused | 8 s, then restore normal growth |
| `laser` | L | `#f87171` | paddle fires two bolts every 0.35 s automatically while active (or on Space/click); bolts move up at 900 u/s and deal 1 hit to bricks/boss | 8 s |
| `life` | + | `#f472b6` | +1 life (max 5), weight low (5%) | instant |

Weights: wide 30, multi 30, slow 15, laser 20, life 5.
- Catching: +25 points, sound, floating text with the power-up name.
- Show active timed effects in the HUD as small icons with a shrinking bar (remaining time / duration). When a timed effect expires: revert (paddle width back to 120, speed growth resumes, lasers stop) and play a short "power-down" blip.
- Multi-ball: when one of several balls falls, just remove it; a life is lost only when `balls.length === 0`.

## 7. Boss (level 5)

- `boss = { x, y: 140, w: 240, h: 70, hp: 40, maxHp: 40, vx: 120, phase, hitFlash, fireTimer, alive }`, centred at start.
- **Movement**: moves left/right between `x = 20` and `W − w − 20`, bouncing at the edges. Speed 120 u/s; when HP < 50% speed 180; when HP < 25% speed 240 and it also bobs vertically (`y = 140 + sin(t*2)*20`).
- **Fights back**: every `fireTimer` (2.0 s; 1.4 s below 50% HP; 1.0 s below 25%) it fires a shot from its bottom centre toward the paddle's current x (aimed, speed 260 u/s, radius 7, glowing red-orange orb). Below 25% HP it fires a spread of 3 (±15°). If a shot hits the paddle: paddle is "stunned" for 1.0 s (cannot move, flickers), screen shake 8, sound. Shots do not cost a life. Shots are destroyed by laser bolts and by leaving the screen.
- **Taking damage**: collides with balls like a rectangle (same circle–AABB as bricks); each ball hit = −1 HP, laser bolt = −1 HP. Flash white 0.1 s, shake 3, particles, +100 points per hit. When killed: big explosion (60+ particles over 1 s, several shakes), +5000 points, then `levelClear` → `victory`.
- Level 5 is cleared only when the boss is dead (shield bricks need not all be destroyed; ignore remaining bricks once boss is dead).
- **Health bar**: drawn at top of the playfield under the HUD: label "CORE GUARDIAN", bar 600×14 centred, fill colour shifts green → yellow → red with HP fraction, smooth "ghost" bar that lags behind to show recent damage. Also draw the boss itself with visible damage: an "eye" that tracks the ball, armour plates, cracks appear as HP drops, colour pulses when low.

## 8. Controls (Input)

- Keyboard: `ArrowLeft`/`KeyA` move left, `ArrowRight`/`KeyD` move right, `Space` launch / confirm, `KeyP` or `Escape` pause toggle, `Enter` also confirms on menus, `KeyM` toggles mute. Use `e.code`. `preventDefault` for Space and arrows so the page doesn't scroll.
- Track keys in a `Set` of held keys, plus "just pressed" edge detection consumed by update (avoid auto-repeat re-triggering: ignore `e.repeat` for action keys).
- Mouse: `mousemove` on the window → convert client coords to logical coords using the canvas' bounding rect and scale (`(clientX - rect.left) * W / rect.width`). Mouse controls the paddle only after it actually moves. `mousedown` (left button) on the canvas = launch / confirm / resume from pause. Touch: optional, mirror mousemove/mousedown with `touchmove`/`touchstart` (`passive:false`).
- The first user gesture must `resume()` the `AudioContext` (browsers block autoplay).

## 9. Canvas scaling and rendering style

- `<body>` black-ish background `#05060f`, margin 0, overflow hidden, canvas centred (flex). Canvas internal size = `W*dpr × H*dpr` where `dpr = min(devicePixelRatio, 2)`; set `canvas.width = W*dpr`, `canvas.height = H*dpr`, each frame `ctx.setTransform(dpr,0,0,dpr,0,0)` then draw in logical units.
- CSS size: on `resize`, `scale = min(innerWidth / W, innerHeight / H)`, set `canvas.style.width = W*scale + 'px'`, `height = H*scale + 'px'`. Aspect ratio always 4:3, letterboxed.
- **Visual style: neon/synthwave.** Dark navy gradient background with a slowly scrolling faint grid in perspective at the bottom and a twinkling starfield (pre-generated 120 stars). Bricks: rounded rects with a gradient, a top highlight, and `shadowBlur` glow in their colour (keep shadowBlur modest for performance; reset to 0 after). Text: monospace, bold, glowing.
- Screen shake: offset the whole playfield draw by random ±shake units; shake decays exponentially (`shake *= exp(-12*dt)`). Flash: full-screen white overlay with alpha decaying.
- Particles: `{x,y,vx,vy,life,maxLife,color,size}`, gravity 600 u/s², drawn as small squares fading with life. Cap total particles at 600.
- Floating texts: rise 40 u/s, fade over 0.8 s.

### HUD (top bar, 48 units, always visible during gameplay screens)
- Left: `SCORE 0001234`. Centre: `LEVEL 3/5 · FORTRESS`. Right: `HI 0012000` and lives as small paddle/heart icons (`♥ ♥ ♥`, drawn as shapes or text). Active power-up icons with timer bars under the centre text. A small "P: PAUSE  M: MUTE" hint can sit at the bottom right in dim text.

### Screens
- **Title**: big glowing title "NEON BREAKOUT", subtitle, animated demo ball bouncing behind, high score display, control instructions (←/→ or A/D or mouse to move · Space/click to launch · P/Esc to pause · M to mute), blinking "PRESS SPACE OR CLICK TO START".
- **Serve**: playfield plus banner "LEVEL n — NAME" (fades out after 2 s) and launch hint.
- **Paused**: playfield dimmed (`rgba(0,0,0,0.6)`), "PAUSED", "Press P / Esc / Click to resume". Game time frozen (no updates except UI blink).
- **Life lost**: brief red flash, text "BALL LOST", lives decrement visible.
- **Level clear**: "LEVEL n CLEAR!" with level bonus `1000 * (levelIndex+1)` added once, shown as counting-up text; confetti particles.
- **Game over**: "GAME OVER", final score, high score (with "NEW HIGH SCORE!" if beaten, blinking), "PRESS SPACE OR CLICK TO PLAY AGAIN".
- **Victory**: "VICTORY!", "The Core Guardian is destroyed", final score, high score / new high score, fireworks particles continuously, "PRESS SPACE OR CLICK TO PLAY AGAIN".

## 10. Audio (Web Audio API)

- Lazily create `AudioContext` on first user gesture; master `GainNode` at 0.25; `muted` flag toggled with M.
- Helper `tone(freq, duration, type='square', vol=0.3, slideTo=null)`: oscillator → gain with quick attack (5 ms) and exponential decay to 0.001; optional `frequency.exponentialRampToValueAtTime(slideTo)`.
- Helper `noise(duration, vol, filterFreq)`: white-noise buffer (create once, 1 s) through a `BiquadFilter` lowpass.
- Sounds:
  - paddle hit: `tone(220, 0.08, 'square')`
  - wall: `tone(330, 0.04, 'triangle', 0.15)`
  - brick hit (tough, not broken): `tone(440, 0.06, 'square')`
  - brick break: `tone(660 + 40*comboCount (cap 1200), 0.09, 'square')` — combo resets on paddle hit
  - steel clink: `tone(1400, 0.05, 'triangle')` + short noise
  - power-up caught: rising arpeggio 523 → 659 → 784 (three tones 60 ms apart)
  - power-down: `tone(400, 0.15, 'sawtooth', 0.2, 200)`
  - life lost: `tone(300, 0.5, 'sawtooth', 0.3, 80)`
  - boss hit: `noise(0.12)` + `tone(110, 0.12, 'square')`
  - boss shot fired: `tone(180, 0.15, 'sawtooth', 0.2, 90)`
  - paddle stunned: noise 0.25 s
  - boss explosion: noise 1.0 s with lowpass sweep + low tone slide 120→30
  - level clear: arpeggio C-E-G-C (523, 659, 784, 1047)
  - game over: descending 392 → 330 → 262 → 196
  - victory: a short fanfare (6 notes)
- Combo scoring: consecutive brick breaks without touching the paddle multiply points by `min(1 + combo*0.1, 2)`.

## 11. Score and high score

- `highScore` loaded from `localStorage.getItem('neonBreakout.highScore')` at boot (parseInt, default 0, try/catch).
- Update `highScore` live when score exceeds it; persist to localStorage on game over, victory, level clear and when the page is hidden (`visibilitychange`/`beforeunload`).

## 12. Robustness checklist (verify mentally before finishing)

- Ball can never leave the playfield through the sides/top; never tunnels through bricks, boss or paddle (sub-stepping + push-out).
- Ball never stays horizontal (anti-horizontal clamp) and never loops forever between steel bricks (anti-stuck rotation).
- Every level is solvable: no breakable brick is fully enclosed by steel.
- Timed power-ups expire and revert, and are cleared on life loss and level change.
- Pause truly freezes simulation; resizing the window keeps the 4:3 aspect ratio and correct mouse mapping.
- Game speed identical on 60 Hz and 144 Hz displays (fixed step).
- Restart from game over / victory resets score, lives, level, effects, boss.
- No runtime errors in the console in any state.
