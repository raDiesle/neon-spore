import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * BLOOM — a nucleus that sends something out along its veins.
 *
 * The other four answers on this page are all *structure*: what the body is
 * made of and how it is put together. This one is about **state**. Nine veins
 * run out from a core in each sac, and a bright travels along them, out from
 * the middle and away, over and over. A slick on the field stops being an
 * object and starts being a thing that is doing something.
 *
 * **The travelling light is a share of the vein's own length**, so it
 * foreshortens with the vein: a vein pointing away is short, and the bright on
 * it moves a short distance. That is what keeps it from reading as a marquee.
 *
 * **The pulse is on the contour clock**, which is deterministic per body id, so
 * two devices flash the same creature at the same moment. A wall clock here
 * would be a body that pulsed differently on the two phones, which is exactly
 * the class of thing the pair would talk about and be wrong about.
 */

const SACS = [-0.42, 0.42];
const VEINS = 9;
/** How long the travelling bright is, as a share of a vein, and how fast it goes. */
const BEAD = 0.3;
const RATE = 1.1;
const SPIN = 0.35;
const DIM = 0.24;
const REACH = 0.56;
/** How thick a vein is against the reach, and how much brighter the bead is. */
const VEIN = 0.1;
const BEAD_LIFT = 0.9;

const PINS: Pin[] = [];
for (let i = 0; i < VEINS; i++) {
  const lon = i * 2.39;
  const lat = ((i / (VEINS - 1)) * 2 - 1) * 0.75;
  PINS.push(pin(lon, lat, 1));
}

export function bloom(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = p.ry * REACH;
  const vein = mixHex(p.hex, p.rim, 0.35);

  ctx.save();
  ctx.rotate(-p.rot);
  ctx.lineCap = "round";
  for (const side of SACS) {
    const cx = p.rx * side;
    for (const [i, q] of PINS.entries()) {
      const f = facet(q, theta + side);
      if (!f.near) continue;
      const tipX = cx + f.x * reach;
      const tipY = f.y * reach;
      const lit = surfaceDim(DIM, f.lit);
      ctx.strokeStyle = mixHex(p.hex, vein, lit);
      ctx.lineWidth = Math.max(0.5, reach * VEIN);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Where the bright is on this vein right now. Each vein is offset so the
      // body flickers rather than beating as one, which is what makes it read
      // as alive rather than as a light being switched.
      const s = (p.t * RATE + i * 0.19) % 1;
      const a = Math.max(0, s - BEAD);
      ctx.strokeStyle = mixHex(vein, p.rim, BEAD_LIFT * lit);
      ctx.beginPath();
      ctx.moveTo(cx + (tipX - cx) * a, tipY * a);
      ctx.lineTo(cx + (tipX - cx) * s, tipY * s);
      ctx.stroke();
    }
    ctx.fillStyle = p.rim;
    ctx.beginPath();
    ctx.arc(cx, 0, Math.max(0.5, reach * 0.16), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
