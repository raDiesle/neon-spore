/** The two ammunition colours. Colour is bioluminescence, not decoration. */
export type Color = "red" | "cyan";

// What a shot in flight is: lifted out when THE LID's own field took this
// file over its limit, and re-exported so nothing reaching for one had to
// move. `bullet-types.ts` says why the bullet is the half that moved.
export type { Bullet } from "./bullet-types.js";
// What a press *is* — the one thing in this file that was never a shape a
// world is made of. It lives in `command-types.ts` now and is re-exported
// here, the way `creature-kinds.ts` and `kinds.ts` already are, so nothing
// that reaches for a `Command` through this file had to move.
export type { Command, DragTarget, SnakeTurn, TimedCommand } from "./command-types.js";
export { SNAKE_TURNS } from "./command-types.js";
export { CREATURE_KINDS, type CreatureKind, kindCode } from "./creature-kinds.js";
// What a body on the field is: the last and largest half to leave this file,
// and the one that was actually growing. `creature-types.ts` says why, and it
// is re-exported here so nothing reaching for a `Creature` had to move.
export type { Creature } from "./creature-types.js";
export type { GuardStats, Scar } from "./hull-types.js";
export type { RockKind } from "./kinds.js";
export {
  fallTilesPerBeat,
  isBossBody,
  isGrippable,
  isMeteorKind,
  isWardable,
  livingKindForColor,
  METEOR_TIER_KINDS,
  otherColor,
} from "./kinds.js";
// What a pod is: lifted out beside `hull-types.ts` when this file went over
// its limit, and re-exported here so nothing reaching for one had to move.
export { POD_KINDS, type Pod, type PodKind } from "./pod-types.js";
// How wide a body is: `span.ts`, cut out of `kinds.ts` when THE GYRE arrived
// and re-exported here so nothing reaching for `spanOf` through it had to move.
export {
  bodyCenterCol,
  clampSpanCol,
  colSpan,
  occupiesCol,
  occupiesLane,
  type RockSize,
  spanCenterCol,
  spanOf,
  WARDEN_COLS,
} from "./span.js";
