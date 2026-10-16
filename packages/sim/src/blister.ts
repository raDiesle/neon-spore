import { blisterBlowsOf, blisterNumbersOnSpawn, blisterUpBeatsOf } from "./blister-numbers.js";
import { hullRow, type SimConfig } from "./config.js";
import type {
  BlisterBy,
  BlisterGesture,
  BlisterSpawn,
  BlisterWay,
} from "./creature-state-blister.js";
import { removeCreature } from "./field.js";
import { breachHull } from "./hull-damage.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BLISTER: a body you knock back down (`docs/spec/blister.md`).
 *
 * It does not fall. It arrives under a pore — a tile of the field — where
 * nothing touches it and a bolt passes over (`shot-reach.ts`), comes up, and
 * stays up for `blisterUpBeatsOf`. **Its blows landed and it is gone; still up
 * when those beats run out and it breaks the hull in its column, and the wave
 * is lost** — the owner, 15 October 2026: *once player executed correct, it
 * should not appear again, and if time ran out, the wave is lost
 * immediately.* Until then it sank, came up again nearer the hull and kept
 * a count of blows across its surfacings. One blow by default; a gesture's
 * default or a wave may ask for more, all inside the one surfacing (the
 * owner, 16 October 2026, `blister-numbers.ts`).
 *
 * **Only the hand its `by` names counts**, and only while it is up. The other
 * seat is shown the pore swelling a beat before it comes up
 * (`blisterSwelling`), so a hand that waits to see it arrives late and the
 * pair has to say *now*.
 *
 * The tap is the soundbox's command, `tap {id}`, and whose tap it is belongs to
 * the creature rather than to the command (`beatboxTapped`'s arrangement).
 */

/** The topmost row a blister may come up on: `mine.ts`' `TOP_ROW`, for its
 * reason — a body in the first row is drawn half under the radar strip. */
const TOP_ROW = 2;

/**
 * Where it surfaces: the authored row, pulled into the band from the top row
 * to the one above the hull, where a body drawn on the hull would sit on it.
 */
export function blisterPlaceRow(cfg: SimConfig, row: number | undefined): number {
  return Math.max(TOP_ROW, Math.min(hullRow(cfg) - 1, row ?? TOP_ROW));
}

/**
 * What a blister arrives with: its seat, its gesture, and the pore under it
 * already swelling. It arrives **under**, so the first thing on the field is
 * the bulge on the partner's screen — the arrival is a thing to say before it
 * is a thing to hit. The seat defaults to the navigator, the director's own
 * default (`docs/spec/blister.md`).
 */
export function blisterOnSpawn(cfg: SimConfig, entry: BlisterSpawn): Partial<Creature> {
  const { by, gesture, way } = entry;
  return {
    ...blisterNumbersOnSpawn(gesture ?? "tap", entry),
    blisterBy: by ?? 2,
    blisterUp: false,
    blisterClock: cfg.blisterDownBeats,
    // Absent a tap, so a tap blister is byte-for-byte the blister lane 1 built,
    // and a way only on the gesture that goes one.
    ...(gesture === undefined || gesture === "tap" ? {} : { blisterGesture: gesture }),
    ...(gestureGoes(gesture, way) ? { blisterWay: way } : {}),
  };
}

/** Whether `way` is a way of this gesture: one of SWIPE's four, or TURN's
 * anticlockwise — clockwise is TURN's default, written as no field. */
function gestureGoes(gesture: BlisterGesture | undefined, way: BlisterWay | undefined): boolean {
  if (gesture === "turn") return way === "ccw";
  return gesture === "swipe" && way !== undefined && way !== "cw" && way !== "ccw";
}

/** The gesture it wants, with the default spelled once. */
export function blisterGestureOf(c: Creature): BlisterGesture {
  return c.blisterGesture ?? "tap";
}

/**
 * Whether this seat's hand on it is a hold that counts: a HOLD blister, up,
 * and this seat's by the setting. `setGrip` asks it, because a blister is
 * not grippable as a kind — a TAP one that took a hand would turn a tap that
 * rested a little long into the other gesture (`grippable.ts`).
 */
export function blisterHoldable(c: Creature, seat: 1 | 2): boolean {
  return blisterGestureOf(c) === "hold" && blisterIsUp(c) && blisterMayTap(c, seat);
}

/** The seat whose blow counts, with the default spelled once. */
export function blisterByOf(c: Creature): BlisterBy {
  return c.blisterBy ?? 2;
}

/** Whether this seat's blow counts on this blister — by the setting alone,
 * up or not. Render asks it too, so a press refused here is never answered
 * there (`render/blister-tap.ts`). */
export function blisterMayTap(c: Creature, seat: 1 | 2): boolean {
  const by = blisterByOf(c);
  return by === "both" || by === seat;
}

/** Whether it is up: the beats a blow counts on and a bolt meets it. */
export function blisterIsUp(c: Creature): boolean {
  return c.kind === "blister" && c.blisterUp === true;
}

/** Whether its pore is swelling — the last beat under before it comes up,
 * which is the beat the partner's screen shows the bulge on. */
export function blisterSwelling(c: Creature): boolean {
  return c.kind === "blister" && c.blisterUp !== true && (c.blisterClock ?? 0) <= 1;
}

/**
 * One beat of a blister, in place of the fall: the clock comes down by one,
 * and at nought one under comes up, and one up that nobody knocked down
 * breaks the hull in its column — the wave lost — and is gone.
 */
export function stepBlister(world: World, c: Creature): void {
  const { cfg } = world;
  const left = (c.blisterClock ?? 0) - 1;
  c.blisterClock = left;
  if (left > 0) return;
  if (c.blisterUp) {
    breachHull(world, c.col, "blister", c.row, "light", c.color);
    removeCreature(world, c.id);
    return;
  }
  c.blisterUp = true;
  c.blisterClock = blisterUpBeatsOf(cfg, c);
}

/**
 * A tap on a body, asked first of the blisters. True when the id is a
 * blister, whatever the tap was worth — a tap from the wrong seat, or on one
 * that is under, counts nothing and costs nothing (the late tap is its own
 * punishment, `docs/spec/blister.md`, *Left open*). False hands the tap on to
 * the soundbox.
 */
export function blisterTapped(world: World, player: 1 | 2, id: number): boolean {
  const c = world.creatures.find((x) => x.id === id);
  if (c === undefined || c.kind !== "blister") return false;
  const gesture = blisterGestureOf(c);
  // A tap on a HOLD blister is a press that did not stay, and counts nothing.
  if (gesture !== "tap" && gesture !== "combo") return true;
  if (!blisterIsUp(c) || !blisterMayTap(c, player)) return true;
  // COMBO's press is its first half: counted and gone, and the pull in its
  // place is the hand that deals the blow (`blister-swipe.ts`).
  if (gesture === "combo") c.blisterPressed = true;
  else blisterBlow(world, c);
  return true;
}

/**
 * One blow landed, whichever gesture dealt it: said, and counted. The last
 * one owed is the blister gone; one short of it starts the gesture over —
 * the stroke, turn or hold in progress spent, a COMBO asking for its press
 * again — and the body stays up on the clock it already had.
 */
export function blisterBlow(world: World, c: Creature): void {
  const done = (c.blisterBlowsDone ?? 0) + 1;
  const left = blisterBlowsOf(world.cfg, c) - done;
  world.events.push({ type: "blisterBlow", id: c.id, col: c.col, row: c.row, left });
  if (left > 0) {
    c.blisterBlowsDone = done;
    blisterGestureOver(c);
    return;
  }
  world.events.push({
    type: "destroy",
    col: c.col,
    row: c.row,
    // A blister's colour is the wave's and it may have left it out; cyan is
    // what every other colourless body's kill already says (`mine.ts`).
    color: c.color ?? "cyan",
    kind: "blister",
  });
  removeCreature(world, c.id);
}

/**
 * The gesture in progress spent after a blow that was not the last: a hold's
 * and a lever's ticks, a turn's way round and a COMBO's press start again,
 * and every open stroke or lever hand is marked spent until it lifts
 * (`BLISTER_SPENT`), so a thumb still past the reach is not a second blow.
 */
function blisterGestureOver(c: Creature): void {
  c.blisterHeldTicks = undefined;
  c.blisterTurnedMilli = undefined;
  c.blisterPressed = undefined;
  const open = (c.blisterStrokes ?? 0) & 3;
  if (open !== 0) {
    c.blisterStrokes = open * BLISTER_SPENT;
    c.blisterAlongMilli = undefined;
  }
}

/** A seat's stroke bit times this is that seat's hand spent: 4 and 8. A hand
 * spent is not a hand on it (`& 3`), and its lift clears it. */
export const BLISTER_SPENT = 4;
