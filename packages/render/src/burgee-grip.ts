import {
  type BurgeeState,
  burgeeAims,
  burgeeFreezes,
  burgeeLitStep,
  type SimConfig,
} from "@neon-spore/sim";
import { burgeeMarks } from "./burgee-marks.js";
import { hitCircle, hitReach } from "./hit.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE BURGEE's two hands as controls**: the freeze ring `burgeeFreeze` and
 * the draw's track `burgeeDraw`, each pressed where `burgee-draw.ts` draws it
 * — the one placement is `burgeeMarks`, so the ring a thumb is answered in is
 * the ring on the glass.
 *
 * **Both are either seat's target, and the lit step says whose is live**
 * (`burgeeFreezes`, `burgeeAims`): the freezer's ring and the other seat's
 * track. A seat whose hand it is not finds nothing there, and its press goes
 * on to whatever is under it, the way THE DAVIT's wrong seat does.
 *
 * **The tap is an edge the simulation reads** (`sim/burgee-hand.ts`): the
 * press sends `on: true` and the lift `on: false`, which is what lets a thumb
 * resting on the ring tap again. **The draw is THE SLING's**: the finger goes
 * down on the track, and the lift carries the swipe's side on `fromMilli` —
 * so `touch.ts`'s `swiped` set knows this target too, or the sign would never
 * reach the sim.
 */

/** The track's half-width a finger is answered in, in tiles, before `hitReach`. */
const TRACK_R = 0.36;

function seatSide(field: Field): 0 | 1 | null {
  return field.seat === 1 ? 0 : field.seat === 2 ? 1 : null;
}

/** The freeze ring while a catch is lit, or `null` between catches. */
export function burgeeFreezeCircle(l: Layout, cfg: SimConfig, s: BurgeeState): Circle | null {
  const step = burgeeLitStep(s);
  if (step === null || step.ask === "fire") return null;
  return burgeeMarks(l, cfg, step).ring;
}

/** Where a finger goes down on the draw: the track's tail, under the pivot. */
export function burgeeDrawCircle(l: Layout, cfg: SimConfig, s: BurgeeState): Circle | null {
  const step = burgeeLitStep(s);
  if (step === null || step.ask === "fire") return null;
  const { from } = burgeeMarks(l, cfg, step);
  return { x: from.x, y: from.y, r: TRACK_R * l.tile };
}

export function burgeeFreezeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "burgee");
  const side = seatSide(field);
  if (s === null || side === null || !burgeeFreezes(s, side)) return null;
  const ring = burgeeFreezeCircle(l, field.cfg, s);
  if (ring === null || !hitCircle(ring, x, y)) return null;
  return {
    player: field.seat,
    command: { kind: "drag", target: "burgeeFreeze", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "burgeeFreeze", player: field.seat, originX: x, originY: y },
  };
}

export function burgeeDrawUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "burgee");
  const side = seatSide(field);
  if (s === null || side === null || !burgeeAims(s, side)) return null;
  const step = burgeeLitStep(s);
  if (step === null || step.ask === "fire") return null;
  const { from, to } = burgeeMarks(l, field.cfg, step);
  if (!nearSegment(from.x, to.x, from.y, hitReach(TRACK_R * l.tile), x, y)) return null;
  return {
    player: field.seat,
    command: { kind: "drag", target: "burgeeDraw", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "burgeeDraw", player: field.seat, originX: x, originY: y },
  };
}

/** Whether (x, y) is within `reach` of the level segment from `x0` to `x1` at height `y0`. */
function nearSegment(x0: number, x1: number, y0: number, reach: number, x: number, y: number) {
  const nx = Math.max(Math.min(x0, x1), Math.min(Math.max(x0, x1), x));
  return (x - nx) ** 2 + (y - y0) ** 2 <= reach ** 2;
}
