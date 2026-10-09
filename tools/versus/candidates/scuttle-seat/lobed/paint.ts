import { blobPoints } from "../../../../../packages/content/src/shapes.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SeatDraw } from "../../../../../packages/render/src/scuttle-seat.js";
import { splineSealed } from "../../../../../packages/render/src/spline.js";

/** A lobe's half-width and half-height, and a wound's, in tiles. */
const LOBE_W = 0.38;
const LOBE_H = 0.27;
const WOUND_W = 0.34;
const WOUND_H = 0.22;

/**
 * LOBED, a part seated: a swell of the frame's own rock rather than a plate
 * set into it — the slab's dark grey, lit along its upper curve and shaded
 * into the slab at its foot, with no edge drawn where one ends and the other
 * begins, so the frame reads as one body with its parts grown on it.
 */
export function paintLobe(d: SeatDraw): void {
  const { ctx, l, c, i, fade, time } = d;
  const t = l.tile;
  const body = splineSealed(
    blobPoints(c.x, c.y, LOBE_W * t * fade, LOBE_H * t * fade, 3, 0.08, 0.05, time, i * 2.3),
  );
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.rockDark, fade);
  ctx.fill(body);
  ctx.clip(body);
  const light = ctx.createRadialGradient(
    c.x - t * 0.12,
    c.y - t * 0.14,
    t * 0.02,
    c.x,
    c.y,
    t * LOBE_W,
  );
  light.addColorStop(0, rgba(PALETTE.rock, 0.85 * fade));
  light.addColorStop(0.55, rgba(PALETTE.rock, 0.25 * fade));
  light.addColorStop(1, rgba(PALETTE.sheenDeep, 0.6 * fade));
  ctx.fillStyle = light;
  ctx.fill(body);
  ctx.restore();
  // A glint high on the swell, so it reads as round.
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.55 * fade);
  ctx.beginPath();
  ctx.ellipse(c.x - t * 0.14, c.y - t * 0.13, t * 0.09, t * 0.035, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * LOBED, a part gone: a wound where the lobe was torn off — a ragged hole in
 * the rock with the wet violet of the inside showing, a dark torn lip round
 * it, and the inside dripping out of its lower edge.
 */
export function paintWound(d: SeatDraw): void {
  const { ctx, l, c, i, fade, time } = d;
  const t = l.tile;
  const hole = splineSealed(
    blobPoints(
      c.x,
      c.y,
      WOUND_W * t * fade,
      WOUND_H * t * fade,
      7,
      0.18,
      0.08,
      time * 0.5,
      i * 1.7,
    ),
  );
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hull, 0.95 * fade);
  ctx.fill(hole);
  ctx.save();
  ctx.clip(hole);
  const wet = ctx.createRadialGradient(c.x, c.y + t * 0.06, 0, c.x, c.y, t * WOUND_W);
  wet.addColorStop(0, rgba(PALETTE.hullRim, 0.75 * fade));
  wet.addColorStop(0.6, rgba(PALETTE.hull, 0));
  wet.addColorStop(1, rgba(PALETTE.sheenDeep, 0.7 * fade));
  ctx.fillStyle = wet;
  ctx.fill(hole);
  ctx.restore();
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.95 * fade);
  ctx.lineWidth = t * 0.07;
  ctx.lineJoin = "round";
  ctx.stroke(hole);
  // Drips out of the lower lip, each on its own slow swing.
  ctx.fillStyle = rgba(PALETTE.hull, 0.9 * fade);
  for (let k = 0; k < 2; k++) {
    const x = c.x + (k === 0 ? -0.14 : 0.17) * t;
    const len = t * (0.12 + 0.08 * (0.5 + 0.5 * Math.sin(time * 1.3 + i + k * 2)));
    const top = c.y + WOUND_H * t * 0.8;
    ctx.beginPath();
    ctx.ellipse(x, top + len * 0.5, t * 0.045, len * 0.6, 0, 0, Math.PI * 2);
    ctx.arc(x, top + len, t * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
