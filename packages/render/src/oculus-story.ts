import type { OculusAsk, OculusState, SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { into } from "./oculus-pose.js";
import { oculusSocketRadius } from "./oculus-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE OCULUS's two story steps, drawn** (§27's story item; the rules are
 * `sim/oculus-guard.ts` and `sim/oculus-shot.ts`).
 *
 * - **The glare.** The core dilates white and stares straight down: a beam
 *   of pale light from the socket to the hull under the middle column, a
 *   bar of it lit where it lands — the place the shield has to stand. It
 *   eases shut again over the rest after.
 * - **The look.** The core rolls aside in the socket toward the column it
 *   looks down, lit in its colour, and a dotted sight runs from it to the
 *   hull there with a notch where the shot has to come up. It rolls back
 *   over the rest after.
 *
 * All in the lens's own frame, the lens's centre at the origin; both screens
 * the same, as the rest of the lens is.
 */

/** How far the core rolls aside in its socket, as a share of the socket's radius. */
const ROLL = 0.42;
/** How much wider the core stands while it glares. */
const DILATE = 0.35;

/** 0 to 1: how far into the pose `ask` names the eye is — in while lit, back out over the rest after. */
function posed(s: OculusState, cfg: SimConfig, ask: OculusAsk, beat: number, beatPhase: number) {
  const t = into(s, beat, beatPhase);
  if (s.phase === "lit" && s.steps[s.cursor]?.ask === ask) return smoothstep(Math.min(1, t * 2));
  if (s.phase === "rest" && s.steps[s.cursor - 1]?.ask === ask) {
    return 1 - smoothstep(t / Math.max(1, cfg.oculusRestBeats));
  }
  return 0;
}

/** How wide the glare stands open, 0 to 1. */
export function oculusGlare(s: OculusState, cfg: SimConfig, beat: number, beatPhase: number) {
  return posed(s, cfg, "glare", beat, beatPhase);
}

/** How far the eye has rolled toward its look, signed by the side: -1 fully left, 1 fully right. */
export function oculusGaze(s: OculusState, cfg: SimConfig, beat: number, beatPhase: number) {
  const step = s.phase === "lit" ? s.steps[s.cursor] : s.steps[s.cursor - 1];
  const roll = posed(s, cfg, "look", beat, beatPhase);
  return roll === 0 ? 0 : Math.sign(step?.offset ?? 0) * roll;
}

/** Where the core sits in its socket for a gaze, and how wide it stands for a glare. */
export function oculusCorePose(l: Layout, gaze: number, glare: number) {
  const r = oculusSocketRadius(l);
  return { x: gaze * r * ROLL, y: Math.abs(gaze) * r * 0.15, scale: 1 + DILATE * glare };
}

/** The glare's beam, from the socket down to the hull `toHull` below, and the bar it lights there. */
export function drawOculusGlare(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  glare: number,
  toHull: number,
  beatPhase: number,
): void {
  if (glare <= 0) return;
  const throb = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const top = oculusSocketRadius(l) * 0.55;
  const near = top * glare;
  const far = l.tile * 0.6 * glare;
  const beam = new Path2D();
  beam.moveTo(-near, top);
  beam.lineTo(near, top);
  beam.lineTo(far, toHull);
  beam.lineTo(-far, toHull);
  beam.closePath();
  ctx.fillStyle = rgba(PALETTE.hullRim, (0.1 + 0.08 * throb) * glare);
  ctx.fill(beam);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.3 * glare);
  ctx.stroke(beam);
  const bar = new Path2D();
  bar.moveTo(-l.tile * 0.5, toHull);
  bar.lineTo(l.tile * 0.5, toHull);
  strokeGlow(ctx, bar, PALETTE.hullRim, STROKE.outline, (0.7 + 0.3 * throb) * glare);
}

/** The look's sight: dotted from the rolled core to the hull at the column it looks down, notched there. */
export function drawOculusSight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: { x: number; y: number },
  to: { x: number; y: number },
  colour: { body: string; rim: string },
  gaze: number,
): void {
  const a = Math.abs(gaze);
  if (a <= 0) return;
  const sight = new Path2D();
  sight.moveTo(from.x, from.y);
  sight.lineTo(from.x + (to.x - from.x) * a, from.y + (to.y - from.y) * a);
  ctx.save();
  ctx.setLineDash([l.tile * 0.12, l.tile * 0.18]);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(colour.rim, 0.7 * a);
  ctx.stroke(sight);
  ctx.restore();
  const notch = new Path2D();
  notch.moveTo(to.x - l.tile * 0.35, to.y - l.tile * 0.3);
  notch.lineTo(to.x, to.y);
  notch.lineTo(to.x + l.tile * 0.35, to.y - l.tile * 0.3);
  strokeGlow(ctx, notch, colour.body, STROKE.outline, a);
}
