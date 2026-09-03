import { PALETTE } from "./palette.js";
import type { Arena } from "./snake-draw.js";
import { cavity, fang, tongue } from "./snake-mouth.js";
import { castShadow, clearShadow } from "./snake-skin.js";

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
  // are the same wedge mirrored, so one gradient over the snout serves both
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
 * Shut: one wedge, wider at the neck than at the snout, with the eyes set back
 * on the brow the way they are on the reference and a tongue out in front.
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
  jaw(ctx, arena, r, 0, 1, skin);
  jaw(ctx, arena, r, 0, -1, skin);
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
  jaw(ctx, arena, r, swing, 1, skin);
  jaw(ctx, arena, r, swing, -1, skin);
  fang(ctx, r, swing, 1);
  fang(ctx, r, swing, -1);
  eyes(ctx, r, swing);
}

/**
 * One jaw: half a wedge, hinged at the neck. `side` is -1 for the upper and 1
 * for the lower, which on a canvas whose y runs down is which.
 */
function jaw(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  r: number,
  swing: number,
  side: number,
  skin: CanvasGradient,
): void {
  ctx.save();
  ctx.translate(-r * 0.45, 0);
  ctx.rotate(swing * side);
  // A neck as wide as the body, a cheek that falls away from it, and a snout
  // that comes to a curve rather than to a flat.
  //
  // The width is the part that was actually wrong rather than merely plain:
  // the neck was `r * 0.52` against a body of `tile * 0.4`, so the shoulders
  // stood out either side of the head and the blunt end the body is capped
  // with was drawn in the open. A head narrower than its own neck is a defect,
  // and the two numbers are the same number now.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, side * r * 0.92);
  ctx.quadraticCurveTo(r * 0.72, side * r * 0.82, r * 1.3, side * r * 0.26);
  ctx.quadraticCurveTo(r * 1.6, side * r * 0.12, r * 1.5, 0);
  ctx.closePath();
  castShadow(ctx, arena);
  ctx.fillStyle = skin;
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  // One specular, along the brow where the light this file puts above the
  // arena would catch it. Clipped to the jaw so a wide gape cannot slide it
  // off the snout.
  ctx.clip();
  ctx.fillStyle = "rgba(244,231,255,.12)";
  ctx.beginPath();
  ctx.ellipse(r * 0.72, side * r * 0.5, r * 0.44, r * 0.12, 0, 0, Math.PI * 2);
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
    ctx.ellipse(r * 0.74, side * r * 0.5, r * 0.16, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1A0A2E";
    ctx.beginPath();
    ctx.ellipse(r * 0.76, side * r * 0.5, r * 0.055, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
