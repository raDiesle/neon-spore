import type { PulseLane } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * One arrow, and the two ways of drawing one that cannot be read.
 *
 * **It is a body, not a glyph.** A triangle with a stalk is what a stepfile
 * editor draws; nothing else in this game is drawn that way, and a round whose
 * arrows were flat vectors would be the one screen in it that looks printed. So
 * an arrow here is a **swelling with a nose** — a closed contour built out of
 * two shoulders and a point, with a wet highlight up one side and a slow
 * squash-and-stretch on its own phase, which is the same rule everything alive
 * in this game is drawn under (`docs/alive.md`). It reads as an arrow at a
 * glance because the nose is sharp; it reads as *alive* because nothing about
 * it holds still.
 *
 * **A lane is a hue.** Purple, cyan, amber, red, in the order left, down, up,
 * right — four of the shipped palette's own, so nothing new was invented and
 * a colour-blind pair still has the direction of the nose. The red and the
 * cyan mean ammunition everywhere else and mean nothing here, which is exactly
 * what a round is allowed to do: the field is gone, and with it the vocabulary
 * that hung on it (`docs/spec/interludes.md`).
 *
 * **A veiled arrow keeps the body and loses the nose's direction.** It cycles
 * through all four headings on a fast clock rather than wearing a question
 * mark, because a question mark is a label and the pair's problem is not that
 * they do not know it is unknown — the ambiguity itself is what should be on
 * the screen. Its colour goes to the rock grey armour wears, which is the
 * game's own word for *you cannot act on this yet*.
 */

/** The four hues, in `PULSE_LANES`' order. */
const LANE_COLOR: Record<PulseLane, string> = {
  left: PALETTE.hull,
  down: PALETTE.cyan,
  up: PALETTE.pod,
  right: PALETTE.red,
};

const LANE_RIM: Record<PulseLane, string> = {
  left: PALETTE.hullRim,
  down: PALETTE.cyanRim,
  up: PALETTE.podRim,
  right: PALETTE.redRim,
};

export const pulseLaneColor = (lane: PulseLane): string => LANE_COLOR[lane];

/** How far round the nose points: 0 is up, and the four are quarters of a turn. */
const LANE_TURN: Record<PulseLane, number> = {
  up: 0,
  right: Math.PI / 2,
  down: Math.PI,
  left: -Math.PI / 2,
};

/**
 * The contour, drawn around the origin with the nose pointing up, at radius 1.
 *
 * Six points and four curves rather than a polygon: the shoulders are where
 * the body would be widest if it were a blob, the tail is a shallow scoop
 * rather than a flat cut, and the nose is the one place the contour comes to a
 * point. `squash` is the breath — over 1 it is taller and thinner, under 1
 * flatter and wider, so the same shape stretches towards the line it is
 * falling at rather than simply growing.
 */
function arrowPath(r: number, squash: number): Path2D {
  const p = new Path2D();
  const ry = r * squash;
  const rx = r / squash;
  p.moveTo(0, -ry);
  p.quadraticCurveTo(rx * 0.62, -ry * 0.34, rx, ry * 0.16);
  p.quadraticCurveTo(rx * 0.72, ry * 0.34, rx * 0.4, ry * 0.3);
  p.quadraticCurveTo(rx * 0.16, ry * 0.62, 0, ry * 0.94);
  p.quadraticCurveTo(-rx * 0.16, ry * 0.62, -rx * 0.4, ry * 0.3);
  p.quadraticCurveTo(-rx * 0.72, ry * 0.34, -rx, ry * 0.16);
  p.quadraticCurveTo(-rx * 0.62, -ry * 0.34, 0, -ry);
  p.closePath();
  return p;
}

export interface ArrowLook {
  /** Where it is. */
  x: number;
  y: number;
  /** Half its height, in pixels. */
  r: number;
  /** Which way the nose points. */
  lane: PulseLane;
  /** Seconds, for the breath. Wall clock: nothing about it touches a tile. */
  time: number;
  /** 0 far away, 1 on the line — how bright and how solid it is. */
  near: number;
  /** Drawn in armour grey with no direction to be read off it. */
  veiled?: boolean;
  /** This seat can read it and the other cannot: it wears the light. */
  calls?: boolean;
}

