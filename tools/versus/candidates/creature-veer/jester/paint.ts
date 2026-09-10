import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { VeerRider } from "../../../../../packages/render/src/veer-look.js";
import { ball, drawBrace, drawFace } from "../../../../../packages/render/src/veer-rider.js";

/**
 * JESTER — a two-horned hood in place of the cone, with bells that swing.
 *
 * The shipped clown is a triangle over a circle, and at arm's length that is
 * all it is: a cone, which is also what a mountain, a tent and THE DART's
 * jet are. A jester's hood is the other clown silhouette — two horns curving
 * out and up from the crown, a bell on each tip — and it is the one that
 * cannot be mistaken for a shape the field already has. The bells are the
 * moving part: they hang off the horn tips and swing with the sway the stone
 * already gives the rider, and on the brace they whip out to the side, so
 * the crouch reads off the hood as well as off the body. The ruff is a row of
 * hanging points along the shoulder rather than beads, because a jester's
 * collar has points. The head, the face and where everything sits are
 * `clownFigure`'s, so the hood grows from the same crown the cone did.
 *
 * Nothing here points a way. Both horns swing together and the whip is
 * symmetric, because which way the rock is about to step is player one's
 * alone (`veer-marks.ts`).
 */

/** The horns: how far out and up each reaches from the crown, in head radii,
 * and how far the tip droops out and down past that. Wide and low on
 * purpose — horns that go up read as ears, and a jester's hood is a V. */
const HORN_OUT = 2.0;
const HORN_UP = 0.95;
const HORN_DROOP = 0.4;
/** The horn's width at the base, in head radii. */
const HORN_W = 0.62;
/** A bell's radius, in head radii, and how far it swings, in radians. */
const BELL = 0.26;
const SWING = 0.55;
/** How far the whip throws the bells out on a brace, in bell swings. */
const WHIP = 1.6;
/** Points on the collar: how many either side of the middle, and how deep. */
const POINT_SIDE = 2;
const POINT_DROP = 0.55;

export function jesterRider(v: VeerRider): void {
  const { ctx, f, sway, brace, time } = v;
  const hr = f.head.r;
  const head = f.head;
  ctx.save();

  // The collar: points hanging from the shoulder line, in place of beads.
  // Each is a small triangle from the seat down, spaced as the beads were.
  const seat = f.ruff[Math.floor(f.ruff.length / 2)] ?? head;
  const step = (f.ruff[1]?.x ?? seat.x + hr) - (f.ruff[0]?.x ?? seat.x);
  ctx.beginPath();
  for (let k = -POINT_SIDE; k <= POINT_SIDE; k++) {
    const x = seat.x + k * step;
    const y = seat.y - hr * 0.1;
    ctx.moveTo(x - step * 0.5, y);
    ctx.lineTo(x + step * 0.5, y);
    ctx.lineTo(x, y + hr * POINT_DROP * (1 + 0.3 * brace));
    ctx.closePath();
  }
  ctx.fillStyle = PALETTE.rock;
  ctx.fill();
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = STROKE.inner;
  ctx.lineJoin = "round";
  ctx.stroke();

  // The head.
  ball(ctx, head, PALETTE.rock, PALETTE.rockDark);

  // The hood: two horns off the crown, each a curved wedge from a base on
  // the head's top to a tip out and up, curling back over at the end. The
  // hood's cap covers the crown so the horns grow from cloth, not bone.
  const crown = { x: head.x, y: head.y - hr * 0.55 };
  ctx.beginPath();
  ctx.arc(head.x, head.y, hr * 1.02, Math.PI * 1.08, Math.PI * 1.92);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill();
  // The swing: the sway carries both bells the same way; the brace whips
  // both out to the sides. Neither says a direction.
  const swing = sway * 6 * SWING;
  const whip = brace * WHIP;
  const tips: { x: number; y: number }[] = [];
  for (const side of [-1, 1]) {
    const bx = crown.x + side * hr * 0.45;
    const by = crown.y + hr * 0.15;
    const out = hr * HORN_OUT * (1 + 0.35 * whip);
    const up = hr * HORN_UP * (1 - 0.25 * whip);
    const tx = bx + side * out + swing * hr * 0.3;
    const ty = by - up;
    // The droop: the tip carries on out and turns down, so the horn reads
    // as cloth hanging off its own weight rather than a spike.
    const cx = tx + side * hr * HORN_DROOP;
    const cy = ty + hr * HORN_DROOP * 0.9;
    ctx.beginPath();
    ctx.moveTo(bx - side * hr * HORN_W * 0.5, by);
    ctx.quadraticCurveTo(bx + side * out * 0.3, by - up * 1.4, cx, cy);
    ctx.quadraticCurveTo(bx + side * out * 0.7, by - up * 0.2, bx + side * hr * HORN_W * 0.5, by);
    ctx.closePath();
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fill();
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = STROKE.outline;
    ctx.stroke();
    tips.push({ x: cx, y: cy });
  }
  // The bells: one on each tip, hanging, swung by the sway and thrown by the
  // whip. Bright, because a bell is the one part of a jester that catches
  // light — and they are the pompom's own colour, so the figure keeps one
  // pale mark where the cone had one.
  const hang = hr * BELL * 1.4;
  const angle = Math.sin(time * 5.2) * SWING * (0.4 + 0.6 * Math.abs(sway) * 12) + swing;
  for (const [i, tip] of tips.entries()) {
    const side = i === 0 ? -1 : 1;
    const a = angle + side * whip * 0.9;
    const bxx = tip.x + Math.sin(a) * hang;
    const byy = tip.y + Math.cos(a) * hang;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(bxx, byy);
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = STROKE.inner;
    ctx.stroke();
    ball(ctx, { x: bxx, y: byy, r: hr * BELL }, PALETTE.text, PALETTE.rockDark);
  }

  drawFace(v);
  ctx.restore();
  drawBrace(v);
}
