import { GRINDSTONE_PADS } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { grindstoneBolt, grindstoneJawPath, grindstoneJawTurn } from "./grindstone-caliper.js";
import { drawGrindstonePads } from "./grindstone-marks.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GRINDSTONE's caliper jaws** — THE HOOD's two, closing on the wheel
 * (`grindstone-draw.ts` draws them behind it).
 *
 * **They tremble while they stand open** — the owner's pick on VERSUS
 * `grindstone:jaw`, 27 September 2026: *is better*. Outside the beat pulses
 * the only clock on this boss was the light's drift, and the wheel cannot be
 * the thing that moves: how far it is ground is read off its cut faces. So
 * each open jaw trembles a hair at its tip about the crown bolt, the two a
 * fifth of a cycle apart, and goes dead still as it bears on the stone: the
 * tremble is scaled by how far the jaw is still open, so a shut jaw has none.
 */

/** How far an open jaw trembles each way about the bolt, in radians. */
const TREMBLE = 0.025;
/** Its rate in radians a second: a tremble, not a sway, and off the beat. */
const TREMBLE_RATE = 8.3;
/** How far the second jaw's tremble is out of step with the first. */
const APART = (Math.PI * 2) / 5;

/** Jaw `side` turned about the crown bolt by its tremble this frame. */
function trembleJaw(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  shut: number,
  free: number,
  time: number,
): void {
  const open = Math.max(0, 1 - shut) * (1 - free);
  const bolt = grindstoneBolt(l, shut);
  ctx.translate(bolt.x, bolt.y);
  ctx.rotate(TREMBLE * open * Math.sin(time * TREMBLE_RATE + side * APART));
  ctx.translate(-bolt.x, -bolt.y);
}

/** How a caliper jaw is drawn, as a record so a second answer can stand
 * beside it on VERSUS (`docs/versus.md`). `time` is the wall clock. */
export const GRINDSTONE_JAW: { paint: GrindstoneJawPaint } = {
  paint: (ctx, l, side, shut, lit, down, beatPhase, free, flare, time) => {
    trembleJaw(ctx, l, side, shut, free, time);
    drawJaw(ctx, l, side, shut, lit, down, beatPhase, free, flare);
  },
};

export type GrindstoneJawPaint = (
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  shut: number,
  lit: boolean,
  down: number,
  beatPhase: number,
  free: number,
  flare: number,
  time: number,
) => void;

/** Jaw `side` of THE HOOD, swung out about the crown bolt as far as it is slack, its pads by its tip, flaring as it bites. */
export function drawJaw(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  shut: number,
  lit: boolean,
  down: number,
  beatPhase: number,
  free: number,
  flare: number,
): void {
  const bolt = grindstoneBolt(l, shut);
  ctx.translate(bolt.x, bolt.y);
  ctx.rotate(grindstoneJawTurn(side, shut) + (side === 0 ? -1 : 1) * free * 0.8);
  ctx.translate(-bolt.x, -bolt.y);
  const jaw = grindstoneJawPath(l, side, shut);
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(jaw);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.75);
  ctx.stroke(jaw);
  if (flare > 0) strokeGlow(ctx, jaw, PALETTE.hullRim, STROKE.inner, flare);
  const alpha = ctx.globalAlpha;
  drawGrindstonePads(ctx, l, side, GRINDSTONE_PADS, lit, down, shut, beatPhase);
  ctx.globalAlpha = alpha;
  const pin = new Path2D();
  pin.arc(bolt.x, bolt.y, 0.09 * l.tile, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.rock;
  ctx.fill(pin);
}
