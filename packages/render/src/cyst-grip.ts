import {
  type CystState,
  type CystStep,
  cystDone,
  cystFreezer,
  cystPincher,
  cystStepCol,
  midCol,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { cystArrived, cystPosed } from "./cyst-pose.js";
import { cystCentre, cystCoreR, cystLift, cystMarkAt, cystR } from "./cyst-shape.js";
import { cystBudAt } from "./cyst-story.js";
import { fieldX } from "./field-flip.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The hands on THE CYST** (§34): a tap on a freeze mark, and a pinch on a
 * flank. Both are answered on the sac `drawCyst` puts on the screen this
 * frame, at the same middle and the same drop into frame.
 *
 * **Geometry says whose is whose, on both phones.** The pilot pinches the left
 * flank and taps the right mark; the navigator pinches the right and taps the
 * left (`sim/cyst-hand.ts`). So a seat's mark is on the far side from its
 * pinch, and a thumb on the other seat's mark falls through to whatever is
 * behind it, as the simulation would refuse it anyway.
 *
 * **Marks are tried first.** A mark stands off the sac's side, inside the
 * partner's pinch zone, and a tap there is a tap.
 *
 * **A flank is pinched in its zone, not on its lobe**, THE VISE's way
 * (`vise-grip.ts`): this seat's side of the middle, the width of the field,
 * over the rows the sac stands in and half a tile either way. A finger there
 * is one finger of this seat's pinch, and the gap goes out once a second
 * finger is down in the same zone (`pinch.ts`).
 */

/** Half a tile of zone above and below the sac, so a finger at its tip is not refused on a pixel. */
const MARGIN = 0.5;
/** How much wider than it is drawn a freeze mark takes a thumb. */
const REACH = 1.6;

/** The side of the middle a seat pinches on: the pilot's the left, the navigator's the right. */
function pinchSide(seat: 1 | 2): 0 | 1 {
  return cystPincher(0) === seat ? 0 : 1;
}

/** The side whose mark a seat taps: always its partner's flank. */
function tapSide(seat: 1 | 2): 0 | 1 {
  return cystFreezer(0) === seat ? 0 : 1;
}

/** The sac's middle where it stands this frame, lifted while it is still dropping in. */
function sacAt(l: Layout, cfg: SimConfig, s: CystState, beat: number, beatPhase: number) {
  const home = cystCentre(l, cfg);
  return {
    x: home.x,
    y: home.y - cystLift(l, cystArrived(s, cfg.cystStillBeats, beat, beatPhase)),
  };
}

/** Freeze mark `side` as a circle where it stands this frame. */
export function cystMarkCircle(
  l: Layout,
  cfg: SimConfig,
  s: CystState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): Circle {
  const at = sacAt(l, cfg, s, beat, beatPhase);
  const m = cystMarkAt(l, side);
  return { x: at.x + m.x, y: at.y + m.y, r: m.r };
}

/** Flank `side` as a circle: the round in the middle of its lobe, where the ghost thumb stands. */
export function cystFlankCircle(
  l: Layout,
  cfg: SimConfig,
  s: CystState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): Circle {
  const at = sacAt(l, cfg, s, beat, beatPhase);
  const r = cystR(l);
  return { x: at.x + (side === 0 ? -1 : 1) * r * 0.75, y: at.y, r: r / 2 };
}

/** The same for the world as it stands, for the placement and the ghost hand. */
export function cystStanding(
  l: Layout,
  world: World,
  s: CystState,
  what: "mark" | "flank",
  side: 0 | 1,
  beatPhase: number,
): Circle {
  const at = what === "mark" ? cystMarkCircle : cystFlankCircle;
  return at(l, world.cfg, s, side, world.beat, beatPhase);
}

/**
 * The core as a circle where it stands this frame — what a fire step is shot
 * at, and the circle the cue's crosshair rides (`boss-cue-read-zi.ts`).
 */
export function cystCoreStanding(l: Layout, world: World, s: CystState, beatPhase: number): Circle {
  return { ...sacAt(l, world.cfg, s, world.beat, beatPhase), r: cystCoreR(l) };
}

/** The bud as a circle where it hangs this frame, out on its stalk over `step`'s column. */
export function cystBudStanding(
  l: Layout,
  world: World,
  s: CystState,
  step: CystStep,
  beatPhase: number,
): Circle {
  const cfg = world.cfg;
  const at = sacAt(l, cfg, s, world.beat, beatPhase);
  const dx = fieldX(l, cystStepCol(midCol(cfg), step)) - at.x;
  const grown = cystPosed(s, "bud", cfg.cystRestBeats, world.beat, beatPhase);
  const bud = cystBudAt(l, grown, dx);
  return { x: at.x + bud.x, y: at.y + bud.y, r: bud.r };
}

/**
 * **Whose the freeze mark under a desk press is** (`desk-grab.ts` `markSeat`).
 * The navigator's mark stands in the pilot's pinch zone, so the test screen's
 * mouse, tried as player 1 first, took a pinch on every point of it and the
 * tap was never asked for — the owner, 2 October 2026: *on THE CYST under
 * TEST the tap does not work, under PLAYER 2 it does.* Each mark names its
 * own seat, `cystFreezer`, and a pinch is still everywhere else on its side.
 */
export function cystGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "cyst");
  if (s === null || cystDone(s)) return undefined;
  for (const side of [0, 1] as const) {
    const m = cystMarkCircle(l, field.cfg, s, side, field.beat, field.beatPhase);
    if (hitCircle({ ...m, r: m.r * REACH }, x, y)) return cystFreezer(side);
  }
  return undefined;
}

/**
 * A press on this seat's freeze mark — a tap, sent at once and let go on the
 * lift — or in this seat's pinch zone, one finger of a pinch on its flank.
 * `bossOf(field, "cyst")` is `null` on every wave without it.
 */
export function cystUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "cyst");
  if (s === null || cystDone(s)) return null;
  const seat = field.seat;
  const mark = tapSide(seat);
  const m = cystMarkCircle(l, field.cfg, s, mark, field.beat, field.beatPhase);
  if (hitCircle({ ...m, r: m.r * REACH }, x, y)) {
    const target = mark === 0 ? "cystFreezeLeft" : "cystFreezeRight";
    return {
      player: seat,
      command: { kind: "drag", target, on: true, fromMilli: 0 },
      hold: { kind: "drag", target, player: seat, originX: x, originY: y },
    };
  }
  const at = sacAt(l, field.cfg, s, field.beat, field.beatPhase);
  if (Math.abs(y - at.y) > cystR(l) * 1.4 + MARGIN * l.tile) return null;
  if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) return null;
  const side = pinchSide(seat);
  if ((x - at.x) * (side === 0 ? -1 : 1) < 0) return null;
  const target = side === 0 ? "cystFlankLeft" : "cystFlankRight";
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target, player: seat, originX: x, originY: y, pinch: true },
  };
}
