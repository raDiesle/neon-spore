import { hullRow, type SimConfig } from "./config.js";
import type {
  BlisterBy,
  BlisterGesture,
  BlisterSpawn,
  BlisterWay,
} from "./creature-state-blister.js";
import { removeCreature } from "./field.js";
import { breachHull } from "./hull-damage.js";
import { nextInt } from "./rng.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BLISTER: a body you knock back down (`docs/spec/blister.md`).
 *
 * It does not fall. It comes up out of a pore — a tile of the field — stays up
 * for `blisterUpBeats`, and sinks; while it is under nothing touches it, and a
 * bolt passes over the pore (`shot-reach.ts`). Each time it sinks without
 * having been knocked out it comes up again `blisterSinkRows` nearer the hull,
 * in a column the seeded rng picks, and one that comes up on the hull row
 * breaks the hull there and is gone.
 *
 * **Only the hand its `by` names counts**, and only while it is up. Every
 * blow that lands is one off a count that is kept across surfacings — the
 * mole: you wait for it, you hit it, it goes, you wait again. The other seat
 * is shown the pore swelling a beat before it comes up (`blisterSwelling`), so
 * a hand that waits to see it arrives late and the pair has to say *now*.
 *
 * The tap is the soundbox's command, `tap {id}`, and whose tap it is belongs to
 * the creature rather than to the command (`beatboxTapped`'s arrangement).
 */

/** The topmost row a blister may come up on: `mine.ts`' `TOP_ROW`, for its
 * reason — a body in the first row is drawn half under the radar strip. */
const TOP_ROW = 2;

/**
 * Where the first surfacing is: the authored row, pulled into the band from
 * the top row to the one above the hull — a blister placed on the hull row
 * would break it the beat it came up, with nothing ever seen.
 */
export function blisterPlaceRow(cfg: SimConfig, row: number | undefined): number {
  return Math.max(TOP_ROW, Math.min(hullRow(cfg) - 1, row ?? TOP_ROW));
}

/**
 * What a blister arrives with: its seat, its count, and the pore under it
 * already swelling. It arrives **under**, so the first thing on the field is
 * the bulge on the partner's screen — the arrival is a thing to say before it
 * is a thing to hit. The seat defaults to the navigator, the director's own
 * default (`docs/spec/blister.md`).
 */
export function blisterOnSpawn(cfg: SimConfig, entry: BlisterSpawn): Partial<Creature> {
  const { by, count, gesture, way } = entry;
  return {
    blisterBy: by ?? 2,
    blisterLeft: Math.max(1, count ?? cfg.blisterBlows),
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

/** A TURN hand the sink left on the body: it counts nothing until it lifts. */
export const BLISTER_TURN_DEAD = -2;

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

/** Blows still owed. */
export function blisterLeft(cfg: SimConfig, c: Creature): number {
  return c.blisterLeft ?? cfg.blisterBlows;
}

/**
 * One beat of a blister, in place of the fall: the clock comes down by one,
 * and at nought it either sinks — and the next pore is picked now, so the
 * bulge can be drawn where it will come up — or it comes up, which on the
 * hull row is the hull.
 */
export function stepBlister(world: World, c: Creature): void {
  const { cfg } = world;
  const left = (c.blisterClock ?? 0) - 1;
  c.blisterClock = left;
  if (left > 0) return;
  if (c.blisterUp) {
    c.blisterUp = false;
    voidGestures(c);
    c.blisterClock = cfg.blisterDownBeats;
    c.col = nextInt(world.rng, cfg.cols);
    c.row = Math.min(hullRow(cfg), c.row + cfg.blisterSinkRows);
    return;
  }
  if (c.row >= hullRow(cfg)) {
    breachHull(world, c.col, "blister", c.row, "light", c.color);
    removeCreature(world, c.id);
    return;
  }
  c.blisterUp = true;
  c.blisterClock = cfg.blisterUpBeats;
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
  // A tap on a HOLD blister is a press that did not stay, and counts nothing.
  if (blisterGestureOf(c) !== "tap") return true;
  if (!blisterIsUp(c) || !blisterMayTap(c, player)) return true;
  blisterBlow(world, c);
  return true;
}

/**
 * One blow landed, whichever gesture dealt it: one off the count, said, and
 * at nought the blister is gone.
 */
export function blisterBlow(world: World, c: Creature): void {
  const left = blisterLeft(world.cfg, c) - 1;
  c.blisterLeft = left;
  world.events.push({ type: "blisterBlow", id: c.id, col: c.col, row: c.row, left });
  if (left > 0) return;
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
 * A sink voids every SWIPE stroke and TURN in progress: the thumbs are still
 * down, and what they do next counts nothing until they lift — the body they
 * began on is under another pore by then (`blister-swipe.ts`,
 * `blister-turn.ts`). A turn short of whole is lost.
 */
function voidGestures(c: Creature): void {
  const open = (c.blisterStrokes ?? 0) & 3;
  if (open !== 0) c.blisterStrokes = ((c.blisterStrokes ?? 0) & 12) | (open << 2);
  c.blisterAlongMilli = undefined;
  if (c.blisterTurnAt1 !== undefined) c.blisterTurnAt1 = BLISTER_TURN_DEAD;
  if (c.blisterTurnAt2 !== undefined) c.blisterTurnAt2 = BLISTER_TURN_DEAD;
  c.blisterTurnedMilli = undefined;
}
