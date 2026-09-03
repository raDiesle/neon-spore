import { type Color, type Command, type DragTarget, SNAKE_TURNS } from "@neon-spore/sim";

/**
 * Every `Command` variant, checked field by field, before it ever reaches a
 * `Lockstep` or a simulation tick. `protocol.ts` used to hand `m.commands`
 * across with a bare cast — `{kind:"fire",color:"purple"}` or
 * `{kind:"cannonCol",col:NaN}` would ride a wire frame all the way into the
 * world. This is the one place that stops it, so a bad peer produces a
 * dropped packet here rather than a desync three layers down.
 *
 * The colour set is spelled out here rather than imported, because
 * `packages/sim` does not export one — this is the one place `net` spells
 * it, and `packages/sim/test/purity.test.ts`'s COPIES table is where a
 * second copy elsewhere would be caught.
 */
const COLORS = ["red", "cyan"] as const;
const DRAG_TARGETS: readonly DragTarget[] = ["mazeString", "wardenTether", "lidString"];

const isColor = (x: unknown): x is Color =>
  typeof x === "string" && (COLORS as readonly string[]).includes(x);

const isDragTarget = (x: unknown): x is DragTarget =>
  typeof x === "string" && (DRAG_TARGETS as readonly string[]).includes(x);

/**
 * SNAKE's two, imported rather than spelled out — the opposite of `COLORS`
 * above, and only because the simulation publishes this one. A second copy
 * here would be a list that could fall behind the round it steers.
 */
type SnakeTurn = (typeof SNAKE_TURNS)[number];

const isSnakeTurn = (x: unknown): x is SnakeTurn =>
  typeof x === "string" && (SNAKE_TURNS as readonly string[]).includes(x);

/**
 * How far a hand has carried a handle, in thousandths of a tile. Signed, and
 * that is the whole reason it is not `isNonNegInt`: a drag reports a
 * displacement from where the finger grabbed, so half of every pull is
 * negative. Bounded by a magnitude a screen cannot exceed — a hundred tiles is
 * far wider than any phone — so a peer sending a number meant to overflow
 * arithmetic three layers down is rejected here, which is `isTick`'s argument
 * pointed at the other half of the number line.
 */
const isPull = (x: unknown): x is number =>
  typeof x === "number" && Number.isInteger(x) && Math.abs(x) <= 100_000;

/** A finite whole number, never negative — a column or an id. */
const isNonNegInt = (x: unknown): x is number =>
  typeof x === "number" && Number.isInteger(x) && x >= 0;

/**
 * Capped at 2**31: comfortably past any tick this game will ever reach, and
 * low enough that a peer sending a tick meant to overflow arithmetic
 * downstream (a `Date.now()`-shaped number, or a deliberately huge one) is
 * rejected here instead of doing whatever that overflow does three layers
 * down.
 */
const TICK_MAX = 2 ** 31;
export const isTick = (x: unknown): x is number => isNonNegInt(x) && x < TICK_MAX;

/** A 32-bit unsigned value — the shape `hashWorld` produces. */
export const isUint32 = (x: unknown): x is number =>
  typeof x === "number" && Number.isInteger(x) && x >= 0 && x <= 0xffffffff;

const isBool = (x: unknown): x is boolean => typeof x === "boolean";

/** One square of movement, either way, or none. THE FLEET's `aim` is two. */
const isStep = (x: unknown): x is -1 | 0 | 1 => x === -1 || x === 0 || x === 1;

/** An optional field: either absent, or present and of the right shape. */
const optional = <T>(x: unknown, check: (v: unknown) => v is T): boolean =>
  x === undefined || check(x);

/**
 * One command, checked against its `kind`. An object carrying extra keys the
 * variant does not declare still passes — a newer peer may send more than
 * this build knows to read — but an unrecognised `kind` is rejected outright.
 */
export function decodeCommand(x: unknown): Command | null {
  if (!x || typeof x !== "object") return null;
  const c = x as Record<string, unknown>;
  switch (c.kind) {
    case "cannonCol":
      return isNonNegInt(c.col) ? { kind: "cannonCol", col: c.col } : null;
    case "shieldCol":
      return isNonNegInt(c.col) ? { kind: "shieldCol", col: c.col } : null;
    case "fire":
      return isColor(c.color) ? { kind: "fire", color: c.color } : null;
    case "guard":
      return { kind: "guard" };
    case "intake":
      return { kind: "intake" };
    case "grip":
      return isNonNegInt(c.id) ? { kind: "grip", id: c.id } : null;
    case "prime":
      return isBool(c.on) ? { kind: "prime", on: c.on } : null;
    case "brief":
      return optional(c.on, isBool) ? { kind: "brief", on: c.on as boolean | undefined } : null;
    case "valve":
      return isBool(c.on) && (c.dir === -1 || c.dir === 1)
        ? { kind: "valve", on: c.on, dir: c.dir }
        : null;
    case "call":
      return { kind: "call" };
    // THE FLEET's two verbs. `aim` is a *step* and its two fields are each one
    // of three values, so a peer that sent a column would be rejected here
    // rather than teleporting the sights across the chart three layers down.
    case "aim":
      return isStep(c.dcol) && isStep(c.drow) ? { kind: "aim", dcol: c.dcol, drow: c.drow } : null;
    case "salvo":
      return { kind: "salvo" };
    case "snakeTurn":
      return isSnakeTurn(c.dir) ? { kind: "snakeTurn", dir: c.dir } : null;
    case "snakeFire":
      return { kind: "snakeFire" };
    case "snakeMaw":
      return { kind: "snakeMaw" };
    // `fromMilli` is a **displacement**, so it is signed: a hand that carried
    // a handle to the left reports a negative number, and `isNonNegInt` here
    // dropped exactly those frames — a pull that worked on one device and
    // never crossed the wire. `isPull` is the bound instead, and it is a
    // magnitude bound rather than a floor.
    //
    // `id` is present only for a target that is a creature (THE LID's cord),
    // and optional for the two that are fixtures, so a peer on an older build
    // sending a drag without one is still understood. `fromYMilli` is optional
    // for the same reason turned the other way round: a hand may carry a
    // handle any way it likes now, and a peer from before that sends only the
    // x — which is what an absent y means.
    case "drag":
      return isDragTarget(c.target) &&
        isBool(c.on) &&
        isPull(c.fromMilli) &&
        optional(c.fromYMilli, isPull) &&
        optional(c.id, isNonNegInt)
        ? {
            kind: "drag",
            target: c.target,
            on: c.on,
            fromMilli: c.fromMilli,
            ...(c.fromYMilli === undefined ? {} : { fromYMilli: c.fromYMilli as number }),
            ...(c.id === undefined ? {} : { id: c.id as number }),
          }
        : null;
    case "restart":
      return { kind: "restart" };
    default:
      return null;
  }
}

/**
 * A whole input frame. Returns `null` if any single command in it fails —
 * a half-applied frame (three good presses and a dropped fourth) is worse
 * than a dropped one: the two devices would agree the frame arrived and
 * silently disagree about what it said.
 */
export function decodeCommands(x: unknown): Command[] | null {
  if (!Array.isArray(x)) return null;
  const out: Command[] = [];
  for (const item of x) {
    const c = decodeCommand(item);
    if (!c) return null;
    out.push(c);
  }
  return out;
}
