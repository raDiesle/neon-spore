import { MAGNET_SHAPE, type MagnetShape } from "@neon-spore/content";
import { type Creature, magnetPoleColor, type SimConfig } from "@neon-spore/sim";
import { livingBodyMul } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE MAGNET, drawn: a horseshoe on two coloured poles with an armoured plate
 * slung under it.
 *
 * **It is not a blob and it cannot be one.** Every living body in this game is
 * a radius sampled all the way round a centre (`blobRadiusMul`), and this one
 * has a hole through the middle and an opening at the bottom — a contour no
 * radius function describes. THE LID is the same case and takes the same
 * route: a shape of its own in `content` (`magnet-shape.ts`) and a draw path
 * of its own here, routed away in `creature-body.ts` before the living pass
 * sees it.
 *
 * **The picture has to say the rule before anybody reads a word.** Three
 * things are drawn and each is one clause of it. The *opening* at the bottom
 * says there is a way in. The *plate* under it, wider than the poles stand and
 * hanging clear below them, says the way in is not from underneath. And the
 * two *poles* say that the way in has a colour, and that which colour depends
 * on which side. Nothing here is decoration: take away any one of the three
 * and the body stops explaining `sim/magnet.ts`.
 *
 * **The plate is the only armour in this game that is not cut from the body's
 * own contour**, and that is the owner's rule bent on purpose rather than
 * forgotten. Armour that follows a body says *this thing is hard all over*;
 * this plate has to say the opposite — that one direction is shut and the
 * others are open — and a border round the horseshoe would say the first
 * thing while the rule does the second. It is joined into the arch by a staff
 * thick enough to be part of the same mass rather than a wire drawn between
 * two separate objects.
 *
 * `MAGNET_LOOK` is a record and the draw goes through it for `STRAND_LOOK`'s
 * reason: a candidate look is a field patched onto it for the length of one
 * `draw()`, and a path that named the function would never see one
 * (`docs/versus.md`).
 */

/** Everything the body draw needs, so the table next door can hand it over
 * without this file importing the table back (`creature-body.ts`). */
export interface MagnetDraw {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  cfg: SimConfig;
  c: Creature;
  x: number;
  y: number;
  /** The pose clock in beats — the hang is read off it, never off `time`. */
  beats: number;
  /** Seconds of white left on the plate after it turned a shot away, or 0. */
  struck: number;
  near: number;
}

/** How far the body swings, in radians, and how many beats a swing takes.
 * Small: it hangs, it does not sway — a plate that visibly tips would be a
 * picture arguing with a rule that knows nothing about tipping. */
const HANG = 0.05;
const HANG_BEATS = 2.7;

/** A whole turn, so the angles below read as what they are. */
const TURN = Math.PI * 2;
/** Straight down, in canvas bearings. Every angle here is measured from it. */
const DOWN = Math.PI / 2;

/** The band between the two radii, from `a0` to `a1`, going `ccw`. */
function band(
  r: number,
  outer: number,
  inner: number,
  a0: number,
  a1: number,
  ccw: boolean,
): Path2D {
  const p = new Path2D();
  p.arc(0, 0, r * outer, a0, a1, ccw);
  p.arc(0, 0, r * inner, a1, a0, !ccw);
  p.closePath();
  return p;
}

/** The whole horseshoe, gap at the bottom. */
export function magnetArchPath(r: number, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const g = s.gapTurn * TURN;
  return band(r, s.outer, s.inner, DOWN - g, DOWN + g - TURN, true);
}

/** One pole tip: the last `poleTurn` of an arm, which is the part that carries
 * a colour. `left` is the arm on the viewer's left, and it is the arm that
 * carries the body's authored colour (`magnetPoleColor` in sim). */
export function magnetPolePath(r: number, left: boolean, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const g = s.gapTurn * TURN;
  const p = s.poleTurn * TURN;
  return left
    ? band(r, s.outer, s.inner, DOWN + g, DOWN + g + p, false)
    : band(r, s.outer, s.inner, DOWN - g, DOWN - g - p, true);
}

/** The staff and the plate as one path, so they fill as one mass and no seam
 * is ever drawn between them. */
export function magnetPlatePath(r: number, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const p = new Path2D();
  // The staff starts inside the arch's crown rather than at its inner edge, so
  // the two overlap instead of touching.
  const top = -r * (s.outer + s.inner) * 0.5;
  p.rect(-r * s.staffHalf, top, r * s.staffHalf * 2, r * s.plateDrop - top);
  p.addPath(magnetSlabPath(r, s));
  return p;
}

