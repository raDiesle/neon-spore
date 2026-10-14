import type { Point } from "@neon-spore/content";
import { drawMarkWait } from "../../../../packages/render/src/mark-feedback.js";
import { LAB_KNOB } from "../pull-lab-shapes.js";

/**
 * **The waiting clock on a hold** — the one a mark only the partner is asked
 * wears in the game (`drawMarkWait`), drawn on every hold in the labs from the
 * moment it is on the field — before the thumb is on it — until it is
 * counted, whether it waits on the beats or on the partner (the owner, 12
 * October 2026: *show on placeholder a clock symbol we use for other player to
 * wait for him*; 13 October: *general visuals the user expects for
 * consistency are always consistent … also with "hold lab"*; 14 October:
 * *should already show the clock icon before the user started to pull it*).
 *
 * `u` is where it stands: 0 in the middle of the place a hold will come into
 * (THE COMBO LAB's dashed place at the end of a channel, while the knob still
 * travels), 1 on the drop's shoulder — up and to the right, clear of SOAK's
 * water welling up in the middle. A hold with no place before it is at 1 at once.
 */

/** The clock's size over the knob's, in the place and on the shoulder, and how far up
 * the shoulder it sits, over the drop's radius. */
const IN_PLACE = 1.15;
const ON_SHOULDER = 0.85;
const SHOULDER = 0.9;

export function drawHoldClock(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  u: number,
  time: number,
): void {
  const off = r * SHOULDER * u;
  const size = IN_PLACE + (ON_SHOULDER - IN_PLACE) * u;
  drawMarkWait(ctx, at.x + off, at.y - off, LAB_KNOB * size, time);
}
