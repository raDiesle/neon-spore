/**
 * **SNAKE's names on `@neon-spore/sim`'s surface**, cut off `boss-surface.ts`
 * the day the round gained a second axis of state and took that file over its
 * 250-line limit.
 *
 * The seam is one round and nothing depends on it — `boss-surface.ts` re-exports
 * the whole of this, so nothing that reached for a `SnakeTile` had to move —
 * and it is the right round to cut: SNAKE is the only one with two states at
 * once (the clock, and what the body has become) and the only one with a
 * gesture on its own body, so it is the one whose list goes on growing.
 */

export {
  SNAKE_GRIPS,
  SNAKE_MORPH_BEATS,
  type SnakeEntry,
  type SnakeGrip,
  type SnakeRound,
  type SnakeState,
  type SnakeTile,
  // What the body has become, and how much of its tail is off the arena while
  // player 2's thumb is on it — read, never re-derived from `body.length`
  // (`snake.ts`, `docs/spec/interludes.md`).
  snakeCrashed,
  // What is standing on a tile and where a shot would stop: the field's own
  // word for this round is read off these rather than off a second copy of
  // the arena (`render/boss-cue-read-g.ts`, `render/snake-hint.ts`).
  snakeEnemyAt,
  // The mouth in the floor and whether it is open, and the step the body is
  // on this tick: the picture slides on the same step the simulation takes
  // (`snake-home.ts`).
  snakeGate,
  snakeGoingHome,
  snakeGrip,
  snakeHolds,
  snakeLifted,
  snakePointAt,
  snakeResting,
  snakeRockAt,
  snakeRound,
  snakeShotStop,
  snakeStepTicks,
} from "./bosses.js";
