import { LIGHT_HALF } from "@neon-spore/content";
import { type GovernorState, governorLitStep } from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import { governorLeft } from "./governor-pose.js";
import { type Dial, hubR } from "./governor-shape.js";
import { heartLight } from "./heartbeat.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { lightWithin } from "./part-light.js";
import { stepColour } from "./step-colour.js";

/**
 * The hub the needle turns on, THE VANE's bearing: a dull brass boss until
 * both runs are spent; lit softly while it waits between shots, and from
 * inside in the step's colour, beating like a heart, with a ring closing
 * while a shot is owed (`heartbeat.ts`, `part-light.ts`) — its brass rim
 * kept, and no colour past its edge; smaller for every hit.
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
  const step = governorLitStep(s);
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
  if (step?.ask !== "fire") {
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.25 + 0.3 * hurt.bright);
    ctx.fill(face);
    strokeGlowFaded(ctx, face, PALETTE.hullRim, STROKE.inner, 0.5, 0.8);
    return;
  }
  // Lit for a shot, it beats like a heart, inside its own rim.
  const { body } = stepColour(step.color);
  const light = heartLight(beatPhase) * (0.6 + 0.4 * hurt.bright);
  lightWithin(ctx, face, body, light, { x: d.cx, y: d.cy, r });
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.governorBrassDark, 0.95);
  ctx.stroke(face);
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
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(body, 0.75);
  ctx.stroke(ring);
}
