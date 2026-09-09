import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * SEDIMENT — something heavy has settled in the bottom of each sac.
 *
 * The four other answers fill the whole of a sac. This one fills the bottom of
 * it and leaves the top clear, and that asymmetry is the whole idea: a body
 * with a level in it reads as a *container of liquid*, which is a thing a
 * player understands without being told, and it is the only one of the five
 * that says which way up the creature is.
 *
 * **The level is a chord, not a line across the body.** It is drawn as an
 * ellipse arc at the latitude the grains stop, so it foreshortens with the sac
 * and reads as the top of a volume rather than as a stripe painted on a
 * surface. That is the difference between a meniscus and a waterline sticker.
 *
 * **The grains do not move and the level does.** Sediment that jittered would
 * be a body in a shaker; a level that tilts a little on the contour clock is a
 * body that is falling. It is the smallest motion of the five on purpose.
 */

const SACS = [-0.42, 0.42];
const GRAINS = 8;
/** Where the level sits, and how far it tilts on the clock. */
const LEVEL = -0.18;
const TILT = 0.1;
const GRAIN = 0.22;
const SPIN = 0.3;
const DIM = 0.32;
const REACH = 0.56;

const PINS: Pin[] = [];
for (let i = 0; i < GRAINS; i++) {
  // Everything below the level, packed toward the floor rather than spread
  // evenly: a settled thing is denser at the bottom.
  const s = i / (GRAINS - 1);
  PINS.push(pin(i * 2.39, LEVEL - 0.05 - s * s * 0.7, 1));
}

export function sediment(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = p.ry * REACH;
  const grit = p.rim;
  const level = LEVEL + Math.sin(p.t * 0.8) * TILT;

  ctx.save();
  ctx.rotate(-p.rot);
  for (const side of SACS) {
    const cx = p.rx * side;
    for (const q of PINS) {
      const f = facet(q, theta + side);
      if (!f.near) continue;
      ctx.save();
      ctx.translate(cx + f.x * reach, f.y * reach);
      ctx.scale(Math.max(0.08, f.sx), 1);
      ctx.fillStyle = mixHex(p.hex, grit, surfaceDim(DIM, f.lit));
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.5, reach * GRAIN * Math.max(0.2, f.sy)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // The meniscus: the circle of latitude the grains stop at, drawn as the
    // ellipse it projects to. `cos(lat)` across and `sin(lat)` down are the two
    // numbers a `Pin` already holds, so the level is the surface's own
    // arithmetic rather than a second copy of it.
    const lip = pin(0, level, reach);
    ctx.strokeStyle = mixHex(p.hex, p.rim, 0.75);
    ctx.lineWidth = Math.max(0.5, reach * 0.05);
    ctx.beginPath();
    ctx.ellipse(cx, lip.cy, Math.max(0.5, lip.k), Math.max(0.5, lip.k * 0.26), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
