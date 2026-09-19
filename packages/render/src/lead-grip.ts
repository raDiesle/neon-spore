import {
  type LeadState,
  leadGrippable,
  leadHolding,
  leadStill,
  type SimConfig,
} from "@neon-spore/sim";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout } from "./layout.js";
import { leadAlong, leadFoot, leadStalkLength } from "./lead-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsLeadCol } from "./view-role-clocks.js";

/**
 * **THE LEAD's stalk as a control**, for the one movement that asks a thumb
 * for it: the still, with one segment left (`sim/lead-hand.ts`). A ring round
 * the organ at the tip of the stalk, on the navigator's screen alone.
 *
 * Whose ring it is was decided by what each seat is drawn, the way THE
 * LEDGER's four were. `leadFootCol` stands the stalk over the body's own
 * column on her screen and in the middle of the field on his, so his stalk is
 * a readout and not a body — a ring on it would name a place that is not
 * anywhere (`lead-shape.ts`). The pilot's press is dropped without a sound in
 * the simulation, as `queenMark`'s is, so there is nothing to draw him being
 * refused.
 *
 * Two states, both read off beats the simulation already stores, so nothing
 * here outlives a frame: **asked**, the ring breathing on the organ while the
 * still may still be taken (`leadGrippable`); **held**, the ring filled with
 * the beats of hold left closing round it as a dial — `leadHoldBeats` from
 * `heldBeat`, which is the fuse she is holding and the one readout the pilot
 * has no copy of. Once the stalk has been let go of or has torn free, the ring
 * is gone for the rest of the still: this still cannot be taken twice.
 */

/** How far out from the organ the ring stands, in tiles: clear of the tip's own bloom. */
const RING_TILES = 0.42;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * The organ at the tip of the stalk, where the ring goes, taken **upright**
 * whatever the stalk is leaning at. With one segment left the stalk is a
 * quarter of a tile long, so the whole of the lean moves the organ an eighth
 * of a tile — a fraction of the handle's own radius — and the hit test has no
 * spring to read (`lead-fx.ts` holds the drawn angle, and a finger arrives
 * between frames). Drawing and answering off the same upright point keeps the
 * ring exactly where the thumb is answered.
 */
function leadOrgan(l: Layout, cfg: SimConfig, s: LeadState): { x: number; y: number } {
  return leadAlong(leadFoot(l, cfg, s), 0, leadStalkLength(l, s));
}

/**
 * A press on the organ while the stalk may be taken: a `drag` on `leadStalk`,
 * no `id` and no carry, because there is one stalk and all the gesture says is
 * *down* and *up* (`sim/drag-targets-c.ts`). The circle answered is the
 * handle's own size and not the organ's, which is drawn smaller than a thumb.
 */
export function leadStalkUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const boss = bossOf(field, "lead");
  if (boss === null || field.seat !== 2) return null;
  if (!leadGrippable(boss)) return null;
  const at = leadOrgan(l, field.cfg, boss);
  if (!hitCircle({ x: at.x, y: at.y, r: handleRadius(l, field.cfg) }, x, y)) return null;
  return {
    player: 2,
    command: { kind: "drag", target: "leadStalk", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "leadStalk", player: 2, originX: x, originY: y },
  };
}

/**
 * The ring, drawn after the stalk so it stands over the organ's bloom. Drawn
 * only on the screen the stalk stands at its column on, which is the seat
 * whose thumb it is.
 */
export function drawLeadGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LeadState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (!leadStill(s) || !showsLeadCol(l.role)) return;
  const held = leadHolding(s);
  if (!held && !leadGrippable(s)) return;
  const at = leadOrgan(l, cfg, s);
  const r = l.tile * RING_TILES;
  drawGripRing(ctx, at.x, at.y, r, held, time);
  if (!held) return;
  const left = 1 - clamp01((beat - s.heldBeat + beatPhase) / Math.max(1, cfg.leadHoldBeats));
  drawGripDial(ctx, at.x, at.y, r, left);
}
