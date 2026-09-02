import { PALETTE } from "./palette.js";
import type { Arena } from "./snake-draw.js";

/**
 * The head, shut and open.
 *
 * Shut it is a wedge with two eyes and a tongue that flicks on its own. Open
 * it is the same wedge **hinged apart** — an upper jaw and a lower jaw swung
 * about the neck, with the cavity between them and a fang on each — which is
 * the picture the owner sent and, more usefully, the one thing a shape the
 * size of a tile can say clearly at a glance.
 *
 * **The gape is a number the caller hands in**, 0 shut to 1 wide. It is
 * derived from the world's own mouth window (`snake-round.ts`), so the mouth
 * opening *is* the thing that decides whether a point can be taken rather than
 * a flourish drawn beside it — what the player sees and what the simulation
 * checks are the same fact.
 *
 * The cavity is drawn **inside the jaws and nowhere else**: the owner's one
 * note on the reference was to lose the round red field behind the head, which
 * was bigger than the mouth and read as a glow rather than as a throat.
 */

/** How far each jaw swings at a full gape, in radians. */
const GAPE_ANGLE = 0.62;

export function drawSnakeHead(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  at: { x: number; y: number },
  dirCol: number,
  dirRow: number,
  gape: number,
): void {
  const a = Math.atan2(dirRow, dirCol);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(a);
  const r = arena.tile * 0.46;
  if (gape > 0.02) drawOpen(ctx, r, Math.max(0, Math.min(1, gape)));
  else drawShut(ctx, r);
  ctx.restore();
}

/**
 * Shut: one wedge, wider at the neck than at the snout, with the eyes set back
 * on the brow the way they are on the reference and a tongue out in front.
 * Drawn in the hull's violet — the head is the part of the ship that is
 * steering.
 */
function drawShut(ctx: CanvasRenderingContext2D, r: number): void {
  tongue(ctx, r, 1);
  jaw(ctx, r, 0, 1);
  jaw(ctx, r, 0, -1);
  // A join down the middle, so the two halves read as a mouth that could open
  // rather than as one lump.
  ctx.strokeStyle = "rgba(244,231,255,.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, 0);
  ctx.lineTo(r * 0.92, 0);
  ctx.stroke();
  eyes(ctx, r, 0);
}

/** Open: the same two jaws, swung apart about the neck, cavity between. */
function drawOpen(ctx: CanvasRenderingContext2D, r: number, gape: number): void {
  const swing = GAPE_ANGLE * gape;
  cavity(ctx, r, swing);
  jaw(ctx, r, swing, 1);
  jaw(ctx, r, swing, -1);
  fang(ctx, r, swing, 1);
  fang(ctx, r, swing, -1);
  eyes(ctx, r, swing);
}

/**
 * One jaw: half a wedge, hinged at the neck. `side` is -1 for the upper and 1
 * for the lower, which on a canvas whose y runs down is which.
 */
function jaw(ctx: CanvasRenderingContext2D, r: number, swing: number, side: number): void {
  ctx.save();
  ctx.translate(-r * 0.45, 0);
  ctx.rotate(swing * side);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, side * r * 0.52);
  ctx.quadraticCurveTo(r * 0.85, side * r * 0.6, r * 1.4, side * r * 0.16);
  ctx.quadraticCurveTo(r * 1.5, 0, r * 1.4, 0);
  ctx.closePath();
  ctx.fillStyle = "#2A1150";
  ctx.fill();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

/**
 * The throat, between the jaws and no wider than they are. Two triangles
 * meeting at the hinge, so nothing of it is ever drawn outside the mouth.
 */
function cavity(ctx: CanvasRenderingContext2D, r: number, swing: number): void {
  const reach = r * 1.35;
  const open = Math.sin(swing) * reach;
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, 0);
  ctx.lineTo(reach * 0.9, -open);
  ctx.lineTo(reach, 0);
  ctx.lineTo(reach * 0.9, open);
  ctx.closePath();
  ctx.fillStyle = "#54061F";
  ctx.fill();
  // The glottis, which is the one detail that says throat rather than gap.
  ctx.fillStyle = "#2A030B";
  ctx.beginPath();
  ctx.ellipse(r * 0.15, 0, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** One fang, on the jaw it belongs to and swinging with it. */
function fang(ctx: CanvasRenderingContext2D, r: number, swing: number, side: number): void {
  ctx.save();
  ctx.translate(-r * 0.45, 0);
  ctx.rotate(swing * side);
  ctx.beginPath();
  ctx.moveTo(r * 1.0, side * r * 0.42);
  ctx.lineTo(r * 1.18, side * r * 0.42);
  ctx.lineTo(r * 1.02, side * r * 0.02);
  ctx.closePath();
  ctx.fillStyle = PALETTE.hullRim;
  ctx.fill();
  ctx.restore();
}

/** Two eyes on the brow, riding whichever jaw they are set into. */
function eyes(ctx: CanvasRenderingContext2D, r: number, swing: number): void {
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(-r * 0.45, 0);
    ctx.rotate(swing * side);
    ctx.fillStyle = PALETTE.hullRim;
    ctx.beginPath();
    ctx.ellipse(r * 0.78, side * r * 0.34, r * 0.15, r * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1A0A2E";
    ctx.beginPath();
    ctx.ellipse(r * 0.8, side * r * 0.34, r * 0.05, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * The tongue, out in front while the mouth is shut. Drawn from the head's own
 * geometry and nothing else — no clock, no stored phase — so it is the same on
 * both devices and survives a restart by never having existed.
 */
function tongue(ctx: CanvasRenderingContext2D, r: number, out: number): void {
  const tip = r * (1.05 + 0.5 * out);
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(r * 0.9, 0);
  ctx.lineTo(tip, 0);
  ctx.moveTo(tip, 0);
  ctx.lineTo(tip + r * 0.22, -r * 0.16);
  ctx.moveTo(tip, 0);
  ctx.lineTo(tip + r * 0.22, r * 0.16);
  ctx.stroke();
  ctx.lineCap = "butt";
}
