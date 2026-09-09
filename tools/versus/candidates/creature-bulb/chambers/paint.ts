import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * CHAMBERS — the six lobes are six rooms.
 *
 * The bulb's contour carries six lobes deep enough to be counted, and its
 * interior has never said anything about them: one dot in the middle, and the
 * lobes might as well be a texture on the rim. This says they are the *shape of
 * the inside* — six chambers, each under its own lobe, each on a short neck to
 * a small hub. Look at the outline and you have already been told how many
 * there are.
 *
 * **Placed, not posed.** Each chamber is a `pin` and a `facet` per frame, so
 * the three at the back go behind the hub and come round again; nothing here
 * squashes a picture (`.claude/skills/depth`).
 *
 * **The roll is rotated out**, for the reason the depth skill gives: the light
 * does not turn with the body, so the layout does.
 */

/** How many chambers, how big each is, and how far out they sit. */
const ROOMS = 6;
const ROOM = 0.3;
const REACH = 0.6;
const SPIN = 0.4;
const NECK = 0.09;
const DIM = 0.26;

const PINS: Pin[] = [];
for (let i = 0; i < ROOMS; i++) {
  // Six longitudes evenly round, tilted alternately above and below the
  // equator: a ring at one latitude folds to a line when it turns, which is
  // the shape `surface.ts` warns about, and six rooms in a line is a comb.
  PINS.push(pin((i / ROOMS) * Math.PI * 2, i % 2 === 0 ? 0.35 : -0.35, 1));
}

export function chambers(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = Math.min(p.rx, p.ry) * REACH;

  ctx.save();
  ctx.rotate(-p.rot);
  ctx.lineCap = "round";
  for (const q of PINS) {
    const f = facet(q, theta);
    if (!f.near) continue;
    const x = f.x * reach;
    const y = f.y * reach;
    const lit = surfaceDim(DIM, f.lit);
    ctx.strokeStyle = mixHex(p.hex, p.rim, lit * 0.6);
    ctx.lineWidth = Math.max(0.5, reach * NECK);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.save();
    ctx.translate(x, y);
    // The tangent plane's own map: a chamber near the limb is seen edge-on and
    // is a sliver, not a smaller circle.
    ctx.scale(Math.max(0.1, f.sx), 1);
    ctx.fillStyle = mixHex(p.hex, p.rim, lit);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, reach * ROOM * Math.max(0.25, f.sy)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = mixHex(p.hex, p.rim, 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0.5, reach * 0.18), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
