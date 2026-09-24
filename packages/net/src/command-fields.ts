import { type Color, type DragTarget, PULSE_LANES, SNAKE_TURNS } from "@neon-spore/sim";

/**
 * The shape of every field a `Command` can carry on the wire, one predicate
 * each, for `command-codec.ts` to ask for by name. That file is a switch with
 * a case per kind the simulation knows and is at its limit; the checks were
 * the seventy lines above the switch, and a kind added there should cost one
 * `case`, not the file.
 *
 * The colour set is spelled out here rather than imported, because
 * `packages/sim` does not export one — this is the one place `net` spells
 * it, and `packages/sim/test/purity.test.ts`'s COPIES table is where a
 * second copy elsewhere would be caught.
 */
export const COLORS = ["red", "cyan"] as const;
// biome-ignore format: one line a row of the sim's DragTarget union, kept flat so the file stays under its limit
export const DRAG_TARGETS: readonly DragTarget[] = [
  "mazeString", "wardenTether", "lidString", "gripBody", "choirLeft", "choirRight",
  "balloonLeft", "balloonRight", "crank", "orreryRing", "sinewLeft", "sinewRight",
  "surgeBulb", "antiphonOrgan", "instarMark", "filament", "stareLid", "queenMark",
  "diastoleChamber", "mirrorLobe", "gorgeLobe", "mazeHeart", "gaugeNeedle", "gaugeBand",
  "wardenEye", "wardenHatch", "fleetBreach", "fleetRake", "fleetWreck",
  "vaneArm", "vaneHousing", "snakeJaws", "snakeTail", "pinPlunger", "pinTable",
  "scoutLine", "scoutPrime", "pulseMeter", "batonSocket", "undertowPin", "undertowFree",
  "throatRing", "throatTube", "candleWick", "curtainHem",
  "tasterBlade", "tasterGap", "tasterLock",
  "ledgerFoot", "ledgerSocket", "ledgerBead", "ledgerCord",
  "leadStalk", "scuttlePart", "antiphonRail", "wellSeam", "hiveLobe",
  "gimbalOuter", "gimbalInner",
  "spoolBrake",
  "haspLatch", "haspWheel",
  "ratchetCatch", "ratchetPawl",
];

export const isColor = (x: unknown): x is Color =>
  typeof x === "string" && (COLORS as readonly string[]).includes(x);

export const isDragTarget = (x: unknown): x is DragTarget =>
  typeof x === "string" && (DRAG_TARGETS as readonly string[]).includes(x);

/**
 * SNAKE's two, imported rather than spelled out — the opposite of `COLORS`
 * above, and only because the simulation publishes this one. A second copy
 * here would be a list that could fall behind the round it steers.
 */
type SnakeTurn = (typeof SNAKE_TURNS)[number];
type PulseLane = (typeof PULSE_LANES)[number];

export const isSnakeTurn = (x: unknown): x is SnakeTurn =>
  typeof x === "string" && (SNAKE_TURNS as readonly string[]).includes(x);

export const isPulseLane = (x: unknown): x is PulseLane =>
  typeof x === "string" && (PULSE_LANES as readonly string[]).includes(x);

/**
 * How far a hand has carried a handle, in thousandths of a tile. Signed, and
 * that is the whole reason it is not `isNonNegInt`: a drag reports a
 * displacement from where the finger grabbed, so half of every pull is
 * negative. Bounded by a magnitude a screen cannot exceed — a hundred tiles is
 * far wider than any phone — so a peer sending a number meant to overflow
 * arithmetic three layers down is rejected here, which is `isTick`'s argument
 * pointed at the other half of the number line.
 */
export const isPull = (x: unknown): x is number =>
  typeof x === "number" && Number.isInteger(x) && Math.abs(x) <= 100_000;

/** A finite whole number, never negative — a column or an id. */
export const isNonNegInt = (x: unknown): x is number =>
  typeof x === "number" && Number.isInteger(x) && x >= 0;

/**
 * Capped at 2**31: comfortably past any tick this game will ever reach, and
 * low enough that a peer sending a tick meant to overflow arithmetic
 * downstream (a `Date.now()`-shaped number, or a deliberately huge one) is
 * rejected here instead of doing whatever that overflow does three layers
 * down.
 */
export const TICK_MAX = 2 ** 31;
export const isTick = (x: unknown): x is number => isNonNegInt(x) && x < TICK_MAX;

/** A 32-bit unsigned value — the shape `hashWorld` produces. */
export const isUint32 = (x: unknown): x is number =>
  typeof x === "number" && Number.isInteger(x) && x >= 0 && x <= 0xffffffff;

export const isBool = (x: unknown): x is boolean => typeof x === "boolean";

/** One square of movement, either way, or none. THE FLEET's `aim` is two. */
export const isStep = (x: unknown): x is -1 | 0 | 1 => x === -1 || x === 0 || x === 1;

/** An optional field: either absent, or present and of the right shape. */
export const optional = <T>(x: unknown, check: (v: unknown) => v is T): boolean =>
  x === undefined || check(x);
