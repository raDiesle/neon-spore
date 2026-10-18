import {
  BLISTER_SPENT,
  blisterBlow,
  blisterByOf,
  blisterGestureOf,
  blisterIsUp,
  blisterMayTap,
} from "./blister.js";
import { blisterHoldTicksOf } from "./blister-numbers.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BLISTER's LEVER** (`docs/spec/blister.md`, *The gestures*): THE LEVER
 * LAB's lever on the body — its knob carried down a groove into a band and
 * held there, a blow for every hold long enough.
 *
 * The hand is a `drag` on `blisterLever` with `id` the body: the press takes
 * the knob, every move says how far down the groove the thumb has carried it
 * (`fromYMilli`, in thousandths of a tile, from the body's centre), and the
 * knob stands where it is put — **the depth is the value**, for as long as the
 * thumb stays. Inside the band from `blisterLeverFromMilli` to
 * `blisterLeverToMilli`, every tick is one towards `blisterHoldTicksOf`; out
 * of it, the count starts again. A whole hold is a blow, and the hand is spent
 * until it lifts: a lever counted once is let go and carried again, the lab's
 * spring-back. **A lift before the hold is done is refused out loud**
 * (`pullShort`), the PULL LAB's *short · red*, unless the knob never left its
 * rest — a tap is never refused.
 *
 * It keeps SWIPE's fields (`blister-swipe.ts`): a bit a seat in
 * `blisterStrokes` for a hand on it and the depth in `blisterAlongMilli`; the
 * hold in progress is HOLD's `blisterHeldTicks`. A whole hold is a blow; the
 * last one owed knocks the body out (`blister.ts`), and any other springs the
 * knob back and spends the hand until it lifts (`BLISTER_SPENT`).
 */
export function blisterLeverHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "blisterLever") return;
  const c = world.creatures.find((x) => x.id === command.id);
  if (c === undefined || blisterGestureOf(c) !== "lever") return;
  const open = player;
  const hands = c.blisterStrokes ?? 0;
  if (!command.on) {
    const live = (hands & open) !== 0 && blisterIsUp(c);
    const moved = (c.blisterAlongMilli ?? 0) >= REST_MILLI;
    setHands(c, hands & ~(open | (open * BLISTER_SPENT)));
    if (live && moved) {
      world.events.push({ type: "pullShort", col: c.col, player });
    }
    if (((c.blisterStrokes ?? 0) & 3) === 0) c.blisterHeldTicks = undefined;
    return;
  }
  if ((hands & (open * BLISTER_SPENT)) !== 0) return;
  if (!blisterIsUp(c) || !blisterMayTap(c, player)) return;
  setHands(c, hands | open);
  const depth = Math.max(0, Math.min(world.cfg.blisterLeverMilli, command.fromYMilli ?? 0));
  c.blisterAlongMilli = depth;
}

/**
 * The clock over every LEVER blister, on the tick for HOLD's reason
 * (`blister-hold.ts`): a hand in the band counts the tick, and a whole hold is
 * a blow. Two hands on an EITHER blister share the one knob, the last to move it
 * setting its depth; a BOTH one counts only while both are on it.
 */
export function stepBlisterLevers(world: World): void {
  for (const c of [...world.creatures]) {
    if (c.kind !== "blister" || blisterGestureOf(c) !== "lever") continue;
    if (!blisterIsUp(c) || !leverHandsOn(c) || !blisterLeverInBand(world, c)) {
      c.blisterHeldTicks = undefined;
      continue;
    }
    const held = (c.blisterHeldTicks ?? 0) + 1;
    if (held < blisterHoldTicksOf(world.cfg, c)) {
      c.blisterHeldTicks = held;
      continue;
    }
    // Counted: a blow, and the body gone with the last one owed.
    blisterBlow(world, c);
  }
}

/** Whether the hands it needs are on its knob: any one, or on BOTH the two. */
function leverHandsOn(c: Creature): boolean {
  const on = (c.blisterStrokes ?? 0) & 3;
  return blisterByOf(c) === "both" ? on === 3 : on !== 0;
}

/** A depth short of this is the knob at rest: a press that never moved it, and never refused. */
const REST_MILLI = 40;

/** Whether the knob stands in the band now. */
export function blisterLeverInBand(world: World, c: Creature): boolean {
  const at = c.blisterAlongMilli ?? 0;
  return at >= world.cfg.blisterLeverFromMilli && at <= world.cfg.blisterLeverToMilli;
}

/** How far down its groove the knob stands, 0..1: where it is drawn. */
export function blisterLeverDepth(world: World, c: Creature): number {
  return Math.min(1, (c.blisterAlongMilli ?? 0) / Math.max(1, world.cfg.blisterLeverMilli));
}

/** How much of the hold in the band is done, 0..1: what the dial runs round. */
export function blisterLeverShare(world: World, c: Creature): number {
  return Math.min(1, (c.blisterHeldTicks ?? 0) / blisterHoldTicksOf(world.cfg, c));
}

/** Whether a hand that still counts is on its knob now. */
export function blisterLeverHeld(c: Creature): boolean {
  return blisterGestureOf(c) === "lever" && ((c.blisterStrokes ?? 0) & 3) !== 0;
}

function setHands(c: Creature, bits: number): void {
  c.blisterStrokes = bits === 0 ? undefined : bits;
  if ((bits & 3) === 0) c.blisterAlongMilli = undefined;
}
