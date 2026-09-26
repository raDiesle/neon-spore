import { sacPoints } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE PLUMB's geometry**: where the bob hangs, and the paths it is made of.
 *
 * **The body is two drafts combined** (`tools/shape-sheet/src/drafts/`): the
 * bob is THE WEIGHT's sac — *a blob with its mass pulled downward, hanging
 * rather than floating*, narrow at the top where it meets the beam — and its
 * two counterweights are THE POMMEL's balls on stalks, *a heavy body wearing
 * balls on stalks, no two the same*: two lobed balls on chains off the ends
 * of a beam, the pilot's heavier than the navigator's, so the whole thing
 * hangs lopsided until both are brought true. Neither draft is the other's
 * form turned up: the sac is the mass and the balls are what the thumbs move.
 *
 * Everything is laid round the **hook** at the origin — the one point that
 * does not move. The beam and the sac pivot on it and the chains hang off the
 * beam's ends in the field's own down, so a tilted beam is read against the
 * plumb line under the hook, and the draw moves the canvas rather than the
 * points.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the hook hangs at, in tiles below the grid's top. */
const ROW = 0.35;
/** Hook to the beam's middle, in tiles. */
const STEM = 1;
/** The beam's half-length and half-thickness, in tiles. */
const ARM = 1.9;
const BAR = 0.09;
/** Beam end to ball centre. */
const CHAIN = 1.25;
/** Each ball's radius, the pilot's then the navigator's: the left the heavier. */
const BALL: readonly [number, number] = [0.6, 0.48];
/** THE POMMEL's lobing on each ball, and a seed apiece so no two are the same. */
const BALL_LOBES = 4;
const BALL_DEPTH = 0.05;
const BALL_SEED: readonly [number, number] = [2.4, 4.1];
/** THE WEIGHT's card: its sag, and its 74 by 96 in tiles. */
const SAC_BIAS = 0.46;
const SAC_RX = 0.78;
const SAC_RY = 1;
/** A sac's top sits `1 - bias` of its half-height above its origin. */
const SAC_TOP = 1 - SAC_BIAS;
/** The gap between the beam and the sac's narrow top. */
const NECK = 0.06;
/** Where the core sits in the sac's belly, as a share of its half-height, and its radius. */
const CORE_AT = 0.5;
const CORE = 0.3;
/** A level glass: under each ball's rest, this far below the hook, this wide and tall. */
const GLASS_Y = 3.75;
const GLASS_W = 1.7;
const GLASS_H = 0.34;
/** Samples round the sac. */
const N = 48;

/** The hook: over the middle column, at the very top of the field. */
export function plumbHook(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far above its place the bob still is, `arrived` of the way in. */
export function plumbLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 4 * l.tile;
}

/** The beam's middle, below the hook, in the beam's own frame. */
export function plumbBeamY(l: Layout): number {
  return STEM * l.tile;
}

/** Where beam end `side` is once the beam has turned `skew` about the hook. */
export function plumbBeamEnd(l: Layout, side: 0 | 1, skew: number): Point {
  const x = (side === 0 ? -ARM : ARM) * l.tile;
  const y = STEM * l.tile;
  const c = Math.cos(skew);
  const s = Math.sin(skew);
  return { x: x * c - y * s, y: x * s + y * c };
}

/** The stem and the beam, one bar in the beam's frame. */
export function plumbBeamPath(l: Layout): Path2D {
  const t = l.tile;
  const p = new Path2D();
  const y = STEM * t;
  p.moveTo(-ARM * t, y - BAR * t);
  p.lineTo(ARM * t, y - BAR * t);
  p.arc(ARM * t, y, BAR * t, -Math.PI / 2, Math.PI / 2);
  p.lineTo(-ARM * t, y + BAR * t);
  p.arc(-ARM * t, y, BAR * t, Math.PI / 2, (Math.PI * 3) / 2);
  p.closePath();
  p.moveTo(-BAR * 0.6 * t, 0);
  p.lineTo(BAR * 0.6 * t, 0);
  p.lineTo(BAR * 0.6 * t, y);
  p.lineTo(-BAR * 0.6 * t, y);
  p.closePath();
  return p;
}

