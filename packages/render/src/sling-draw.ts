import { LIGHT_HALF } from "@neon-spore/content";
import { type SlingState, slingAsks, slingLitStep, type World } from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SlingFx } from "./sling-fx.js";
import { drawSlingCord, drawSlingCup, drawSlingHeat } from "./sling-marks.js";
import {
  slingArrived,
  slingCooled,
  slingCoolTension,
  slingCupGlow,
  slingGone,
  slingTension,
  slingWindowLeft,
} from "./sling-pose.js";
import { slingCupRadius, slingHandle, slingHome, slingTinePath, slingTip } from "./sling-shape.js";
import { slingStopper } from "./sling-stop.js";
import { slingRung, slingTineTurn, slingTwang } from "./sling-twang.js";
import { drawSlingMarkFeedback } from "./sling-verdicts.js";

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
  fx: SlingFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const arrived = slingArrived(s, cfg, beat, beatPhase);
  const gone = slingGone(s, cfg, beat, beatPhase);
  const home = slingHome(l, cfg, gone);

  ctx.save();
  ctx.globalAlpha = arrived * (1 - gone);
  ctx.translate(home.x, home.y);

  const step = slingLitStep(s);
  const cooled = slingCooled(s, cfg, beat, beatPhase);
  const cords: Circle[] = [];
  const tension: [number, number] = [0, 0];
  // After a true loose the tines ring through the rest, each cord carried with its tine.
  const ring = slingTwang(s, cfg, fx.ring.rung, beat, beatPhase);
  for (const side of [0, 1] as const) {
    ctx.save();
    ctx.rotate(slingTineTurn(side, ring));
    drawTine(ctx, l, side, arrived, time);
    const drawn =
      cooled === null
        ? slingTension(world, s, side, beat, beatPhase)
        : slingCoolTension(s, side, cooled, beatPhase);
    drawSlingCord(ctx, l, side, drawn, slingAsks(s, side), beatPhase);
    ctx.restore();
    cords.push(cordMark(l, side, drawn, ring));
    tension[side] = drawn;
  }
  stops?.aim(slingStopper(l, world, home, arrived, tension, ring));
  const r = slingCupRadius(l);
  const at = { cup: { x: 0, y: -r * 0.2, r }, cords: [cords[0], cords[1]] as [Circle, Circle] };

  if (cooled !== null) {
    drawSlingHeat(ctx, l, cooled, beatPhase);
    // Nothing asks through the cool, but a draw in it is a red still to see.
    drawSlingMarkFeedback(ctx, l, s, time, at, fx.marks.verdicts);
    ctx.restore();
    return;
  }

  // The cup rings only while a shot would land: the fire step, and the yoke
  // lit (`sling-shot.ts`). The script reaches no fire step with the yoke dark
  // today, and the ring must not be the one that says otherwise.
  const firing = step !== null && step.ask === "fire" && s.yokeLit;
  const lit = firing
    ? { color: step.color, left: slingWindowLeft(world, s, beat, beatPhase) }
    : null;
  drawSlingCup(ctx, l, slingCupGlow(world, s, beat, beatPhase), lit, beatPhase);
  drawSlingMarkFeedback(ctx, l, s, time, at, fx.marks.verdicts);

  ctx.restore();
}

/** A cord's mark: round its middle at this frame's draw, carried with its ringing tine, half a tile out. */
function cordMark(l: Layout, side: 0 | 1, tension: number, ring: number): Circle {
  const tip = slingTip(l, side, 1);
  const handle = slingHandle(l, side, tension);
  const mid = slingRung({ x: (tip.x + handle.x) / 2, y: (tip.y + handle.y) / 2 }, side, ring);
  return { ...mid, r: l.tile * 0.5 };
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
