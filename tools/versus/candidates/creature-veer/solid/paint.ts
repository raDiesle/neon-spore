import { KEY, LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { VeerRider } from "../../../../../packages/render/src/veer-look.js";
import { drawBrace, drawFace } from "../../../../../packages/render/src/veer-rider.js";

/**
 * SOLID — the same clown, lit as a thing with a round side.
 *
 * Every disc the shipped rider is made of is a flat fill with an outline, so
 * the head, the beads and the pompom are circles drawn beside a rock the key
 * light already models as a ball. This puts the same light on them: the head
 * and every bead of the ruff take `litRound` under the field's own key, the
 * cone is split down its axis into a lit face and a shadow face, the pompom is
 * a lit bead, and a contact shadow sits under the ruff where the figure meets
 * the stone — the one mark that says *on* rather than *beside*. Nothing about
 * where anything sits changes: the figure is `clownFigure`'s, and this is the
 * argument `.claude/skills/depth` makes for a big body, applied to the second
 * biggest thing on this rock.
 */

/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";
/** How far the contact shadow spreads under the ruff, in head radii. */
const CONTACT = 1.9;

/** A disc lit by the key: the fill, the light over it, and the outline. */
function litBall(
  ctx: CanvasRenderingContext2D,
  d: { x: number; y: number; r: number },
  fill: string,
  line: string,
): void {
  ctx.beginPath();
  ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.save();
  ctx.clip();
  litRound(ctx, d.x, d.y, d.r, LIGHT_HALF.rock);
  ctx.restore();
  ctx.strokeStyle = line;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
}

export function solidRider(v: VeerRider): void {
  const { ctx, f, brace } = v;
  ctx.save();

  // The contact shadow, first: a soft dark pool on the stone under the
  // shoulders, drawn before the ruff so the beads sit in it. Deeper while the
  // rider braces, because a body pressing down casts more.
  const seat = f.ruff[Math.floor(f.ruff.length / 2)] ?? f.head;
  const hr = f.head.r;
  const pool = ctx.createRadialGradient(seat.x, seat.y, 0, seat.x, seat.y, hr * CONTACT);
  pool.addColorStop(0, rgba(SHADOW, 0.55 + 0.25 * brace));
  pool.addColorStop(1, rgba(SHADOW, 0));
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(seat.x, seat.y + hr * 0.2, hr * CONTACT, hr * CONTACT * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const bead of f.ruff) litBall(ctx, bead, PALETTE.rock, PALETTE.rockDark);
  litBall(ctx, f.head, PALETTE.rock, PALETTE.rockDark);

  // The cone: two faces along its axis. The base corners are `hat[0]` and
  // `hat[1]`, the tip is `hat[2]`; the axis runs from the middle of the base
  // to the tip, and whichever face is toward the key is the lit one — read
  // off the sign of the base's direction against `KEY`, so the lit face
  // swaps when the hat whips over in the crouch.
  const [a, b, tip] = f.hat as [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ];
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const toward = (a.x - b.x) * KEY.x + (a.y - b.y) * KEY.y > 0;
  const lit = toward ? a : b;
  const dark = toward ? b : a;
  ctx.beginPath();
  ctx.moveTo(lit.x, lit.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.lineTo(mid.x, mid.y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rock;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(dark.x, dark.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.lineTo(mid.x, mid.y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.closePath();
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  litBall(ctx, f.pompom, PALETTE.text, PALETTE.rockDark);

  drawFace(v);
  ctx.restore();
  drawBrace(v);
}