/** The hook's ring round the origin. */
export function plumbHookPath(l: Layout): Path2D {
  const p = new Path2D();
  p.arc(0, -0.12 * l.tile, 0.14 * l.tile, 0, Math.PI * 2);
  return p;
}

/** The sac's origin, below the beam: its narrow top just under the bar. */
export function plumbSacMiddle(l: Layout): Point {
  return { x: 0, y: (STEM + BAR + NECK + SAC_TOP * SAC_RY) * l.tile };
}

/** The sac's half-width and half-height, in pixels. */
export function plumbSacRadius(l: Layout): { rx: number; ry: number } {
  return { rx: SAC_RX * l.tile, ry: SAC_RY * l.tile };
}

/**
 * THE WEIGHT's sac round its own origin, `wide` of its width showing: under 1
 * it is seen turned towards its edge, 1 it is face-on. `time` breathes its
 * skin, slow enough never to say *now*.
 */
export function plumbSacPath(l: Layout, wide: number, time: number): Path2D {
  const { rx, ry } = plumbSacRadius(l);
  const pts = sacPoints(time * 0.25, SAC_BIAS, rx, ry, undefined, N);
  return splinePath(
    pts.map((p) => ({ x: p.x * wide, y: p.y })),
    true,
  );
}

/** The sac's lowest point below its origin: where the plumb line is read against. */
export function plumbSacBottom(l: Layout): number {
  return (1 + SAC_BIAS) * SAC_RY * l.tile;
}

/** The core's middle, in the sac's frame, and its fullest radius. */
export function plumbCore(l: Layout): Point & { r: number } {
  return { x: 0, y: CORE_AT * SAC_RY * l.tile, r: CORE * SAC_RX * l.tile };
}

/** Ball `side`'s radius, in pixels. */
export function plumbBallR(l: Layout, side: 0 | 1): number {
  return BALL[side] * l.tile;
}

/** Beam end to ball centre, in pixels. */
export function plumbChain(l: Layout): number {
  return CHAIN * l.tile;
}

/** Ball `side` round its own centre: THE POMMEL's cap, four shallow lobes, its own seed. */
export function plumbBallPath(l: Layout, side: 0 | 1): Path2D {
  const r = plumbBallR(l, side);
  const pts: Point[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const m = 1 + BALL_DEPTH * Math.cos(BALL_LOBES * a + BALL_SEED[side]);
    pts.push({ x: Math.cos(a) * r * m, y: Math.sin(a) * r * m });
  }
  return splinePath(pts, true);
}

/** A chain of links from `from` to `to`: small rings laid along the line, a gap between each. */
export function plumbChainPath(l: Layout, from: Point, to: Point): Path2D {
  const p = new Path2D();
  const links = 6;
  const r = 0.07 * l.tile;
  for (let k = 0; k < links; k++) {
    const f = (k + 0.5) / links;
    const x = from.x + (to.x - from.x) * f;
    const y = from.y + (to.y - from.y) * f;
    p.moveTo(x + r, y);
    p.arc(x, y, r, 0, Math.PI * 2);
  }
  return p;
}

/** Glass `side`'s middle and its half-width, half-height: under the ball it reads for. */
export function plumbGlass(l: Layout, side: 0 | 1): Point & { hw: number; hh: number } {
  return {
    x: (side === 0 ? -ARM : ARM) * l.tile,
    y: GLASS_Y * l.tile,
    hw: (GLASS_W / 2) * l.tile,
    hh: (GLASS_H / 2) * l.tile,
  };
}

/** A level's vial round its own middle: a capsule, the bubble's track. */
export function plumbVialPath(hw: number, hh: number): Path2D {
  const p = new Path2D();
  p.moveTo(-hw + hh, -hh);
  p.lineTo(hw - hh, -hh);
  p.arc(hw - hh, 0, hh, -Math.PI / 2, Math.PI / 2);
  p.lineTo(-hw + hh, hh);
  p.arc(-hw + hh, 0, hh, Math.PI / 2, (Math.PI * 3) / 2);
  p.closePath();
  return p;
}
