import { LIGHT_HALF } from "@neon-spore/content";
import { type GovernorState, governorLitStep } from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import { strokeGlow } from "./glow.js";
import { governorLeft } from "./governor-pose.js";
import { type Dial, hubR } from "./governor-shape.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * The hub the needle turns on, THE VANE's bearing: a dull brass boss until
 * both runs are spent; lit softly while it waits between shots, and in the
 * step's colour with a ring closing while a shot is owed, smaller and
 * brighter for every hit.
 */
export function drawGovernorHub(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  s: GovernorState,
  beat: number,
  beatPhase: number,
): void {
  const hurt = coreHurt(s.hits);
  const r = hubR(l) * (s.hubLit ? hurt.size : 1);
  const squash = 0.5 + 0.5 * d.tilt;
  const face = new Path2D();
  face.ellipse(d.cx, d.cy, r, r * squash, 0, 0, Math.PI * 2);
  const step = governorLitStep(s);
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
  if (step?.ask !== "fire") {
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.25 + 0.3 * hurt.bright);
    ctx.fill(face);
    strokeGlow(ctx, face, PALETTE.hullRim, STROKE.inner, 0.5, 0.8);
    return;
  }
  const { body, rim } = stepColour(step.color);
  ctx.fillStyle = rgba(body, hurt.bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(face);
  strokeGlow(ctx, face, rim, STROKE.inner, 0.8 + hurt.bright);
  const ring = new Path2D();
  const left = governorLeft(s, beat, beatPhase);
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * 2 * left * (i / n);
    const x = d.cx + r * 1.7 * Math.sin(a);
    const y = d.cy - r * 1.7 * squash * Math.cos(a);
    if (i === 0) ring.moveTo(x, y);
    else ring.lineTo(x, y);
  }
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}
