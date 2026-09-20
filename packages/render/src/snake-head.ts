import { PALETTE } from "./palette.js";
import type { Arena } from "./snake-draw.js";
import { drawJaws } from "./snake-jaw.js";
import { cavity, fang, tongue } from "./snake-mouth.js";

/**
 * The head, shut and open.
 *
 * Shut it is a skull with two eyes and a tongue that flicks on its own. Open
 * it is the same skull **hinged apart** — an upper jaw and a lower jaw swung
 * about the neck, with the cavity between them and a fang on each — which is
 * the picture the owner sent and, more usefully, the one thing a shape the
 * size of a tile can say clearly at a glance.
 *
 * **It was a wedge until 20 September 2026**, and a wedge from above is a
 * triangle. What one is shaped like now is `snake-jaw.ts`; what is left here
 * is the head as a thing — shut or open, how wide, where its eyes are.
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
 *
 * **There is no red left in it at all.** The throat was the reference's, and
 * at this size a red field between two violet jaws did not read as a throat —
 * it read as something held in the mouth. An open mouth is a *hole*, so it is
 * drawn as one, and what tells the pair the mouth is open is the tongue coming
 * out of it.
 *
 * **The tongue flicks**, and its phase is `flick` — a number the caller
 * derives from `world.tick` (`snake-round.ts`). Nothing is stored for it: two
 * devices on the same tick are at the same point of the same dart, and a
 * restart begins the cycle again because the tick it is read off begins again.
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
  flick: number,
): void {
  const a = Math.atan2(dirRow, dirCol);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(a);
  const r = arena.tile * 0.46;
  // The head's own light, once per head rather than once per jaw: the two jaws
  // are the same skull mirrored, so one gradient over the snout serves both
  // and the pair reads as one solid thing rather than two lit separately. It
  // is built in the head's own turned coordinates, which is why it cannot be
  // cached the way the arena's is — a gradient bakes the transform it was made
  // under, and this one turns with the body.
  const skin = ctx.createRadialGradient(r * 0.5, 0, r * 0.1, r * 0.5, 0, r * 1.4);
  skin.addColorStop(0, "#4A2288");
  skin.addColorStop(0.6, "#2A1150");
  skin.addColorStop(1, "#170A2E");
  if (gape > 0.02) drawOpen(ctx, arena, r, Math.max(0, Math.min(1, gape)), skin, flick);
  else drawShut(ctx, arena, r, skin, flick);
  ctx.restore();
}

/**
 * Shut: two jaws lying against each other, with the eyes set back on the gland
 * the way they are on the reference and a tongue out in front.
 * Drawn in the hull's violet — the head is the part of the ship that is
 * steering.
 */
function drawShut(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  r: number,
  skin: CanvasGradient,
  flick: number,
): void {
  tongue(ctx, r, r * 0.95, flick);
  drawJaws(ctx, arena, r, 0, skin);
  // A join down the middle, so the two halves read as a mouth that could open
  // rather than as one lump.
  ctx.strokeStyle = "rgba(244,231,255,.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Both ends inside the skull. The jaws are hinged at `-r * 0.45` and reach
  // `r * 1.47` from there, so a lip drawn in the head's own coordinates has
  // about `r` in front of the middle to work with and no more — measured out
  // to `r * 1.4` it came out of the back of the head at one end and hung off
  // the snout at the other, as a grey line lying across the picture.
  ctx.moveTo(-r * 0.38, 0);
  ctx.lineTo(r * 0.94, 0);
  ctx.stroke();
  eyes(ctx, r, 0);
}

/** Open: the same two jaws, swung apart about the neck, cavity between. */
function drawOpen(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  r: number,
  gape: number,
  skin: CanvasGradient,
  flick: number,
): void {
  const swing = GAPE_ANGLE * gape;
  cavity(ctx, r, swing);
  // Out of the mouth rather than out of a shut snout, so it starts at the
  // hinge and is drawn before the jaws — whatever of it is behind a jaw is
  // covered by that jaw, which is what puts it *in* the mouth.
  tongue(ctx, r, -r * 0.3, flick);
  drawJaws(ctx, arena, r, swing, skin);
  fang(ctx, r, swing, 1);
  fang(ctx, r, swing, -1);
  eyes(ctx, r, swing);
}

/**
 * Two eyes on the gland, riding whichever jaw they are set into.
 *
 * Three ellipses and they are in this order for a reason: a socket, the iris
 * in it, the slit in that. Without the socket the pale iris was a disc lying
 * *on* the skin — at tile size it read as a screw head — and what puts an eye
 * into a face is the dark the skin makes round it.
 */
function eyes(ctx: CanvasRenderingContext2D, r: number, swing: number): void {
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(-r * 0.45, 0);
    ctx.rotate(swing * side);
    ctx.fillStyle = "rgba(9,5,20,.85)";
    ctx.beginPath();
    ctx.ellipse(r * 0.8, side * r * 0.57, r * 0.2, r * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.hullRim;
    ctx.beginPath();
    ctx.ellipse(r * 0.81, side * r * 0.57, r * 0.15, r * 0.115, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#12061F";
    ctx.beginPath();
    ctx.ellipse(r * 0.83, side * r * 0.57, r * 0.05, r * 0.105, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
