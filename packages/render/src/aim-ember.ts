import type { Color } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * **EMBER — the mark a shot's target wears**: a wobbling ring of neon round
 * the whole target, and four arrows on the diagonals that point in at it,
 * swinging out a little and back. Taken from VERSUS (`aim:cannon`), the
 * owner, 9 October 2026: *i like "EMBER" the most … arrows look a little bit
 * more like arrows so not so thin near the circle … the round crosshair
 * should be around the full bubble in the middle not overlapping it - better
 * bigger than too small … animate a little bit that arrows moves away from
 * circle and than again towards it, but just a small distance.*
 *
 * `r` is **the target's own radius**, what the bolt must reach as it is
 * drawn, and the ring stands outside it at its narrowest (`RING_MIN`): the
 * thing to shoot is inside the circle, never under its line. The colour is
 * the fire button's — red, or the cue's `tint` where the colour is the ask.
 */

/** The ring's radius, in the target's, and how far its three waves move it. */
const RING = 1.32;
const WOBBLE = [0.07, 0.04, 0.025] as const;
/** The ring's narrowest, in the target's radius: always clear of it. */
export const RING_MIN = RING * (1 - WOBBLE[0] - WOBBLE[1] - WOBBLE[2]);

/** An arrow, in the target's radius: its head's length and half-width, its neck, its shaft. */
const HEAD = 0.46;
const BARB = 0.3;
const NECK = 0.1;
const SHAFT = 0.62;
/** Where the arrowhead's back is notched in, as a share of the head. */
const NOTCH = 0.74;
/** The room between the ring and an arrow's point, and how far it swings out and back. */
const GAP = 0.12;
const SWING = 0.2;
/** One swing out and back, in seconds. */
const SWING_S = 1.15;

/** How far the mark reaches from its target, in the target's radius (`AIM_LOOK.reach`). */
export const EMBER_REACH =
  RING * (1 + WOBBLE[0] + WOBBLE[1] + WOBBLE[2]) + GAP + SWING + HEAD * NOTCH + SHAFT + 0.1;

const RING_N = 72;

/** The fire button's colour and its hot rim, for the colour a shot asks. */
export function emberHues(tint: Color = "red"): { hex: string; rim: string } {
  return tint === "cyan"
    ? { hex: PALETTE.cyan, rim: PALETTE.cyanRim }
    : { hex: PALETTE.red, rim: PALETTE.redRim };
}

/** A ring that never sits still: three slow waves round it, each at its own speed. */
function ringR(a: number, t: number): number {
  return (
    1 +
    WOBBLE[0] * Math.sin(3 * a + 1.7 * t) +
    WOBBLE[1] * Math.sin(5 * a - 2.3 * t + 1) +
    WOBBLE[2] * Math.sin(8 * a + 3.1 * t + 2)
  );
}

/** A tube of neon: a dark sleeve so it reads on a target of its own colour, the glow and body, a hot thread. */
function neon(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  w: number,
  k: number,
  hex: string,
  rim: string,
): void {
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = w + 3;
  ctx.globalAlpha = 0.7;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, p, hex, w, 2.2 * k, 1, 10);
  ctx.strokeStyle = rim;
  ctx.lineWidth = w * 0.4;
  ctx.globalAlpha = 0.9;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
}

/** A solid of neon: a soft dark shadow, its glow, its body in the exact colour, a hot edge. */
function glowFill(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  hex: string,
  rim: string,
  k: number,
): void {
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.35;
  ctx.stroke(p);
  strokeGlow(ctx, p, hex, 0.8, 2.4 * k, 0.9, 9);
  ctx.globalAlpha = 0.8 + 0.2 * k;
  ctx.fillStyle = hex;
  ctx.fill(p);
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = rim;
  ctx.lineWidth = 0.8;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
}

/** The ring of neon round a target of radius `r`, centred on it. */
export function emberRing(r: number, x: number, y: number, t: number): Path2D {
  const loop = new Path2D();
  const m0 = r * RING;
  for (let i = 0; i <= RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2;
    const m = m0 * ringR(a, t);
    if (i === 0) loop.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else loop.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  loop.closePath();
  return loop;
}

/**
 * One arrow pointing in along angle `a`, its point `tip` from the centre: a
 * broad head with swept-back barbs, a shaft behind it bending a little.
 */
function arrow(
  p: Path2D,
  x: number,
  y: number,
  a: number,
  tip: number,
  r: number,
  bend: number,
): void {
  const head = r * HEAD;
  const back = tip + head * NOTCH;
  const tail = back + r * SHAFT;
  // Along the arrow (out from the centre), then across it.
  const pts: [number, number][] = [
    [tip, 0],
    [tip + head, r * BARB],
    [back, r * NECK],
    [tail, r * NECK * 0.8],
    [tail + r * 0.06, 0],
    [tail, -r * NECK * 0.8],
    [back, -r * NECK],
    [tip + head, -r * BARB],
  ];
  const c = Math.cos(a);
  const s = Math.sin(a);
  pts.forEach(([u, v], i) => {
    const lift = bend * ((u - tip) / (tail - tip)) ** 2;
    const px = x + c * u - s * (v + lift);
    const py = y + s * u + c * (v + lift);
    if (i === 0) p.moveTo(px, py);
    else p.lineTo(px, py);
  });
  p.closePath();
}

/** The arrows' path round a target of radius `r` at time `t`: four, on the diagonals, swinging out and back. */
export function emberArrows(r: number, x: number, y: number, t: number): Path2D {
  const arrows = new Path2D();
  const swing = 0.5 - 0.5 * Math.cos((t * Math.PI * 2) / SWING_S);
  for (let q = 0; q < 4; q++) {
    const a = (q * Math.PI) / 2 + Math.PI / 4 + 0.1 * Math.sin(1.3 * t + q * 1.9);
    const tip = r * (RING * (1 + WOBBLE[0] + WOBBLE[1] + WOBBLE[2]) + GAP + SWING * swing);
    const bend = r * 0.14 * Math.sin(1.1 * t + q * 0.8);
    arrow(arrows, x, y, a, tip, r, bend);
  }
  return arrows;
}

/** EMBER: the ring round a target of radius `r` at (x, y), and the arrows pointing in at it. */
export function paintEmber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  k: number,
  t: number,
  tint?: Color,
): void {
  const { hex, rim } = emberHues(tint);
  halo(ctx, x, y, r * RING * 2.2, hex, 0.18 * k);
  neon(ctx, emberRing(r, x, y, t), 2.4, k, hex, rim);
  glowFill(ctx, emberArrows(r, x, y, t), hex, rim, k);
}
