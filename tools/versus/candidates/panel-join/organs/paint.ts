import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import { rgba } from "../../../../../packages/render/src/hex.js";

/**
 * The paint ORGANS is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls.
 *
 * Everything here is drawn inside the chamber's own clip, so nothing can reach
 * up past the roof or down past the bottom of the panel; and everything is a
 * pure function of `time`, which is what makes it restart-safe by construction
 * rather than by remembering to clear anything (`restart.test.ts`).
 *
 * **Every colour is the seat's own.** The trunk is the ship's flesh and its
 * edge is the ship's rim, so player two's panel grows player two's organs — a
 * violet stalk on a golden hull is the one mark that would say the two halves
 * were built at different times (`seat-skin.ts`).
 */

/** How wide a trunk is where it leaves the membrane, at its waist, and where it
 * meets the button — all as shares of the button's own radius.
 *
 * Wide at both ends and pinched between them, which is the shape a thing grown
 * out of a surface has and a tube hung off one does not. The foot is wider than
 * the socket's lip so the button reads as the swollen end of the trunk rather
 * than as something the trunk is pointing at. */
const SHOULDER = 1.55;
const WAIST = 0.44;
const FOOT = 1.22;

/** How far a trunk sways, as a share of the button's radius, and how slowly.
 * Small and slow: five stalks swinging is a hanging garden, and what this is
 * arguing is that the panel is one body. */
const SWAY = 0.14;
const SWAY_RATE = 0.55;

/** How far the swelling at the top of a trunk spreads either side of it, in the
 * same shares. It is what says the membrane *grew* the organ rather than
 * sprouted it: a stalk meeting a flat roof at a point is a stalk glued on. */
const SPREAD = 2.3;

/**
 * ORGANS: every control is the swollen end of something the membrane grew.
 *
 * One path for every trunk on the panel, filled once and stroked once — the
 * bargain `band-slime.ts` makes for its pendants and for the same reason: five
 * organs drawn one at a time would be five paths, five fills and five strokes
 * of a frame's budget for a thing nobody looks straight at.
 *
 * The shipped feeder it replaces is one bezier per control at a pixel and a
 * half, which says *this button is fed by the ship*. This says something
 * stronger and is offered against it: the button **is** the ship, tapering back
 * up into the roof it came out of.
 */
export function grown(d: BandAttach): void {
  const { ctx, l, lobes, time, skin } = d;
  if (lobes.length === 0) return;

  const body = new Path2D();
  let deepest = l.bandTop;
  let highest = l.bandTop + l.bandHeight;
  for (const [i, c] of lobes.entries()) {
    const top = d.ceilingY(c.x);
    // Where the trunk hands over to the button: a little inside the socket, so
    // the two overlap rather than meet. Parts of one body merge into one mass.
    const foot = c.y - c.r * 0.5;
    const sway = Math.sin(time * SWAY_RATE + i * 1.9) * c.r * SWAY;
    trunk(body, c.x, top, foot, c.r, sway);
    deepest = Math.max(deepest, foot);
    highest = Math.min(highest, top);
  }

  // The flesh: brightest where it leaves the membrane and going to the seat's
  // own tint as it reaches the button, so the light in this chamber still comes
  // from above (`band-seam.ts`'s spill).
  const grad = ctx.createLinearGradient(0, highest, 0, deepest);
  grad.addColorStop(0, rgba(skin.flesh[0], 0.5));
  grad.addColorStop(0.45, rgba(skin.flesh[1], 0.38));
  grad.addColorStop(1, rgba(skin.tint, 0.3));
  ctx.fillStyle = grad;
  ctx.fill(body);
  ctx.strokeStyle = rgba(skin.rim, 0.16);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.026);
  ctx.stroke(body);
}

/**
 * One trunk, from the membrane down to a button.
 *
 * It starts as a wide shoulder *along* the roof rather than at a point on it —
 * the membrane bulging where the organ leaves it — pinches to a waist, and
 * flares back out into the button. Both sides are one continuous curve, so the
 * silhouette has no corner anywhere in it.
 */
function trunk(path: Path2D, x: number, top: number, foot: number, r: number, sway: number): void {
  const drop = Math.max(1, foot - top);
  const shoulder = r * SHOULDER;
  const waist = r * WAIST;
  const flare = r * FOOT;
  const mid = top + drop * 0.52;
  const spread = r * SPREAD;

  // Up the left side: out along the roof, in to the waist, out to the foot.
  path.moveTo(x - spread, top - 1);
  path.bezierCurveTo(
    x - shoulder,
    top + drop * 0.06,
    x - waist + sway,
    top + drop * 0.28,
    x - waist + sway,
    mid,
  );
  path.bezierCurveTo(x - flare, foot - drop * 0.16, x - flare, foot, x, foot + r * 0.2);
  // And back up the right.
  path.bezierCurveTo(x + flare, foot, x + flare, foot - drop * 0.16, x + waist + sway, mid);
  path.bezierCurveTo(
    x + waist + sway,
    top + drop * 0.28,
    x + shoulder,
    top + drop * 0.06,
    x + spread,
    top - 1,
  );
  path.closePath();
}
