import { LIGHT_HALF } from "@neon-spore/content";
import { type SlingState, slingAsks, slingLitStep, type World } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawSlingCord, drawSlingCup } from "./sling-marks.js";
import {
  slingArrived,
  slingCupGlow,
  slingGone,
  slingTension,
  slingWindowLeft,
} from "./sling-pose.js";
import { slingCentre, slingTinePath } from "./sling-shape.js";

/**
 * **THE SLING** (§32): a forked bracket over the middle column, folded until
 * it swings into stand, a cord off each tine drawn by its own seat's own
 * thumb, and a cup at the crotch that lights for a shot once both cords are
 * home and locked.
 *
 * **Both screens are drawn the same.** A cord is one seat's own to pull, but
 * the other has to see which is lit and which is already drawn to say so —
 * the same rule THE VISE's pinch is read under (`vise-draw.ts`).
 */
export function drawSling(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SlingState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const arrived = slingArrived(s, cfg, beat, beatPhase);
  const gone = slingGone(s, cfg, beat, beatPhase);
  const home = slingCentre(l, cfg);

  ctx.save();
  ctx.globalAlpha = arrived * (1 - gone);
  ctx.translate(home.x, home.y - gone * l.tile * 3);

  const step = slingLitStep(s);
  for (const side of [0, 1] as const) {
    drawTine(ctx, l, side, arrived, time);
    const tension = slingTension(world, s, side, beat, beatPhase);
    const asking = step !== null && step.ask !== "fire" && slingAsks(s, side);
    drawSlingCord(ctx, l, side, tension, asking, beatPhase);
  }

  const firing = step !== null && step.ask === "fire";
  const lit = firing
    ? { color: step.color, left: slingWindowLeft(world, s, beat, beatPhase) }
    : null;
  drawSlingCup(ctx, l, slingCupGlow(world, s, beat, beatPhase), lit, beatPhase);

  ctx.restore();
}

/** One tine, splayed to `arrived`: scoured steel, the key light on it, its dark outline. */
function drawTine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  arrived: number,
  time: number,
): void {
  const path = slingTinePath(l, side, arrived);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.slingSteel, 0.95);
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, -l.tile * 0.5, l.tile * 0.6, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.5));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.slingSteelDark, 0.95);
  ctx.stroke(path);
  ctx.restore();
}
