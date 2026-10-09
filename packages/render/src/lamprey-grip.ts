import {
  LAMPREY_TEETH,
  type LampreyState,
  lampreyAsks,
  lampreyBiting,
  lampreyHeadPull,
  lampreyHolder,
  lampreyTailPull,
  lampreyTailWay,
  lampreyWorker,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { handleRadius } from "./handle-draw.js";
import { hitCircle } from "./hit.js";
import { lampreyPose } from "./lamprey-pose.js";
import { type LampreyPose, lampreyGulletReach, lampreyToothAt } from "./lamprey-shape.js";
import { lampreyTowKnob } from "./lamprey-tow-grip.js";
import { type Circle, type Layout, tileCY } from "./layout.js";
import { PULL_GRAB } from "./pull-knob.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE LAMPREY's hands**: the thumb on the tail, the pull on the head and the
 * tap on the teeth (`sim/lamprey-hand.ts`, `docs/spec/bosses.md` §11.59).
 *
 * **The tail is the holder's**, a circle `lampreyTailTiles` out from the
 * tile along the way the tail lies (`lampreyTailWay`) — the simulation's own
 * way, so the circle a thumb is answered at is the one the tail is laid on.
 * A press there holds it; in an `apart` the same press is a pull, carried
 * along the body away from the head, and every move after sends how far the
 * thumb has come (`touch-move.ts`), which the simulation reads along the way.
 *
 * **The head is the other seat's**: in a `pull` or an `apart` a circle on the
 * tile, pulled up — THE CURTAIN's hem (`curtain-grip.ts`) — and in a `teeth`
 * the mouth, a press inside the lip the tooth it is nearest, an edge.
 *
 * **Every circle is answered where it rests, never where it has got to**, and
 * well outside the circle drawn (`PULL_GRAB`): the rule for every handle on
 * this field (`handles.ts`). The other seat's press on a part falls through,
 * to the cannon under it, and on the desk to the seat the part is for
 * (`desk-grab.ts`).
 */

/** How far past the lip a tap still lands on the mouth, in tiles. */
const LIP_PAST = 0.3;

/** A tail way in the simulation's thousandths, as pixels a tile long on this screen. */
function tailWay(l: Layout, s: LampreyState): { x: number; y: number } {
  const way = lampreyTailWay(s);
  return { x: ((l.flip ? -way.x : way.x) * l.tile) / 1000, y: (way.y * l.tile) / 1000 };
}

/** Where the head rests on its tile, as a circle: the knob a `pull` starts from. */
export function lampreyHeadRest(l: Layout, cfg: SimConfig, s: LampreyState): Circle {
  return { x: fieldX(l, s.col), y: tileCY(l, s.row), r: handleRadius(l, cfg) };
}

/** How far up the head is pulled this instant, in pixels. */
export function lampreyHeadLift(l: Layout, s: LampreyState): number {
  return (lampreyHeadPull(s) * l.tile) / 1000;
}

/** Where the tail rests, as a circle: `lampreyTailTiles` out from the tile along its way. */
export function lampreyTailRest(l: Layout, cfg: SimConfig, s: LampreyState): Circle {
  const head = lampreyHeadRest(l, cfg, s);
  const way = tailWay(l, s);
  const reach = cfg.lampreyTailTiles;
  return { x: head.x + way.x * reach, y: head.y + way.y * reach, r: head.r };
}

/** Where the tail's knob is this instant: carried along its way as far as it is pulled. */
export function lampreyTailAt(l: Layout, cfg: SimConfig, s: LampreyState): Circle {
  const rest = lampreyTailRest(l, cfg, s);
  const way = tailWay(l, s);
  const k = lampreyTailPull(s) / 1000;
  return { ...rest, x: rest.x + way.x * k, y: rest.y + way.y * k };
}

/** The tail's way on this screen as a unit vector: what an `apart`'s channel lies along. */
export function lampreyTailDir(l: Layout, s: LampreyState): { dx: number; dy: number } {
  const way = tailWay(l, s);
  const len = Math.hypot(way.x, way.y) || 1;
  return { dx: way.x / len, dy: way.y / len };
}

/** The tail as a circle while a bite is on: where the ghost thumb stands. */
export function lampreyTailCircle(l: Layout, cfg: SimConfig, s: LampreyState): Circle | null {
  return lampreyBiting(s) ? lampreyTailRest(l, cfg, s) : null;
}

/**
 * The head as a circle while a `pull`, an `apart` or a `tow` is on: where the
 * ghost thumb pulls from — in a tow, wherever along the curve the knob waits.
 */
export function lampreyHeadCircle(l: Layout, cfg: SimConfig, s: LampreyState): Circle | null {
  const ask = lampreyAsks(s);
  if (ask === "tow") return lampreyTowKnob(l, cfg, s);
  return ask === "pull" || ask === "apart" ? lampreyHeadRest(l, cfg, s) : null;
}

/** The lit tooth as a circle while the teeth are asked: where the ghost thumb taps. */
export function lampreyToothCircle(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  beat: number,
  beatPhase: number,
): Circle | null {
  if (lampreyAsks(s) !== "teeth") return null;
  const p = lampreyPose(l, cfg, s, beat, beatPhase);
  const at = lampreyToothAt(p, s.litTooth);
  return { x: at.x, y: at.y, r: p.r * 0.45 };
}

/**
 * The gullet as a circle where the eel rears this frame — what a shot is
 * fired at while it is lit, and the circle the cue's crosshair rides
 * (`boss-cue-read-zs.ts`). As wide as it opens after the hits so far.
 */
export function lampreyGulletCircle(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  beat: number,
  beatPhase: number,
): Circle {
  const p = lampreyPose(l, cfg, s, beat, beatPhase);
  return { x: p.x, y: p.y, r: p.r * lampreyGulletReach(s.hits) };
}

/** Whether a point is on a resting handle, answered well past the circle drawn. */
const onHandle = (c: Circle, x: number, y: number): boolean =>
  hitCircle({ ...c, r: c.r * PULL_GRAB }, x, y);

/**
 * **Whose a desk press on the eel is** while it bites (`desk-grab.ts`
 * `markSeat`): the tail the holder's, the head and the teeth the other's, so
 * the test screen's one mouse takes each part as the seat it is for.
 */
export function lampreyGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "lamprey");
  if (s === null || !lampreyBiting(s)) return undefined;
  const cfg = field.cfg;
  if (onHandle(lampreyTailRest(l, cfg, s), x, y)) return lampreyHolder(s) ?? undefined;
  const head = lampreyHeadCircle(l, cfg, s);
  const p = lampreyPose(l, cfg, s, field.beat, field.beatPhase);
  if ((head !== null && onHandle(head, x, y)) || onMouth(l, p, x, y)) {
    return lampreyWorker(s) ?? undefined;
  }
  return undefined;
}

