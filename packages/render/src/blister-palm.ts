import type { BlisterFrame } from "./blister-bodies.js";
import {
  type Bone,
  bone,
  bonesOf,
  FINGERS,
  type Pt,
  palmPath,
  THUMB,
} from "./blister-palm-hand.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * How much bigger than the drop the hand is drawn: the owner, 15 October
 * 2026, *make palm more visible to see it is a hand, little bit bigger*.
 */
const PALM_SCALE = 1.3;

/**
 * PALM, one of THE BLISTER's two HOLD bodies (`blister-bodies.ts`): a slime
 * hand comes up out of the pore palm first, the HOLD's drop cupped in it like
 * water, built the way a hand is (`blister-palm-hand.ts`). Nobody on it, the
 * fingers stand open and flex one after another; under a thumb they fold at
 * every joint over the drop and grip it, as the player's own hand is gripping
 * it, the folded tips coming down in front with their nails showing. Taken
 * from VERSUS, 15 October 2026.
 */
export function drawPalmBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const k = f.r * PALM_SCALE;
  const held = b.c.blisterHeldTicks !== undefined;
  ctx.save();
  // Drawn in body radii round the drop's middle; the heel goes on down the
  // pore, where it is clipped.
  ctx.translate(b.x, b.y + (1 - f.rise) * f.r * 1.8);
  ctx.scale(k, k);
  const back = new Path2D();
  const front = new Path2D();
  const creases = new Path2D();
  const nails: Bone[] = [];
  let anyFront = false;
  palmPath(back, (q) => q);
  FINGERS.forEach((d, i) => {
    const curl = held ? 1 : 0.12 + 0.1 * Math.sin(b.time * 2.2 - i * 0.7);
    const bones = bonesOf(d, curl, false);
    bones.forEach((bn, j) => {
      bone(bn.folded ? front : back, bn.a, bn.b, bn.wa, bn.wb);
      anyFront ||= bn.folded;
      if (bn.folded && bn.tip) nails.push(bn);
      // A joint still open shows its crease; one bent toward the viewer is a knuckle.
      const next = bones[j + 1];
      if (next && !next.folded) crease(creases, bn.b, next.b, next.wa * 0.75);
    });
  });
  const thumb = bonesOf(THUMB, held ? 1 : 0.1, true);
  for (const bn of thumb) bone(back, bn.a, bn.b, bn.wa, bn.wb);
  palmLines(creases);
  const px = 1 / k;
  outline(ctx, back, Math.max(2.5, f.r * 0.15) * px, rgba(PALETTE.organRim, 0.9));
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, f.r * 0.06) * px;
  ctx.strokeStyle = rgba(PALETTE.vein, 0.75);
  ctx.stroke(creases);
  // The folded fingers in front of the palm and its lines, seamed in the dark
  // so they read as over it.
  if (anyFront) outline(ctx, front, Math.max(2, f.r * 0.12) * px, rgba(PALETTE.vein, 0.95));
  ctx.lineWidth = Math.max(0.75, f.r * 0.04) * px;
  ctx.strokeStyle = rgba(PALETTE.vein, 0.75);
  const nailPath = new Path2D();
  for (const bn of nails) nail(nailPath, bn, 0);
  const thumbTip = thumb[thumb.length - 1];
  if (thumbTip) nail(nailPath, thumbTip, -0.45);
  ctx.fillStyle = rgba(PALETTE.organRim, 0.85);
  ctx.fill(nailPath);
  ctx.stroke(nailPath);
  ctx.restore();
}

/** Stroked before it is filled, so the fill hides where bones cross the palm;
 * opaque, or the stroke under it would show through. */
function outline(ctx: CanvasRenderingContext2D, p: Path2D, width: number, rim: string): void {
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = rim;
  ctx.stroke(p);
  ctx.fillStyle = PALETTE.organ;
  ctx.fill(p, "nonzero");
}

/** A joint's crease: a short line across the finger at `at`, square to the bone after it. */
function crease(p: Path2D, at: Pt, toward: Pt, half: number): void {
  const a = Math.atan2(toward.y - at.y, toward.x - at.x);
  const nx = -Math.sin(a) * half;
  const ny = Math.cos(a) * half;
  p.moveTo(at.x + nx, at.y + ny);
  p.lineTo(at.x - nx, at.y - ny);
}

/** The heart line under the fingers, the head line across, and the life line
 * round the mound under the thumb — mostly behind the drop, showing past it. */
function palmLines(p: Path2D): void {
  p.moveTo(0.84, -0.5);
  p.quadraticCurveTo(0.25, -0.5, -0.4, -0.84);
  p.moveTo(-0.96, -0.46);
  p.quadraticCurveTo(-0.2, -0.38, 0.6, -0.08);
  p.moveTo(-0.95, -0.42);
  p.quadraticCurveTo(-0.5, 0.1, -0.6, 0.95);
}

/** A nail on the far end of a bone, set `side` of its width off its middle line. */
function nail(p: Path2D, bn: Bone, side: number): void {
  const dx = bn.b.x - bn.a.x;
  const dy = bn.b.y - bn.a.y;
  const len = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  const off = side * bn.wb;
  const cx = bn.a.x + dx * 0.62 - Math.sin(a) * off;
  const cy = bn.a.y + dy * 0.62 + Math.cos(a) * off;
  const rx = Math.max(len * 0.3, bn.wb * 0.5);
  p.moveTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * rx);
  p.ellipse(cx, cy, rx, bn.wb * 0.62, a, 0, Math.PI * 2);
}
