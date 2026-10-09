import { blisterBlow, blisterGestureOf, blisterIsUp, blisterMayTap } from "./blister.js";
import type { BlisterSwipeWay } from "./creature-state-blister.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BLISTER's SWIPE** (`docs/spec/blister.md`, *The gestures*): a stroke
 * across the body the way its arrow points, a blow for every one.
 *
 * The hand is a `drag` on `blisterSwipe` with `id` the body, and no new
 * `Command` kind: the press opens a stroke, every move says how far the thumb
 * has carried (`fromMilli` across, `fromYMilli` down, in thousandths of a
 * tile), and **the lift is judged**, as THE WARDEN's hatch and THE MIRROR's
 * lobes are — the lift says where the thumb ended (`render/touch.ts`). A
 * stroke counts when it carried `blisterSwipeMilli` along its way and more
 * along it than across it; a short one, a sideways one and one the wrong way
 * count nothing and cost nothing, the late tap's rule.
 *
 * **A stroke belongs to the surfacing it began on.** One is opened only on a
 * body that is up and from a seat its `by` allows; a sink voids every stroke
 * open on it (`blister.ts`), so a thumb still down when it comes up under
 * another pore is not a stroke on it, and its lift counts nothing. Two hands
 * on a BOTH blister stroke on their own bits and each lift is its own blow.
 */
export function blisterSwipeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "blisterSwipe") return;
  const c = world.creatures.find((x) => x.id === command.id);
  if (c === undefined || blisterGestureOf(c) !== "swipe") return;
  const open = player;
  const dead = player << 2;
  const strokes = c.blisterStrokes ?? 0;
  if (!command.on) {
    const counted = (strokes & open) !== 0 && blisterIsUp(c);
    setStrokes(c, strokes & ~(open | dead));
    if (counted && stroked(world, c, command.fromMilli, command.fromYMilli ?? 0)) {
      blisterBlow(world, c);
    }
    return;
  }
  if ((strokes & dead) !== 0 || !blisterIsUp(c) || !blisterMayTap(c, player)) return;
  setStrokes(c, strokes | open);
  const along = Math.max(0, alongWay(blisterWayOf(c), command.fromMilli, command.fromYMilli ?? 0));
  const shown = Math.min(world.cfg.blisterSwipeMilli, along);
  c.blisterAlongMilli = Math.max(c.blisterAlongMilli ?? 0, shown);
}

/** The way it counts, with the default spelled once. */
export function blisterWayOf(c: Creature): BlisterSwipeWay {
  const way = c.blisterWay;
  return way === undefined || way === "cw" || way === "ccw" ? "right" : way;
}

/** How far the furthest open stroke has come, 0..1: what the bar fills to. */
export function blisterSwipeShare(world: World, c: Creature): number {
  return Math.min(1, (c.blisterAlongMilli ?? 0) / Math.max(1, world.cfg.blisterSwipeMilli));
}

/** Whether a carry is a stroke: far enough along its way, and more along than across. */
function stroked(world: World, c: Creature, dx: number, dy: number): boolean {
  const way = blisterWayOf(c);
  const along = alongWay(way, dx, dy);
  const across = Math.abs(way === "left" || way === "right" ? dy : dx);
  return along >= world.cfg.blisterSwipeMilli && along > across;
}

/** A carry's reach along a way: positive the way the arrow points. */
function alongWay(way: BlisterSwipeWay, dx: number, dy: number): number {
  if (way === "right") return dx;
  if (way === "left") return -dx;
  return way === "down" ? dy : -dy;
}

/** The bits written, absent at none; with no stroke open the bar is empty. */
function setStrokes(c: Creature, bits: number): void {
  c.blisterStrokes = bits === 0 ? undefined : bits;
  if ((bits & 3) === 0) c.blisterAlongMilli = undefined;
}
