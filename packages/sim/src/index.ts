/**
 * **`@neon-spore/sim`'s whole surface**, and nothing else: the shapes a caller
 * names, and four grouped barrels beside them.
 *
 * It was one flat list, and on 6 September 2026 it reached its 250-line limit
 * and started deciding API questions with it — a lane wanting two more fence
 * rules could not fit the nine lines an explicit list would take and shipped
 * `export * from "./fence.js"` instead, widening the surface for the line
 * count rather than for the boundary. A barrel has no seam in the code to split
 * along, so it is split by *subject*: `index-bodies.ts` was already the first
 * of them, and `index-creatures.ts`, `index-ship.ts` and `index-run.ts` are the
 * rest. Each carries the argument for its own group.
 *
 * `index.ts` stays the one import path. Nothing outside `packages/sim` moved.
 */

export * from "./boss-surface.js";
export * from "./fault-surface.js";
export * from "./index-bodies.js";
export * from "./index-creatures.js";
export * from "./index-run.js";
export * from "./index-ship.js";
export type {
  Bullet,
  Color,
  Command,
  Creature,
  CreatureKind,
  DragTarget,
  Pod,
  PodKind,
  RockKind,
  RockSize,
  Scar,
  TimedCommand,
} from "./types.js";
export {
  bodyCenterCol,
  clampSpanCol,
  colSpan,
  fallTilesPerBeat,
  isBossBody,
  isGrippable,
  isMeteorKind,
  isWardable,
  livingKindForColor,
  METEOR_TIER_KINDS,
  occupiesCol,
  otherColor,
  SNAKE_TURNS,
  spanCenterCol,
  spanOf,
  spawnSpan,
  WARDEN_COLS,
} from "./types.js";
