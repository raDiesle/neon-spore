import { type FlueState, flueLitStep, type SimConfig } from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import type { FlueFx } from "./flue-fx.js";
import { drawFlueFlash } from "./flue-marks.js";
import { flueLeft } from "./flue-pose.js";
import { FLUE_DAMPER, flueCoreR, flueUnitAt, type Point } from "./flue-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawLitCore } from "./lit-core.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's core**, in the damper's place in the row: dull while no shot
 * is owed, and lit from inside in the step's colour, beating like a heart,
 * while one is (`heartbeat.ts`, `part-light.ts`) — the core's own soot and
 * rim still drawn under the light, and no colour past its edge. Smaller for
 * every hit, with a ring closing as the fire step's beats run out, and a
 * hit's flash over it.
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
  const r = flueCoreR(l) * hurt.size;
  const face = new Path2D();
  face.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.flueCore;
  ctx.fill(face);
  if (step?.ask === "fire" && s.bared) {
    fx.tell(stepColour(step.color).rim);
    const lit = { color: step.color, left: flueLeft(s, beat, beatPhase) };
    drawLitCore(ctx, face, lit, beatPhase, { x: at.x, y: at.y, r }, r * 1.6, hurt.bright);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.9);
  ctx.stroke(face);
}
