import { LIGHT_HALF } from "@neon-spore/content";
import { type SlingState, slingAsks, slingLitStep, type World } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { mechanismSwing, swingHush, windowStep } from "./mechanism-swing.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawSlingCord, drawSlingCup } from "./sling-marks.js";
import {
  slingArrived,
  slingCupGlow,
  slingGone,
  slingTension,
  slingWindowLeft,
} from "./sling-pose.js";
import { slingHome, slingTinePath } from "./sling-shape.js";

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
  const home = slingHome(l, cfg, gone);

  ctx.save();
  ctx.globalAlpha = arrived * (1 - gone);
  ctx.translate(home.x, home.y);

  const step = slingLitStep(s);
  // Each tine springs a little on the crotch and carries its cord with it
  // (`mechanism-swing.ts`); a cord's handle is its seat's mark.
  const asked = windowStep(s)?.ask;
  for (const side of [0, 1] as const) {
    const carried = asked === "both" || asked === (side === 0 ? "left" : "right");
    const hush = swingHush(world, beat, beatPhase, carried);
    const swing = mechanismSwing("sling", side, time, hush);
    if (swing !== 0) {
      ctx.save();
      ctx.rotate(swing);
    }
    drawTine(ctx, l, side, arrived, time);
    const tension = slingTension(world, s, side, beat, beatPhase);
    const asking = step !== null && step.ask !== "fire" && slingAsks(s, side);
    drawSlingCord(ctx, l, side, tension, asking, beatPhase);
    if (swing !== 0) ctx.restore();
  }

  // The cup rings only while a shot would land: the fire step, and the yoke
  // lit (`sling-shot.ts`). The script reaches no fire step with the yoke dark
  // today, and the ring must not be the one that says otherwise.
  const firing = step !== null && step.ask === "fire" && s.yokeLit;
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
