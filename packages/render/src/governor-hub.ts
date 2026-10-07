import { LIGHT_HALF } from "@neon-spore/content";
import type { GovernorState } from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import { type Dial, hubR } from "./governor-shape.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The hub the needle turns on, THE VANE's bearing: a dull brass boss until
 * the first shot is earned, and lit softly after — glass over the dark face,
 * no colour past its edge — smaller and brighter for every hit. It is never
 * shot: since 7 October 2026 the target is the needle's tip
 * (`governor-tip.ts`), and the hub only shows that a shot is earned.
 */
export function drawGovernorHub(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  s: GovernorState,
): void {
  const hurt = coreHurt(s.hits);
  const r = hubR(l) * (s.hubLit ? hurt.size : 1);
  const squash = 0.5 + 0.5 * d.tilt;
  const face = new Path2D();
  face.ellipse(d.cx, d.cy, r, r * squash, 0, 0, Math.PI * 2);
  if (!s.hubLit) {
    ctx.save();
    ctx.fillStyle = PALETTE.governorHub;
    ctx.fill(face);
    ctx.clip(face);
    litRound(ctx, d.cx, d.cy, r, LIGHT_HALF.rock);
    ctx.restore();
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.governorBrassDark, 0.95);
    ctx.stroke(face);
    return;
  }
  // Lit, it is glass over the dark face, so the needle's root is not seen through it.
  ctx.fillStyle = PALETTE.governorFace;
  ctx.fill(face);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.25 + 0.3 * hurt.bright);
  ctx.fill(face);
  strokeGlowFaded(ctx, face, PALETTE.hullRim, STROKE.inner, 0.5, 0.8);
}
