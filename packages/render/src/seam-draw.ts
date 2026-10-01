import { LIGHT_HALF } from "@neon-spore/content";
import {
  type SeamState,
  seamLitStep,
  seamStepBeats,
  seamWantsShield,
  seamWantsShot,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SeamFx } from "./seam-fx.js";
import {
  drawSeamDark,
  drawSeamEmber,
  drawSeamFalse,
  seamDark,
  seamFalseLight,
} from "./seam-hold.js";
import {
  drawSeamGrit,
  drawSeamPoint,
  drawSeamRock,
  type SeamThrow,
  seamRockAt,
  seamRockNow,
  seamThrow,
} from "./seam-marks.js";
import { seamArrived, seamGape, seamLeft, seamLitPoint, seamOpen, seamSplit } from "./seam-pose.js";
import {
  seamCentre,
  seamCrackPath,
  seamHalfHeight,
  seamLift,
  seamRidgePath,
} from "./seam-shape.js";
import { seamStopper } from "./seam-stop.js";
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
 * round it once it is answered. What outlives a frame is `fx`'s
 * (`seam-fx.ts`): the verdicts, the `reseal` flash of a bolt fired into the
 * dark (`seam-hold.ts`), and the blow, the ridge flinching red and shaking
 * as it takes one; the drawer tells it where the crack's mark and the rock
 * stand, which the events do not carry.
 */
export function drawSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: SeamFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const arrived = seamArrived(s, cfg, beat, beatPhase);
  const home = seamCentre(l, cfg);
  const c = { x: home.x, y: home.y - seamLift(l, arrived) };
  const split = seamSplit(s, cfg, beat, beatPhase);
  const reseal = fx.reseal;
  const hurt = fx.hurt.value;
  const thrown = seamThrow(l, world, s, c, beat, beatPhase);
  fx.note(seamCrackCircle(l, s, c), seamRockNow(l, thrown));
  stops?.aim(seamStopper(l, world, s, c, arrived, split, thrown, beat, beatPhase));

  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.6 * split);
  ctx.translate(c.x + fx.hurt.shakeX(time, l.tile), c.y);
  if (split <= 0) drawRidge(ctx, l, world, s, beat, beatPhase, time, reseal, hurt);
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
      drawRidge(ctx, l, world, s, beat, beatPhase, time, reseal, hurt);
      ctx.restore();
    }
  }
  ctx.restore();
  drawThrown(ctx, l, world, s, thrown, time);
  drawSeamVerdicts(ctx, l, world, s, c, fx.verdicts);
}

/**
 * The ridge itself: THE RIND's three lobes in shell grey, the crack down its
 * spine, and what the lit step lays on it — or, turned away, its back —
 * flushed red while it has a blow to show.
 */
function drawRidge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  beat: number,
  beatPhase: number,
  time: number,
  reseal: number,
  hurt: number,
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
  const fade = ctx.globalAlpha;
  drawHurt(ctx, ridge, hurt);
  ctx.globalAlpha = fade;
  if (turn >= 0.5) drawSeamBack(ctx, l, ridge, half);
  else drawFace(ctx, l, world, s, ridge, open, beat, beatPhase, time, reseal);
  ctx.restore();
}

/** The face the pair reads: the crack, and the lit point, the glow or the false point on it
 * — or, the script done, the crack lying dark. */
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
  reseal: number,
): void {
  const gritting = seamWantsShield(s);
  const crack = seamCrackPath(l, open, seamGape(s, gritting, beat, beatPhase));
  const dark = seamDark(s);
  ctx.fillStyle = rgba(PALETTE.background, dark ? 1 : 0.9);
  ctx.fill(crack);
  if (!dark) drawSeamEmber(ctx, l, crack, time);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, dark ? 0.12 : s.phase === "lit" ? 0.7 : 0.35);
  ctx.stroke(crack);
  if (dark) {
    drawSeamDark(ctx, l, s, crack, reseal);
    return;
  }
  drawSeamFalse(ctx, l, seamFalseLight(s, world.cfg, beat, beatPhase), beat, beatPhase, time);

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
 * What the lit step throws, in the field's own frame: the grit falling down
 * the middle column while the shield is owed, and the rock falling down its
 * own while the shot is.
 */
function drawThrown(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SeamState,
  thrown: SeamThrow | null,
  time: number,
): void {
  if (thrown === null) return;
  const { step, from, along, toX } = thrown;
  if (seamWantsShield(s)) {
    drawSeamHalo(ctx, seamGritCircle(l, world.cfg), time);
    drawSeamGrit(ctx, l, from, along, time);
  }
  if (toX !== null) {
    drawSeamHalo(ctx, seamRockCircle(l, seamRockAt(l, from, toX, along)), time);
    drawSeamRock(ctx, l, from, toX, step, along, time);
  }
}
