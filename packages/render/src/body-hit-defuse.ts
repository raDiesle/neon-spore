import type { Strike } from "./body-hit.js";
import { mixHex, rgba } from "./hex.js";

/**
 * DEFUSE — THE MINE's, and the one kill in this game that is not a kill.
 *
 * Every other strike here is a body coming apart: it pops, it shatters, it
 * scatters, it splashes. A mine that a finger found did not go off — that is
 * the entire creature, and a burst would say the opposite of what happened. A
 * pair that saw an explosion would learn that finding one and being one tile
 * out look the same, and being one tile out is the wave.
 *
 * So it **goes out**. The four arms let go and swing back flat against the
 * body, the ring of light that was the fuse snaps shut to a point at the
 * middle, and what is left is a dark disc with a cold rim that fades where it
 * stood. Nothing is thrown, nothing falls to the ship, nothing reaches past
 * the contour the body had — the field beyond the square the pair named is
 * exactly as it was, which is the picture of a thing that was made safe.
 *
 * The outline is the body's own (`Strike.outline`), drawn collapsing inward
 * rather than swelling out: `pop` next door swells because a case let go of a
 * volume, and this contracts because nothing was ever released.
 *
 * **How it can lose.** A kill with no burst in it is a kill a pair may not
 * notice, and on a wave where the other seat is also hunting a tile the seat
 * that found one has half a second of picture to say so with. If at 26 px a
 * body going quietly dark reads as a body that is simply still there, this
 * loses — and the honest repair would be the ring snapping shut *brighter*
 * before it goes, which is a flash and is the thing being argued against.
 */

/** The share of the strike the collapse takes. The rest is the afterglow
 * standing where the body was, which is what makes it read as *gone* rather
 * than as a frame that was dropped. */
const SHUT_AT = 0.45;

/** How far in the contour is pulled by the time it is shut, as a share. */
const PULL = 0.72;

export function defuse(ctx: CanvasRenderingContext2D, s: Strike): void {
  const k = Math.min(1, s.age / s.life);
  const r = Math.max(s.rx, s.ry);
  const shut = Math.min(1, k / SHUT_AT);
  // Eased so the first frames move most: a fuse being cut is sudden at the
  // cut and slow afterwards, which is the opposite of a fall.
  const pull = 1 - PULL * (1 - (1 - shut) * (1 - shut));

  // The contour, contracting. Drawn as a line rather than filled: a filled
  // disc shrinking is a body getting smaller, and a ring closing is a body
  // letting go.
  if (s.outline.length > 1) {
    ctx.beginPath();
    for (const [i, p] of s.outline.entries()) {
      const q = p as { x: number; y: number };
      if (i === 0) ctx.moveTo(q.x * pull, q.y * pull);
      else ctx.lineTo(q.x * pull, q.y * pull);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(mixHex(s.hex, s.rim, 0.4), 0.9 * (1 - shut));
    ctx.lineWidth = Math.max(1, r * 0.16 * (1 - 0.5 * shut));
    ctx.stroke();
  }

  // The fuse's last light, snapping shut to a point. It never gets brighter
  // than the ring it came from — see the losing case above.
  const ring = r * 1.7 * (1 - shut);
  if (shut < 1) {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, ring), 0, Math.PI * 2);
    ctx.strokeStyle = rgba(s.rim, 0.55 * (1 - shut));
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.stroke();
  }

  // And the cold disc it leaves, fading where it stood. The one thing drawn
  // after the collapse, and it is drawn *under* nothing: a square that has
  // been made safe is a square with something faint on it for a moment, so
  // that the seat that pressed it can see which press was the one.
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.2);
  g.addColorStop(0, rgba(s.hex, 0.35 * (1 - k)));
  g.addColorStop(1, rgba(s.hex, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
  ctx.fill();
}
