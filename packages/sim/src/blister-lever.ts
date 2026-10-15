import { blisterBlow, blisterGestureOf, blisterIsUp, blisterMayTap } from "./blister.js";
import { ticksPerBeat } from "./config-derived.js";
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
 * `blisterLeverToMilli`, every tick is one towards `blisterLeverBeats`; out
 * of it, the count starts again. A whole hold is a blow, and the hand is spent
 * until it lifts: a lever counted once is let go and carried again, the lab's
 * spring-back. **A lift before the hold is done is refused out loud**
 * (`pullShort`), the PULL LAB's *short · red*, unless the knob never left its
 * rest — a tap is never refused.
 *
 * It keeps SWIPE's fields (`blister-swipe.ts`): a bit a seat in
 * `blisterStrokes` for a hand on it, the same seat's bit shifted two up for a
 * hand spent or voided, and the depth in `blisterAlongMilli`; the hold in
 * progress is HOLD's `blisterHeldTicks`. A sink voids it as it voids a
 * stroke (`blister.ts`), so a hold in progress is lost with it.
 */
export function blisterLeverHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "blisterLever") return;
  const c = world.creatures.find((x) => x.id === command.id);
  if (c === undefined || blisterGestureOf(c) !== "lever") return;
  const open = player;
  const dead = player << 2;
  const hands = c.blisterStrokes ?? 0;
  if (!command.on) {
    const live = (hands & open) !== 0 && blisterIsUp(c);
    const moved = (c.blisterAlongMilli ?? 0) >= REST_MILLI;
    setHands(c, hands & ~(open | dead));
    if (live && moved) {
      world.events.push({ type: "pullShort", col: c.col, player });
    }
    if ((c.blisterStrokes ?? 0) === 0) c.blisterHeldTicks = undefined;
    return;
  }
  if ((hands & dead) !== 0 || !blisterIsUp(c) || !blisterMayTap(c, player)) return;
  setHands(c, hands | open);
  const depth = Math.max(0, Math.min(world.cfg.blisterLeverMilli, command.fromYMilli ?? 0));
  c.blisterAlongMilli = depth;
}

/**
 * The clock over every LEVER blister, on the tick for HOLD's reason
 * (`blister-hold.ts`): a hand in the band counts the tick, and a whole hold is
 * a blow. Two hands on a BOTH blister share the one knob, the last to move it
 * setting its depth.
 */
export function stepBlisterLevers(world: World): void {
  const { cfg } = world;
  const need = cfg.blisterLeverBeats * ticksPerBeat(cfg);
  for (const c of [...world.creatures]) {
    if (c.kind !== "blister" || blisterGestureOf(c) !== "lever") continue;
    const open = (c.blisterStrokes ?? 0) & 3;
    if (!blisterIsUp(c) || open === 0 || !blisterLeverInBand(world, c)) {
      c.blisterHeldTicks = undefined;
      continue;
    }
    const held = (c.blisterHeldTicks ?? 0) + 1;
    if (held < need) {
      c.blisterHeldTicks = held;
      continue;
    }
    c.blisterHeldTicks = undefined;
    // Counted: every hand on it is spent until it lifts, and the knob goes home.
    setHands(c, ((c.blisterStrokes ?? 0) & 12) | (open << 2));
    blisterBlow(world, c);
  }
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
  const need = world.cfg.blisterLeverBeats * ticksPerBeat(world.cfg);
  return Math.min(1, (c.blisterHeldTicks ?? 0) / Math.max(1, need));
}

/** Whether a hand that still counts is on its knob now. */
export function blisterLeverHeld(c: Creature): boolean {
  return blisterGestureOf(c) === "lever" && ((c.blisterStrokes ?? 0) & 3) !== 0;
}

function setHands(c: Creature, bits: number): void {
  c.blisterStrokes = bits === 0 ? undefined : bits;
  if ((bits & 3) === 0) c.blisterAlongMilli = undefined;
}
