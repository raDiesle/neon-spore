import { LIGHT_HALF } from "@neon-spore/content";
import {
  SEAM_POINTS,
  type SeamState,
  seamLitStep,
  seamStepBeats,
  seamStepCol,
  seamWantsShield,
  seamWantsShot,
  type World,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { GripVerdicts } from "./grip-verdict.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { phaseInto } from "./phase-into.js";
import { drawSeamGrit, drawSeamPoint, drawSeamRock, seamRockAt } from "./seam-marks.js";
import { seamArrived, seamGape, seamLeft, seamLitPoint, seamOpen, seamSplit } from "./seam-pose.js";
import {
  type Point,
  seamCentre,
  seamCrackPath,
  seamHalfHeight,
  seamLift,
  seamLobe,
  seamMouth,
  seamRidgePath,
} from "./seam-shape.js";
import { drawSeamBack, drawSeamGlow, seamTurn, seamTurnWidth } from "./seam-story.js";
import {
  drawSeamHalo,
  drawSeamVerdicts,
  seamCrackAsks,
  seamCrackCircle,
  seamGritCircle,
  seamRockCircle,
} from "./seam-verdicts.js";

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
 *
 * **Each mark answers the way every mark does** (`seam-verdicts.ts`): the
 * halo under what the lit step asks for, on both screens, and the verdict
 * round it once it is answered — `verdicts`, kept in `BossBlows`.
 */
export function drawSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  beat: number,
  beatPhase: number,
  time: number,
  verdicts: GripVerdicts,
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
  drawSeamVerdicts(ctx, l, world, s, c, verdicts);
}

/**
 * The ridge itself: THE RIND's three lobes in shell grey, the crack down its
 * spine, and what the lit step lays on it — or, turned away, its back.
 */
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
  const turn = seamTurn(s, world.cfg, beat, beatPhase);
  ctx.save();
  ctx.scale(seamTurnWidth(turn), 1);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(ridge);
  ctx.save();
  ctx.clip(ridge);
  litRound(ctx, 0, -half * 0.4, half, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.7));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.stroke(ridge);
  if (turn >= 0.5) drawSeamBack(ctx, l, ridge, half);
  else drawFace(ctx, l, world, s, ridge, open, beat, beatPhase, time);
  ctx.restore();
}

/** The face the pair reads: the crack, and the lit point or the glow on it. */
function drawFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  ridge: Path2D,
  open: number[],
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const gritting = seamWantsShield(s);
  const crack = seamCrackPath(l, open, seamGape(s, gritting, beat, beatPhase));
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.fill(crack);
  drawEmber(ctx, l, crack, time);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, s.phase === "lit" ? 0.7 : 0.35);
  ctx.stroke(crack);

  const step = seamLitStep(s);
  if (step === null || !seamWantsShot(s)) return;
  const left = seamLeft(s, seamStepBeats(world, s), beat, beatPhase);
  if (seamCrackAsks(s)) drawSeamHalo(ctx, seamCrackCircle(l, s, { x: 0, y: 0 }), time);
  if (step.ask === "glow") {
    drawSeamGlow(ctx, l, ridge, crack, s.quenched, world.cfg.seamGlowShots, left, beatPhase);
  }
  if (step.ask !== "point") return;
  drawSeamPoint(ctx, l, seamLitPoint(s), step, left, beatPhase);
}

/**
 * The light inside the crack, creeping up and down the spine on a clock of its
 * own: where along it the light sits, from the first widening point to the
 * last, how fast it wanders in radians a second, and how bright it gets. Shell
 * grey, never a step's colour, so it is not read as one; the glow step's white
 * is laid over it. The ridge's outline wobble is its silhouette and the rest
 * is the beat, so this is the one part alive on its own (`docs/style-guide.md`,
 * *Motion*).
 */
const EMBER_RATE = 0.35;
const EMBER_ALPHA = 0.3;

function drawEmber(ctx: CanvasRenderingContext2D, l: Layout, crack: Path2D, time: number): void {
  const top = seamLobe(l, 0).y;
  const bottom = seamLobe(l, SEAM_POINTS - 1).y;
  const y = top + (bottom - top) * (0.5 + 0.5 * Math.sin(time * EMBER_RATE));
  const r = l.tile * 0.6;
  const ember = ctx.createRadialGradient(0, y, 0, 0, y, r);
  ember.addColorStop(0, rgba(PALETTE.rock, EMBER_ALPHA));
  ember.addColorStop(1, rgba(PALETTE.rock, 0));
  ctx.fillStyle = ember;
  ctx.fill(crack);
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
  const along = Math.min(1, phaseInto(s, beat, beatPhase) / Math.max(1, seamStepBeats(world, s)));
  if (seamWantsShield(s)) {
    drawSeamHalo(ctx, seamGritCircle(l, world.cfg), time);
    drawSeamGrit(ctx, l, from, along, time);
  }
  if ((step.ask === "rock" || step.ask === "both") && seamWantsShot(s)) {
    const toX = fieldX(l, seamStepCol(world, step));
    drawSeamHalo(ctx, seamRockCircle(l, seamRockAt(l, from, toX, along)), time);
    drawSeamRock(ctx, l, from, toX, step, along, time);
  }
}
