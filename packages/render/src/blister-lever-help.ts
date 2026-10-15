import {
  blisterLeverDepth,
  blisterLeverHeld,
  blisterLeverInBand,
  blisterLeverShare,
  type Creature,
  type World,
} from "@neon-spore/sim";
import { drawHandleDial, handleRadius } from "./handle-draw.js";
import type { Layout } from "./layout.js";
import { drawLeverGroove, type GrooveSide, groovePoint } from "./lever-groove.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob, PULL_SIZE } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **THE BLISTER's LEVER help**: THE LEVER LAB's lever on the body, in the
 * lab's own marks (`lever-groove.ts`, `tools/director/src/lever-lab-paint.ts`)
 * — a graduated groove straight down from the body's centre, the band on it
 * dim until the knob stands in it and green while it does, the PULL LAB's
 * channel drawn only as far as the band's middle, where to hold, and the knob
 * where the thumb has put it. While it is held in the band the game's handle
 * dial sweeps round the knob as the hold fills (`drawHandleDial`); a whole
 * sweep is a blow (`sim/blister-lever.ts`). On the seat that may move it only;
 * the partner is drawn the waiting clock (`blister-help.ts`).
 */
export function drawBlisterLever(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  at: { x: number; y: number; r: number },
  time: number,
): void {
  const { cfg } = world;
  const length = (cfg.blisterLeverMilli * l.tile) / 1000;
  const side: GrooveSide = { x0: at.x, y0: at.y, x1: at.x, y1: at.y + length };
  const zone = [
    cfg.blisterLeverFromMilli / cfg.blisterLeverMilli,
    cfg.blisterLeverToMilli / cfg.blisterLeverMilli,
  ] as const;
  const held = blisterLeverHeld(c);
  const lit = held && blisterLeverInBand(world, c);
  drawLeverGroove(ctx, [side], { zone, lit, tile: l.tile });
  const depth = blisterLeverDepth(world, c);
  const goal = (zone[0] + zone[1]) / 2;
  const r = handleRadius(l, cfg) * KNOB_SHARE;
  const end = groovePoint(side, goal);
  const track: PullTrack = { pts: [{ x: at.x, y: at.y }, end], w: r * PULL_TRACK_W };
  const key = `blister:${c.id}`;
  drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at: Math.min(1, depth / goal), time, key });
  const knob = groovePoint(side, depth);
  drawPullKnob(ctx, knob, r, { ...LOOK, held, time, way: { dx: 0, dy: 1 }, key });
  if (lit) {
    drawHandleDial(
      ctx,
      knob.x,
      knob.y,
      r * PULL_SIZE * 0.75,
      PALETTE.goodRim,
      blisterLeverShare(world, c),
    );
  }
}

/** The knob, as a share of every pull handle's radius: a blister is small (`blister-help.ts`). */
const KNOB_SHARE = 0.8;

/** The lever's colours: SWIPE's, which are THE MAZE's (`blister-help.ts`). */
const LOOK = { hex: PALETTE.hullRim, rim: PALETTE.text } as const;
