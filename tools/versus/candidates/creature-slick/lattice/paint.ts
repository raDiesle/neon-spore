import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * LATTICE — a rigid frame inside a soft body.
 *
 * ROE and GUT both say the slick is wet all the way through. This says it is
 * not: there is a skeleton in there, six struts meeting at a hub, and the
 * membrane is stretched over it. It is the answer that changes what the
 * creature *is* rather than what it contains — a seed pod rather than an
 * animal — and it is here because five answers that all agree about the
 * material are one answer offered five times.
 *
 * **Straight lines are what a lattice is, and they are the risk.** Everything
 * else on this field is a closed contour with lobes; a set of chords is the one
 * shape that could read as a different game. That is the thing to look at.
 *
 * **Placed, not posed.** Each vertex is a pin and each strut is drawn between
 * two facets, so a strut going round the back shortens and disappears at the
 * limb rather than shrinking uniformly. The hub is drawn last, over them.
 */

const SACS = [-0.42, 0.42];
const SPOKES = 6;
/** How far out the vertices sit, and how thick a strut is, against the reach. */
const RIB = 0.24;
const SPIN = 0.4;
const DIM = 0.38;
const REACH = 0.54;

const PINS: Pin[] = [];
for (let i = 0; i < SPOKES; i++) {
  // Alternating high and low, so the frame is a solid rather than a wheel: a
  // ring of one latitude is the shape `surface.ts` says folds to a line.
  PINS.push(pin((i / SPOKES) * Math.PI * 2, i % 2 === 0 ? 0.6 : -0.6, 1));
}

export function lattice(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = p.ry * REACH;
  const strut = p.rim;

  ctx.save();
  ctx.rotate(-p.rot);
  ctx.lineCap = "round";
  for (const side of SACS) {
    const cx = p.rx * side;
    const seen = PINS.map((q) => facet(q, theta + side));
    for (let i = 0; i < seen.length; i++) {
      const a = seen[i];
      const b = seen[(i + 1) % seen.length];
      if (!a || !b) continue;
      // A strut with one end behind the body is drawn to the hub instead of to
      // its partner: half a chord is a line that stops in mid-air, and the hub
      // is where it would have gone.
      const lit = surfaceDim(DIM, (a.lit + b.lit) / 2);
      ctx.strokeStyle = mixHex(p.hex, strut, lit);
      ctx.lineWidth = Math.max(0.5, reach * RIB * 0.45);
      ctx.beginPath();
      ctx.moveTo(cx + a.x * reach, a.y * reach);
      if (a.near && b.near) ctx.lineTo(cx + b.x * reach, b.y * reach);
      else ctx.lineTo(cx, 0);
      ctx.stroke();
      if (!a.near) continue;
      ctx.fillStyle = mixHex(p.hex, strut, surfaceDim(DIM, a.lit));
      ctx.beginPath();
      ctx.arc(cx + a.x * reach, a.y * reach, Math.max(0.5, reach * RIB * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = p.rim;
    ctx.beginPath();
    ctx.arc(cx, 0, Math.max(0.5, reach * RIB * 0.7), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
