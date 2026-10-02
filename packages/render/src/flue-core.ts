import { type FlueState, flueLitStep, type SimConfig } from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import type { FlueFx } from "./flue-fx.js";
import { drawFlueFlash } from "./flue-marks.js";
import { flueLeft } from "./flue-pose.js";
import { FLUE_DAMPER, flueCoreR, flueUnitAt, type Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { heartCore } from "./heartbeat.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's core**, in the damper's place in the row: dull while no shot
 * is owed, and lit in the step's colour and beating like a heart while one is
 * (`heartbeat.ts`); smaller and brighter for every hit, with a
 * ring closing as the fire step's beats run out, and a hit's flash over it.
 * Drawn only while the damper is some way open — shut, it is not there to see.
 */
export function drawFlueCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FlueState,
  beat: number,
  beatPhase: number,
  open: number,
  fx: FlueFx,
): void {
  if (open <= 0) return;
  const at = flueUnitAt(l, cfg, FLUE_DAMPER);
  drawCoreFace(ctx, l, s, beat, beatPhase, at, fx);
  drawFlueFlash(ctx, l, at, fx.flash);
}

function drawCoreFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FlueState,
  beat: number,
  beatPhase: number,
  at: Point,
  fx: FlueFx,
): void {
  const hurt = coreHurt(s.hits);
  const step = flueLitStep(s);
  const lit = step?.ask === "fire" && s.bared;
  // Lit, it beats like a heart (`heartbeat.ts`).
  const heart = heartCore(beatPhase);
  const r = flueCoreR(l) * hurt.size * (lit ? heart.swell : 1);
  const face = new Path2D();
  face.arc(at.x, at.y, r, 0, Math.PI * 2);
  if (step?.ask !== "fire" || !lit) {
    ctx.fillStyle = PALETTE.flueCore;
    ctx.fill(face);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.9);
    ctx.stroke(face);
    return;
  }
  const { body, rim } = stepColour(step.color);
  fx.tell(rim);
  ctx.fillStyle = rgba(body, hurt.bright * heart.fill);
  ctx.fill(face);
  strokeGlowFaded(ctx, face, rim, STROKE.inner, 0.8 + hurt.bright + heart.glow);
  const ring = new Path2D();
  const left = flueLeft(s, beat, beatPhase);
  ring.arc(at.x, at.y, r * 1.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlowFaded(ctx, ring, body, STROKE.outline, 1);
}
