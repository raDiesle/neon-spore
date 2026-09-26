import type { SimConfig, ViseAsk, ViseState } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawOculusSight } from "./oculus-story.js";
import { PALETTE, STROKE } from "./palette.js";
import { viseColour } from "./vise-marks.js";
import { into } from "./vise-pose.js";
import { viseKernel, viseKernelPath } from "./vise-shape.js";

/**
 * **THE VISE's two story steps, drawn** (§28's story item; the rules are
 * `sim/vise-guard.ts` and `sim/vise-shot.ts`).
 *
 * - **The bite.** The case clamps both lobes shut and lunges down at the
 *   hull, and a bar of white is lit on the hull under the middle column —
 *   the place the shield has to stand. It rises back over the rest after.
 * - **The spit.** A seed is thrown out of the hollow and hangs off to one
 *   side over the column it will fall down, lit in its colour, a dotted
 *   sight from it to the hull there and a notch where the shot comes up
 *   (THE OCULUS's sight, `oculus-story.ts`). It falls back into the hollow
 *   over the rest after.
 *
 * All in the case's own frame, the case's centre at the origin; both screens
 * the same, as the rest of the case is.
 */

/** How far the bite lunges the case toward the hull, as a share of the way. */
const LUNGE = 0.3;
/** How big the spat seed is beside the kernel. */
const SEED = 0.55;

/** 0 to 1: how far into the pose `ask` names the case is — in while lit, back out over the rest after. */
function posed(s: ViseState, cfg: SimConfig, ask: ViseAsk, beat: number, beatPhase: number) {
  const t = into(s, beat, beatPhase);
  if (s.phase === "lit" && s.steps[s.cursor]?.ask === ask) return smoothstep(Math.min(1, t * 2));
  if (s.phase === "rest" && s.steps[s.cursor - 1]?.ask === ask) {
    return 1 - smoothstep(t / Math.max(1, cfg.viseRestBeats));
  }
  return 0;
}

/** How far the case has clamped and lunged into its bite, 0 to 1. */
export function viseBite(s: ViseState, cfg: SimConfig, beat: number, beatPhase: number) {
  return posed(s, cfg, "bite", beat, beatPhase);
}

/** How far the seed has been thrown out to its column, 0 to 1. */
export function viseSpit(s: ViseState, cfg: SimConfig, beat: number, beatPhase: number) {
  return posed(s, cfg, "spit", beat, beatPhase);
}

/** How far down the bite carries the case, given the hull `toHull` below its centre. */
export function viseLunge(bite: number, toHull: number): number {
  return LUNGE * Math.max(0, toHull) * bite;
}

/** The bite's bar: white on the hull `toHull` below, under the middle, where the shield goes. */
export function drawViseBiteBar(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  bite: number,
  toHull: number,
  beatPhase: number,
): void {
  if (bite <= 0) return;
  const throb = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const bar = new Path2D();
  bar.moveTo(-l.tile * 0.5, toHull);
  bar.lineTo(l.tile * 0.5, toHull);
  strokeGlow(ctx, bar, PALETTE.hullRim, STROKE.outline, (0.7 + 0.3 * throb) * bite);
}

/**
 * The spat seed: thrown from the kernel out to hang `seedX` across, a little
 * below it, in its colour, with the sight down to the hull `toHull` below.
 */
export function drawViseSeed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  spit: number,
  seedX: number,
  toHull: number,
  color: Parameters<typeof viseColour>[0],
  beatPhase: number,
): void {
  if (spit <= 0) return;
  const k = viseKernel(l);
  const at = { x: k.x + (seedX - k.x) * spit, y: k.y + k.r * 1.5 * Math.sin(spit * Math.PI * 0.5) };
  const colour = viseColour(color);
  ctx.save();
  ctx.translate(at.x - k.x, at.y - k.y);
  const seed = viseKernelPath(l, SEED);
  ctx.fillStyle = rgba(colour.body, 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2));
  ctx.fill(seed);
  strokeGlow(ctx, seed, colour.rim, STROKE.inner, spit);
  ctx.restore();
  drawOculusSight(ctx, l, at, { x: seedX, y: toHull }, colour, spit);
}