/** The plate alone, without the staff it hangs on — the half that is armour,
 * and the only edge on this body drawn in hard white. */
export function magnetSlabPath(r: number, s: MagnetShape = MAGNET_SHAPE): Path2D {
  const p = new Path2D();
  p.roundRect(
    -r * s.plateHalf,
    r * (s.plateDrop - s.plateThick),
    r * s.plateHalf * 2,
    r * s.plateThick * 2,
    r * s.plateThick,
  );
  return p;
}

/** The tip of one pole, in body radii — where its light hangs. */
function poleTip(r: number, left: boolean, s: MagnetShape): { x: number; y: number } {
  const a = DOWN + (left ? 1 : -1) * s.gapTurn * TURN;
  const mid = r * (s.outer + s.inner) * 0.5;
  return { x: Math.cos(a) * mid, y: Math.sin(a) * mid };
}

function drawMagnet(d: MagnetDraw): void {
  const { ctx, l, cfg, c, x, y, beats, struck, near } = d;
  const s = MAGNET_SHAPE;
  const r = l.tile * 0.4 * livingBodyMul(c);
  const haze = (h: string): string => hazed(cfg, h, near);

  ctx.save();
  ctx.translate(x, y);
  // It hangs off the beat clock like every other own-motion, so two devices
  // draw the same body at the same angle (`content/own-motion.ts`).
  ctx.rotate(Math.sin((beats / HANG_BEATS + c.id * 0.37) * TURN) * HANG);

  // The staff and the plate go down **first**, so the arch is drawn over the
  // top of the staff rather than the staff across the arch. They are one mass
  // either way — the staff is rooted inside the crown — but a bright bar laid
  // over the body reads as a pillar standing in front of it, which is the one
  // thing this creature must not look like.
  drawPlate(d, r, s, struck);

  // The arch, dark and matte: it carries no colour of its own, because both of
  // the colours it carries are on the ends.
  const arch = magnetArchPath(r);
  ctx.fillStyle = haze(PALETTE.rockDark);
  ctx.fill(arch);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = haze(PALETTE.dim);
  ctx.stroke(arch);

  drawPole(d, r, true);
  drawPole(d, r, false);
  ctx.restore();
}

/** One pole: filled in its own colour, lit, with a point of light at the tip.
 * The colour comes from `magnetPoleColor` and not from a ternary here — the
 * pole the pair is looking at and the pole the bolt has to match are one fact
 * (`sim/magnet.ts`). */
function drawPole(d: MagnetDraw, r: number, left: boolean): void {
  const { ctx, cfg, c, near } = d;
  const color = magnetPoleColor(c, left);
  if (color === null) return;
  const haze = (h: string): string => hazed(cfg, h, near);
  const hex = haze(color === "red" ? PALETTE.red : PALETTE.cyan);
  const rim = haze(color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
  const path = magnetPolePath(r, left);
  ctx.fillStyle = hex;
  ctx.fill(path);
  ctx.strokeStyle = rim;
  strokeGlow(ctx, path, rim, STROKE.outline, 0.9);
  const tip = poleTip(r, left, MAGNET_SHAPE);
  halo(ctx, tip.x, tip.y, r * 0.7, hex, 0.5);
}

/** The staff and the plate — hard, bright-edged and unlit, which is what
 * holds them apart from the two things on this body that glow. */
function drawPlate(d: MagnetDraw, r: number, s: MagnetShape, struck: number): void {
  const { ctx, cfg, near } = d;
  const haze = (h: string): string => hazed(cfg, h, near);
  const path = magnetPlatePath(r, s);
  ctx.fillStyle = haze(PALETTE.rockDark);
  ctx.fill(path);
  // The staff is the body's own dim and the plate's edge is hard rock white:
  // one of these two is a limb and the other is armour, and the line weight is
  // where a glance is told which.
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = haze(PALETTE.dim);
  ctx.stroke(path);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = haze(PALETTE.rock);
  ctx.stroke(magnetSlabPath(r, s));
  // A shot that came straight up and went nowhere. It is drawn on the plate
  // rather than over the body for the reason the plate exists: what refused
  // the bolt is one edge of this creature, and a flash over the whole of it
  // would say the body was armoured when only its underside is.
  if (struck <= 0) return;
  const heat = Math.min(1, struck * 4);
  ctx.globalAlpha = heat;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  halo(ctx, 0, r * s.plateDrop, r * 1.1, PALETTE.rock, 0.45 * heat);
}

/**
 * The one record a candidate look patches. Shipped: the horseshoe above.
 */
export const MAGNET_LOOK: { body: (d: MagnetDraw) => void } = {
  body: drawMagnet,
};
