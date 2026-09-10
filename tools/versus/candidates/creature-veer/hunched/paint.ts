import { LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import { VEER_CLOWN } from "../../../../../packages/content/src/veer-clown-shape.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { VeerRider } from "../../../../../packages/render/src/veer-look.js";
import { ball, drawBrace, drawFace } from "../../../../../packages/render/src/veer-rider.js";

/**
 * HUNCHED — something clinging to the stone rather than sitting on it.
 *
 * The shipped rider is a head on a collar, and the collar is the only thing
 * saying the figure is on the rock at all. This gives it a **body**: a squat
 * mound straddling the crown, wide as the stone's shoulders and merged into
 * it — the mound's foot overlaps the rock, so the two are one silhouette
 * rather than a circle over a heptagon — with two arms coming down the
 * flanks and ending in mitts pressed to the stone, which is what holding on
 * looks like. The head is sunk into the mound to its chin and the hat is a
 * stub of a cone, because a thing hugging a rock does not sit up straight.
 * On the brace the mound flattens and widens and the arms dig in: the same
 * tell the crouch is, said by a body that has one. The face is the shipped
 * one — nose, grin, eyes — and the figure's proportions are `VEER_CLOWN`'s,
 * read off `clownFigure`'s discs so the head sits where the palette draws it.
 */

/** The mound's half-width, in head radii, at rest and at full brace. */
const MOUND_W = 1.65;
const MOUND_W_BRACE = 2.0;
/** The mound's height above its foot, in head radii, at rest and braced. */
const MOUND_H = 1.35;
const MOUND_H_BRACE = 1.0;
/** How far down the flank each arm reaches, in head radii, and its width. */
const ARM_REACH = 1.9;
const ARM_W = 0.42;
/** How far the head sinks into the mound, as a share of its radius. */
const SINK = 0.35;
/** The stub hat's height, as a share of the shipped cone's. */
const STUB = 0.55;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function hunchedRider(v: VeerRider): void {
  const { ctx, f, r, brace } = v;
  const hr = f.head.r;
  // The rock's own centre, back-derived from the seat: `clownFigure` put the
  // shoulders `seatMul` radii above it, sunk by the crouch.
  const seat = f.ruff[Math.floor(f.ruff.length / 2)] ?? f.head;
  const cx = seat.x;
  const cy = seat.y + r * VEER_CLOWN.seatMul - r * VEER_CLOWN.crouchMul * brace;
  const foot = cy - r * 0.55;
  const w = hr * (MOUND_W + (MOUND_W_BRACE - MOUND_W) * brace);
  const h = hr * (MOUND_H + (MOUND_H_BRACE - MOUND_H) * brace);

  ctx.save();

  // The arms first, under everything: two thick strokes from the mound's
  // shoulders down the flanks of the stone, each ending in a mitt. They dig
  // in on the brace — reach further and press wider.
  const reach = hr * ARM_REACH * (1 + 0.25 * brace);
  ctx.lineCap = "round";
  ctx.lineWidth = hr * ARM_W * (1 + 0.15 * brace);
  for (const side of [-1, 1]) {
    const sx = cx + side * w * 0.8;
    const sy = foot + h * 0.15;
    const ex = cx + side * r * 0.92;
    const ey = foot + reach;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx + side * r * 1.05, foot + reach * 0.45, ex, ey);
    ctx.strokeStyle = PALETTE.rockDark;
    ctx.lineWidth = hr * ARM_W * (1 + 0.15 * brace) + STROKE.inner * 2;
    ctx.stroke();
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = hr * ARM_W * (1 + 0.15 * brace);
    ctx.stroke();
    // The mitt: a bead pressed flat to the stone.
    ball(ctx, { x: ex, y: ey, r: hr * 0.36 * (1 + 0.2 * brace) }, PALETTE.rock, PALETTE.rockDark);
  }

  // The mound: a half-ellipse standing on its foot, its base merged into the
  // rock — the foot is below the stone's crown, so the outline runs into the
  // rock's rather than resting on it. Lit as a ball by the same key.
  ctx.beginPath();
  ctx.ellipse(cx, foot, w, h, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(cx + w, foot + h * 0.35);
  ctx.lineTo(cx - w, foot + h * 0.35);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rock;
  ctx.fill();
  ctx.save();
  ctx.clip();
  litRound(ctx, cx, foot - h * 0.1, Math.max(w, h), LIGHT_HALF.rock);
  // A shadow under the chin, where the head sinks in.
  const chin = ctx.createRadialGradient(f.head.x, f.head.y, hr * 0.6, f.head.x, f.head.y, hr * 1.5);
  chin.addColorStop(0, rgba(SHADOW, 0.5));
  chin.addColorStop(1, rgba(SHADOW, 0));
  ctx.fillStyle = chin;
  ctx.fillRect(cx - w, foot - h, w * 2, h * 2);
  ctx.restore();
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  ctx.ellipse(cx, foot, w, h, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // The head, sunk: drawn at the figure's own place but lower, its chin in
  // the mound, and lit as a ball.
  const head = { x: f.head.x, y: f.head.y + hr * SINK, r: hr };
  ball(ctx, head, PALETTE.rock, PALETTE.rockDark);
  ctx.save();
  ctx.beginPath();
  ctx.arc(head.x, head.y, head.r, 0, Math.PI * 2);
  ctx.clip();
  litRound(ctx, head.x, head.y, head.r, LIGHT_HALF.rock);
  ctx.restore();

  // The stub hat: the shipped cone's base, a tip half as far up it. Leans
  // with the cone, because the corners are already turned.
  const [a, b, tip] = f.hat as [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ];
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const stub = { x: mid.x + (tip.x - mid.x) * STUB, y: mid.y + (tip.y - mid.y) * STUB };
  ctx.beginPath();
  ctx.moveTo(a.x, a.y + hr * SINK);
  ctx.lineTo(b.x, b.y + hr * SINK);
  ctx.lineTo(stub.x, stub.y + hr * SINK);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  ball(ctx, { x: stub.x, y: stub.y + hr * SINK, r: f.pompom.r }, PALETTE.text, PALETTE.rockDark);

  // The face, sunk with the head: the shipped one drawn on a figure whose
  // discs sit `SINK` lower.
  ctx.translate(0, hr * SINK);
  drawFace(v);
  ctx.restore();
  drawBrace(v);
}
