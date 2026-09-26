import { LIGHT_HALF } from "@neon-spore/content";
import {
  type SeamState,
  seamLitStep,
  seamStepBeats,
  seamStepCol,
  seamWantsShield,
  seamWantsShot,
  type World,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawSeamGrit, drawSeamPoint, drawSeamRock } from "./seam-marks.js";
import {
  into,
  seamArrived,
  seamGape,
  seamLeft,
  seamLitPoint,
  seamOpen,
  seamSplit,
} from "./seam-pose.js";
import {
  type Point,
  seamCentre,
  seamCrackPath,
  seamHalfHeight,
  seamLift,
  seamMouth,
  seamRidgePath,
} from "./seam-shape.js";

/**
 * **THE SEAM**: a shelled ridge standing down the middle column with one
 * crack along its spine, widening at three points (§11.43,
 * `bosses-choreographed.md` §26).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: which
 * seat answers a step is the colour it asks for, and either may take the
 * shield, so both have to see all of it.
 *
 * **Shell grey throughout**, and the only colour on it is what a step asks
 * for — the lit point in its cannon's colour, a rock in the colour that
 * breaks it, white where either will. **Its health is the three points**:
 * each seals to a thin closed line and its lobe sheds its teeth, so a ridge
 * two points down is smoother as well as quieter.
 */
export function drawSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const arrived = seamArrived(s, cfg, beat, beatPhase);
  const home = seamCentre(l, cfg);
  const c = { x: home.x, y: home.y - seamLift(l, arrived) };
  const split = seamSplit(s, cfg, beat, beatPhase);

  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.6 * split);
  ctx.translate(c.x, c.y);
  if (split <= 0) drawRidge(ctx, l, world, s, beat, beatPhase, time);
  else {
    // The sealed ridge splits down its crack: two halves, clipped along the
    // spine, parting and tipping away from each other.
    for (const side of [-1, 1] as const) {
      ctx.save();
      ctx.translate(side * split * 0.9 * l.tile, split * 0.3 * l.tile);
      ctx.rotate(side * split * 0.25);
      const half = new Path2D();
      const h = seamHalfHeight(l) * 1.2;
      half.rect(side < 0 ? -2 * l.tile : 0, -h, 2 * l.tile, 2 * h);
      ctx.clip(half);
      drawRidge(ctx, l, world, s, beat, beatPhase, time);
      ctx.restore();
    }
  }
  ctx.restore();
  drawThrown(ctx, l, world, s, c, beat, beatPhase, time);
}

/** The ridge itself: THE RIND's three lobes in shell grey, the crack down its spine, and the lit point on it. */
function drawRidge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const open = seamOpen(s, world.cfg, beat, beatPhase);
  const ridge = seamRidgePath(l, open, time * 0.6);
  const half = seamHalfHeight(l);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(ridge);
  ctx.save();
  ctx.clip(ridge);
  litRound(ctx, 0, -half * 0.4, half, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.7));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.stroke(ridge);

  const gritting = seamWantsShield(s);
  const crack = seamCrackPath(l, open, seamGape(s, gritting, beat, beatPhase));
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.fill(crack);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, s.phase === "lit" ? 0.7 : 0.35);
  ctx.stroke(crack);

  const step = seamLitStep(s);
  if (step === null || step.ask !== "point" || !seamWantsShot(s)) return;
  const left = seamLeft(s, seamStepBeats(world, s), beat, beatPhase);
  drawSeamPoint(ctx, l, seamLitPoint(s), step, left, beatPhase);
}

/**
 * What the lit step throws, in the field's own frame: the grit falling down
 * the middle column while the shield is owed, and the rock falling down its
 * own while the shot is.
 */
function drawThrown(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  c: Point,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const step = seamLitStep(s);
  if (step === null) return;
  const mouth = seamMouth(l);
  const from = { x: c.x + mouth.x, y: c.y + mouth.y };
  const along = Math.min(1, into(s, beat, beatPhase) / Math.max(1, seamStepBeats(world, s)));
  if (seamWantsShield(s)) drawSeamGrit(ctx, l, from, along, time);
  if ((step.ask === "rock" || step.ask === "both") && seamWantsShot(s)) {
    const toX = fieldX(l, seamStepCol(world, step));
    drawSeamRock(ctx, l, from, toX, step, along, time);
  }
}
