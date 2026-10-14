import { LIGHT_HALF } from "@neon-spore/content";
import { type SlingState, slingAsks, slingLitStep, type World } from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SlingFx } from "./sling-fx.js";
import { drawSlingGlanced, slingGlancedPoint } from "./sling-glance.js";
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
import { drawSlingPulls } from "./sling-pull.js";
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
  const firing = step !== null && step.ask === "fire" && s.yokeLit;
  // The whole fork turns as `sling-glance.ts` says; the marks follow its cords.
  drawSlingGlanced(ctx, l, time, (g) => {
    const tines: Path2D[] = [];
    for (const side of [0, 1] as const) {
      g.save();
      g.rotate(slingTineTurn(side, ring));
      tines.push(rungPath(drawTine(g, l, side, arrived, time), slingTineTurn(side, ring)));
      const drawn =
        cooled === null
          ? slingTension(world, s, side, beat, beatPhase)
          : slingCoolTension(s, side, cooled, beatPhase);
      drawSlingCord(g, l, side, drawn, slingAsks(s, side), beatPhase);
      g.restore();
      cords.push(cordMark(l, side, drawn, ring, time));
      tension[side] = drawn;
    }
    if (cooled !== null) {
      drawSlingHeat(g, l, cooled, beatPhase);
      return tines;
    }
    // The cup rings only while a shot would land: the fire step, and the yoke
    // lit (`sling-shot.ts`). The script reaches no fire step with the yoke dark
    // today, and the ring must not be the one that says otherwise.
    const lit = firing
      ? { color: step.color, left: slingWindowLeft(world, s, beat, beatPhase) }
      : null;
    drawSlingCup(g, l, slingCupGlow(world, s, beat, beatPhase), lit, beatPhase);
    return tines;
  });
  stops?.aim(slingStopper(l, world, home, arrived, tension, ring, time));
  const r = slingCupRadius(l);
  const at = { cup: { x: 0, y: -r * 0.2, r }, cords: [cords[0], cords[1]] as [Circle, Circle] };
  // Nothing asks through the cool, but a draw in it is a red still to see.
  drawSlingMarkFeedback(ctx, l, s, time, at, fx.marks.verdicts);
  // A cord whose hold has counted is a pull knob where its mark was.
  drawSlingPulls(ctx, l, cfg, s, time, at.cords);
  ctx.restore();
}

/** A cord's mark: round its middle at this frame's draw, carried with its ringing tine and the fork's turn, half a tile out. */
function cordMark(l: Layout, side: 0 | 1, tension: number, ring: number, time: number): Circle {
  const tip = slingTip(l, side, 1);
  const handle = slingHandle(l, side, tension);
  const mid = slingRung({ x: (tip.x + handle.x) / 2, y: (tip.y + handle.y) / 2 }, side, ring);
  return { ...slingGlancedPoint(l, time, mid), r: l.tile * 0.5 };
}

/** `path`, laid in a tine's own frame, turned `a` into the fork's — what the far tine's dark is laid over. */
function rungPath(path: Path2D, a: number): Path2D {
  const c = Math.cos(a);
  const n = Math.sin(a);
  const out = new Path2D();
  out.addPath(path, { a: c, b: n, c: -n, d: c, e: 0, f: 0 });
  return out;
}

/** One tine, splayed to `arrived`: scoured steel, the key light on it, its dark outline. Answers with its outline. */
function drawTine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  arrived: number,
  time: number,
): Path2D {
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
  return path;
}
