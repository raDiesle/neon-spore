import {
  BLISTER_SPENT,
  blisterBlow,
  blisterGestureOf,
  blisterIsUp,
  blisterMayTap,
} from "./blister.js";
import { blisterLengthMilliOf } from "./blister-numbers.js";
import type { BlisterSwipeWay } from "./creature-state-blister.js";
import { type Pull, pullHeard } from "./pull.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BLISTER's SWIPE** (`docs/spec/blister.md`, *The gestures*): a stroke
 * across the body the way its arrow points, a blow for every one.
 *
 * The hand is a `drag` on `blisterSwipe` with `id` the body, and no new
 * `Command` kind: the press opens a stroke, every move says how far the thumb
 * has carried (`fromMilli` across, `fromYMilli` down, in thousandths of a
 * tile). It is the one generic PULL (`pull.ts`): a stroke counts the moment
 * it has carried its length (`blisterLengthMilliOf`) along its way, more along it than across
 * it, or on the lift that got it there — the lift says where the thumb ended
 * (`render/touch.ts`). A short one is refused out loud (`pullShort`) and
 * costs nothing; a sideways one and one the wrong way count nothing and say
 * nothing, the late tap's rule.
 *
 * **A stroke is one surfacing's.** One is opened only on a body that is up
 * and from a seat its `by` allows. A blow that is not the last owed spends
 * the hand until it lifts (`BLISTER_SPENT`): a thumb still past the reach is
 * one stroke, not a blow a tick. Two hands on a BOTH blister
 * stroke on their own bits, and whichever counts first is the blow.
 *
 * **COMBO's pull is this stroke**, to the right, the COMBO LAB's way, and only
 * once its press is done (`blisterTapped`): the press brings the pull in where
 * it was, the pull deals the blow, and the next blow asks for the press again.
 */
export function blisterSwipeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "blisterSwipe") return;
  const c = world.creatures.find((x) => x.id === command.id);
  if (c === undefined) return;
  const gesture = blisterGestureOf(c);
  if (gesture !== "swipe" && gesture !== "combo") return;
  const open = player;
  const strokes = c.blisterStrokes ?? 0;
  const pull = blisterPull(world, c);
  const along = pullAlong(blisterWayOf(c), command.fromMilli, command.fromYMilli ?? 0);
  if (!command.on) {
    // The lift clears a spent hand too, a COMBO's that is waiting on its press.
    const live = (strokes & open) !== 0 && blisterIsUp(c) && blisterStrokes(c);
    setStrokes(c, strokes & ~(open | (open * BLISTER_SPENT)));
    if (!live) return;
    const { heard } = pullHeard(pull, false, false, along);
    if (heard === "short") world.events.push({ type: "pullShort", col: c.col, player });
    if (heard === "counted" && straight(c, command.fromMilli, command.fromYMilli ?? 0)) {
      blisterBlow(world, c);
    }
    return;
  }
  if (!blisterStrokes(c) || (strokes & (open * BLISTER_SPENT)) !== 0) return;
  if (!blisterIsUp(c) || !blisterMayTap(c, player)) return;
  const { travelMilli, heard } = pullHeard(pull, false, true, along);
  setStrokes(c, strokes | open);
  c.blisterAlongMilli = Math.max(c.blisterAlongMilli ?? 0, travelMilli);
  if (heard !== "counted" || !straight(c, command.fromMilli, command.fromYMilli ?? 0)) return;
  // Counted the moment it got there: the body gone with the last blow owed,
  // and the hand spent until it lifts with any other.
  blisterBlow(world, c);
}

/**
 * The stroke as the one generic PULL (`pull.ts`): sideways or up and down,
 * the way the body's arrow points, and as long as this body's stroke is.
 */
function blisterPull(world: World, c: Creature): Pull {
  const way = blisterWayOf(c);
  return {
    way: "signed",
    sign: way === "left" || way === "up" ? -1 : 1,
    reachMilli: blisterLengthMilliOf(world.cfg, c),
  };
}

/** The hand's displacement on the arrow's axis: across for left and right, down for up and down. */
function pullAlong(way: BlisterSwipeWay, dx: number, dy: number): number {
  return way === "left" || way === "right" ? dx : dy;
}

export function blisterWayOf(c: Creature): BlisterSwipeWay {
  const way = c.blisterWay;
  return way === undefined || way === "cw" || way === "ccw" ? "right" : way;
}

/** Whether a stroke across it is a hand that counts now: a SWIPE, or a COMBO whose press is done. */
export function blisterStrokes(c: Creature): boolean {
  const gesture = blisterGestureOf(c);
  return gesture === "swipe" || (gesture === "combo" && c.blisterPressed === true);
}

/** How far the furthest open stroke has come, 0..1: what the bar fills to. */
export function blisterSwipeShare(world: World, c: Creature): number {
  return Math.min(1, (c.blisterAlongMilli ?? 0) / Math.max(1, blisterLengthMilliOf(world.cfg, c)));
}

/** Whether a stroke is open on it, from either seat: a thumb down on it now. */
export function blisterSwipeHeld(c: Creature): boolean {
  return ((c.blisterStrokes ?? 0) & 3) !== 0;
}

/** Whether a carry is a stroke: far enough along its way, and more along than across. */
/** More along the arrow than across it: a stroke, and not a smear. */
function straight(c: Creature, dx: number, dy: number): boolean {
  const way = blisterWayOf(c);
  const along = alongWay(way, dx, dy);
  const across = Math.abs(way === "left" || way === "right" ? dy : dx);
  return along > across;
}

function alongWay(way: BlisterSwipeWay, dx: number, dy: number): number {
  if (way === "right") return dx;
  if (way === "left") return -dx;
  return way === "down" ? dy : -dy;
}

function setStrokes(c: Creature, bits: number): void {
  c.blisterStrokes = bits === 0 ? undefined : bits;
  if ((bits & 3) === 0) c.blisterAlongMilli = undefined;
}