/**
 * One arrow.
 *
 * A veiled one is turned by its own clock rather than by its lane, which is
 * the whole of the hiding: everything else about the two drawings is the same,
 * so the pair are looking at the same body and disagreeing only about which
 * way it faces.
 */
export function drawPulseArrow(ctx: CanvasRenderingContext2D, a: ArrowLook): void {
  const breath = Math.sin(a.time * 3.1 + a.x * 0.017);
  const squash = 1 + 0.09 * breath + 0.14 * a.near;
  const turn = a.veiled === true ? veilTurn(a.time) : LANE_TURN[a.lane];
  const body = LANE_COLOR[a.lane];
  const rim = LANE_RIM[a.lane];
  const skin = a.veiled === true ? PALETTE.rock : body;
  const edge = a.veiled === true ? PALETTE.text : rim;

  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(turn);
  const path = arrowPath(a.r, squash);

  // The light it throws, under everything, so a lane full of arrows reads as
  // one lit channel rather than as separate stickers.
  halo(ctx, 0, 0, a.r * 1.9, a.veiled === true ? PALETTE.rockDark : body, 0.16 + 0.4 * a.near);

  const fill = ctx.createLinearGradient(0, -a.r, 0, a.r);
  fill.addColorStop(0, edge);
  fill.addColorStop(0.42, skin);
  fill.addColorStop(1, a.veiled === true ? PALETTE.rockDark : PALETTE.background);
  ctx.globalAlpha = 0.35 + 0.65 * a.near;
  ctx.fillStyle = fill;
  ctx.fill(path);

  ctx.globalAlpha = 1;
  strokeGlow(ctx, path, edge, 1.6, 0.5 + a.near);

  // The wet stripe up one shoulder — one highlight, off centre, which is what
  // makes a filled shape read as a surface rather than as a colour.
  ctx.globalAlpha = 0.28 + 0.34 * a.near;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, a.r * 0.14);
  ctx.beginPath();
  ctx.moveTo(-a.r * 0.34, a.r * 0.1);
  ctx.quadraticCurveTo(-a.r * 0.26, -a.r * 0.42, -a.r * 0.04, -a.r * 0.72);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // The one thing that is added rather than changed: an arrow only this seat
  // can read wears a bright core, which is the game's own way of picking a
  // body out (light, never a ring).
  if (a.calls === true) halo(ctx, a.x, a.y, a.r * 0.9, PALETTE.text, 0.3 + 0.45 * a.near);
}

/**
 * Which way a veiled arrow is pointing this instant.
 *
 * Six turns a second, which is fast enough that no single frame of it can be
 * mistaken for an answer and slow enough that a person can see it is cycling
 * through four things rather than flickering.
 */
function veilTurn(time: number): number {
  const step = Math.floor(time * 6) % 4;
  return (step * Math.PI) / 2;
}

/**
 * A receptor: the empty arrow standing on the line, waiting for its own.
 *
 * Drawn as the same contour with nothing in it, so what a landing arrow does
 * is *fill* a shape that was already there — which is the one moment in the
 * round the eye has to catch, and it catches a fill far faster than it catches
 * two shapes overlapping.
 */
export function drawPulseReceptor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lane: PulseLane,
  /** 0 resting, 1 the instant a press landed in this lane. */
  lit: number,
  /** 1 while a miss in this lane is still being felt. */
  sore: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(LANE_TURN[lane]);
  const path = arrowPath(r * (1 + 0.16 * lit), 1);
  if (lit > 0) {
    ctx.globalAlpha = 0.5 * lit;
    ctx.fillStyle = LANE_RIM[lane];
    ctx.fill(path);
    ctx.globalAlpha = 1;
  }
  const color = sore > 0 ? PALETTE.red : LANE_COLOR[lane];
  ctx.globalAlpha = 0.4 + 0.5 * Math.max(lit, sore);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  ctx.restore();
  if (lit > 0) halo(ctx, x, y, r * 2.2, LANE_COLOR[lane], 0.5 * lit);
  if (sore > 0) halo(ctx, x, y, r * 1.6, PALETTE.red, 0.45 * sore);
}
