import { type RimeState, rimeLitStep } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawOculusSight } from "./oculus-story.js";
import { PALETTE, STROKE } from "./palette.js";
import { into } from "./rime-pose.js";
import { rimeFacetPath, rimeLensPath, rimeRadius } from "./rime-shape.js";

/**
 * **THE RIME's two story steps, drawn** (§29's story item; the rules are
 * `sim/rime-step.ts`, `sim/rime-hand.ts` and `sim/rime-guard.ts`).
 *
 * - **The whiteout.** A white fog rolls over the whole pane and both halves
 *   are lit at once, each seat's to rub; the fog thins as the frost under it
 *   goes, and is gone the moment both halves are clear.
 * - **The icicle.** One of the pane's own frost sheets breaks off long and
 *   hangs out over the column it will fall down, sinking as the step runs
 *   out, with THE OCULUS's dotted sight from its point to the hull there and
 *   a white notch where the shield has to stand.
 *
 * Both in the lens's own frame, its middle at the origin; both screens the
 * same, as the rest of the pane is.
 */

/** How long the icicle is, and how thin, as shares of a frost sheet. */
const ICICLE_LONG = 1.9;
const ICICLE_THIN = 0.42;
/** How far toward the hull the icicle sinks by the time its step runs out. */
const SINK = 0.35;

/** 0 to 1: how far into the lit step `ask` names the lens is; 0 on any other step. */
function lit(s: RimeState, ask: "both" | "icicle", beat: number, beatPhase: number): number {
  if (s.phase !== "lit" || rimeLitStep(s)?.ask !== ask) return 0;
  return smoothstep(Math.min(1, into(s, beat, beatPhase) * 2));
}

/** How thick the whiteout's fog stands: 0 none, 1 rolled over the whole pane. */
export function rimeFog(s: RimeState, beat: number, beatPhase: number): number {
  return lit(s, "both", beat, beatPhase);
}

/** How far the icicle has broken off and swung out over its column, 0 to 1. */
export function rimeIcicle(s: RimeState, beat: number, beatPhase: number): number {
  return lit(s, "icicle", beat, beatPhase);
}

/** How far the icicle has sunk toward the hull: 0 as it lights, 1 as it runs out. */
export function rimeSink(s: RimeState, beat: number, beatPhase: number): number {
  const step = rimeLitStep(s);
  if (step === null || step.ask !== "icicle") return 0;
  return Math.min(1, into(s, beat, beatPhase) / Math.max(1, step.beats));
}

/**
 * The whiteout's fog, `fog` thick over a pane `clear` of the way clear:
 * pale bands drifting slowly across the glass, fainter as the frost goes.
 */
export function drawRimeFog(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  fog: number,
  clear: number,
  time: number,
): void {
  const a = fog * (1 - clear);
  if (a <= 0) return;
  const { rx, ry } = rimeRadius(l);
  ctx.save();
  ctx.clip(rimeLensPath(l));
  ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.35 * a);
  ctx.fillRect(-rx * 1.2, -ry * 1.2, rx * 2.4, ry * 2.4);
  for (let k = 0; k < 3; k++) {
    const band = new Path2D();
    const y = (k - 1) * ry * 0.6;
    const x = Math.sin(time * 0.4 + k * 2.1) * rx * 0.3;
    band.ellipse(x, y, rx * 0.95, ry * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.22 * a);
    ctx.fill(band);
  }
  ctx.restore();
}

/**
 * The icicle, `out` of the way out to hang `dx` across over its column and
 * `sink` of the way sunk, with the sight down to the hull `toHull` below.
 */
export function drawRimeIcicle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  out: number,
  sink: number,
  dx: number,
  toHull: number,
  beatPhase: number,
): void {
  if (out <= 0) return;
  const { ry } = rimeRadius(l);
  const top = ry * 0.9;
  const long = l.tile * 0.5 * ICICLE_LONG;
  const y = top + (toHull - top - long) * SINK * sink;
  const at = { x: dx * out, y: y + long * 0.5 };
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.scale(ICICLE_THIN, ICICLE_LONG);
  const shard = rimeFacetPath(l.tile * 0.5, Math.PI / 2, 3);
  ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2));
  ctx.fill(shard);
  strokeGlow(ctx, shard, PALETTE.rimeFrostDeep, STROKE.inner / ICICLE_THIN, out);
  ctx.restore();
  const tip = { x: at.x, y: at.y + long * 0.5 };
  const colour = { body: PALETTE.hullRim, rim: PALETTE.rimeFrost };
  drawOculusSight(ctx, l, tip, { x: dx, y: toHull }, colour, out);
}