/** Whether a point is inside the mouth's lip, and a little past it. */
function onMouth(l: Layout, p: LampreyPose, x: number, y: number): boolean {
  const past = LIP_PAST * l.tile;
  const rx = p.r + past;
  const ry = p.r * p.tilt + past;
  return ((x - p.x) / rx) ** 2 + ((y - p.y) / ry) ** 2 <= 1;
}

/** The tooth nearest a point on the mouth. */
function nearestTooth(p: LampreyPose, x: number, y: number): number {
  let best = 0;
  let near = Number.POSITIVE_INFINITY;
  for (let t = 0; t < LAMPREY_TEETH; t++) {
    const at = lampreyToothAt(p, t);
    const d = Math.hypot(at.x - x, at.y - y);
    if (d < near) [best, near] = [t, d];
  }
  return best;
}

/** A press on the eel: the holder's on the tail, the other's on the head or a tooth. */
export function lampreyGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "lamprey");
  if (s === null || !lampreyBiting(s)) return null;
  const seat = field.seat;
  const cfg = field.cfg;
  const ask = lampreyAsks(s);
  if (lampreyWorker(s) === seat) {
    const p = lampreyPose(l, cfg, s, field.beat, field.beatPhase);
    if (ask === "teeth" && onMouth(l, p, x, y)) {
      const id = nearestTooth(p, x, y);
      return {
        player: seat,
        command: { kind: "drag", target: "lampreyTooth", on: true, fromMilli: 0, id },
        hold: { kind: "drag", target: "lampreyTooth", player: seat, originX: x, originY: y, id },
      };
    }
    const head = lampreyHeadCircle(l, cfg, s);
    if (head !== null && onHandle(head, x, y)) return pull(seat, "lampreyHead", x, y);
  }
  if (lampreyHolder(s) === seat && onHandle(lampreyTailRest(l, cfg, s), x, y)) {
    return pull(seat, "lampreyTail", x, y);
  }
  return null;
}

/** A press taking the tail or the head: from nought, and carried from where it came down. */
function pull(player: 1 | 2, target: "lampreyTail" | "lampreyHead", x: number, y: number): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player, originX: x, originY: y },
  };
}
