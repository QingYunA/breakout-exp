# Breakout game — requirement

Build a complete, polished Breakout (brick-breaker) game for the browser.

## Hard constraints
- One file: `index.html`. HTML, CSS and JavaScript all inline.
- Draw with `<canvas>`. No libraries, no frameworks, no CDN, no external images, fonts or audio files. It must work offline by double-clicking the file.
- Sound effects are generated with the Web Audio API.

## Game content
- 5 levels, each with a different brick layout. Clearing all breakable bricks advances to the next level.
- Level 5 ends with a boss: a large target that takes many hits, visibly shows its remaining health, and moves or fights back in some way.
- Brick types: normal bricks (1 hit), tough bricks (several hits, visibly damaged as they take hits), and indestructible bricks (cannot be broken, do not count toward clearing).
- At least 2 power-ups that drop from broken bricks and are caught with the paddle, e.g. wider paddle and multi-ball. Power-ups that last for a while must expire.
- 3 lives. Losing the last ball costs a life; losing the last life is game over.
- Score, with a high score saved in `localStorage`.
- HUD showing score, lives, current level, and high score.

## Screens and flow
- Title screen → play → level-clear transition → … → victory screen after the boss.
- Game over screen. Restarting from game over or victory starts a fresh run.
- Pause and resume.

## Controls
- Keyboard: left/right arrows (and A/D) move the paddle; Space launches the ball; P or Esc pauses.
- Mouse: moving the mouse moves the paddle; clicking launches the ball.
- The ball sits on the paddle until launched, at the start of each life and level.

## Feel and look
- The ball's bounce angle depends on where it hits the paddle.
- Collisions are reliable: the ball never passes through bricks or the paddle, never gets stuck, and never ends up moving perfectly horizontally forever.
- Ball speed rises gradually within a level, within a sensible cap.
- A coherent visual style with feedback on hits (particles, flashes, shake, or similar).
- Runs at a steady frame rate; game speed does not depend on the monitor's refresh rate.
- The canvas fits the browser window while keeping its aspect ratio.
