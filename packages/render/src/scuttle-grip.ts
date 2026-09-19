import {
  type ScuttleState,
  type SimConfig,
  scuttleSocketCol,
  scuttleSwingable,
} from "@neon-spore/sim";
import { drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout, tileCX } from "./layout.js";
import type { Point } from "./scuttle-shape.js";
import { scuttleHangDrop, scuttleHangPhase, scuttleRowY } from "./scuttle-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsScuttleCount } from "./view-role-clocks-b.js";

/**
 * **THE SCUTTLE's hanging parts as controls**: a ring on each one a thumb may
 * still carry, and the press that takes hold of it (`sim/scuttle-hand.ts`).
 * The pilot's screen alone.
 *
 * Whose rings they are was decided the way THE LEAD's one was, by what each
 * seat is drawn. `showsScuttleCount` gives the pilot every socket and every
 * hanging part in grey, and `showsScuttleLive` gives the navigator the live
 * one in its colour with the lock under it (`view-role-clocks-b.ts`). So a
 * ring on his screen names a part without naming which part counts, and the
 * same ring on hers would sit beside the lock and say *this one* — her own
 * reading read back to her, which is the leak `boss-cue-read-t.ts` argues
 * against at length. His press on nothing is dropped without a sound in the
 * simulation, as `queenMark` drops the other seat's.
 *
 * **Every part that may still be carried is ringed, never one of them.** Two
 * come loose a cycle from `scuttleTwinParts` left and exactly one of them is
 * live; a ring on the one he *should* move would be the live socket worked
 * out by subtraction. The rings go up together and come down together, on
 * `scuttleSwingable` alone — one carry a cycle, and none on the wind-up.
 *
 * The ring is drawn where the part hangs this frame and answered there too:
 * a part slides down its thread over the cadence, so the resting circle
 * `handles.ts` asks for is the sliding one, as THE LID's cord is
 * (`lidCordCircle`). What it must never follow is the **carry** — by then the
 * pointer is captured and nothing is hit-tested again.
 */

/** Where hanging part `i` is drawn this frame: its socket's column, and how far it has slid. */
export function scuttleHangAt(
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
  i: number,
  beat: number,
  beatPhase: number,
): Point {
  const drop = scuttleHangDrop(l, scuttleHangPhase(s, cfg, beat, beatPhase));
  return { x: tileCX(l, scuttleSocketCol(cfg, i)), y: scuttleRowY(l, cfg, i) + drop };
}

/**
 * A press on a hanging part while one may still be carried: a `drag` on
 * `scuttlePart` carrying the socket as its `id`, because two of them hang at
 * once late in the fight and the simulation is told which (`drag-targets-c.ts`).
 *
 * The nearest part wins when two circles overlap, which is `creatureAt`'s rule
 * and for its reason: a thumb covers more than a handle, and the part a player
 * meant is the one they put their thumb closest to.
 */
export function scuttlePartUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "scuttle");
  if (s === null || field.seat !== 1 || !scuttleSwingable(s)) return null;
  const r = handleRadius(l, field.cfg);
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const i of s.loose) {
    if (s.parts[i] === null || s.parts[i] === undefined) continue;
    const at = scuttleHangAt(l, field.cfg, s, i, field.beat, field.beatPhase);
    if (!hitCircle({ x: at.x, y: at.y, r }, x, y)) continue;
    const d = Math.hypot(x - at.x, y - at.y);
    if (d >= bestDist) continue;
    best = i;
    bestDist = d;
  }
  if (best === null) return null;
  return {
    player: 1,
    command: {
      kind: "drag",
      target: "scuttlePart",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: best,
    },
    hold: { kind: "drag", target: "scuttlePart", player: 1, originX: x, originY: y, id: best },
  };
}

/** The rings, drawn after the parts so each stands over its own plate. */
export function drawScuttleGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ScuttleState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (!showsScuttleCount(l.role) || !scuttleSwingable(s)) return;
  const r = handleRadius(l, cfg);
  for (const i of s.loose) {
    if (s.parts[i] === null || s.parts[i] === undefined) continue;
    const at = scuttleHangAt(l, cfg, s, i, beat, beatPhase);
    drawGripRing(ctx, at.x, at.y, r, s.held === i, time);
  }
}
