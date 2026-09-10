import {
  CANOPY_HALF,
  CANOPY_LIFT,
  canopyPath,
} from "../../../../../packages/render/src/chute-canopy.js";
import type { ChuteDraw } from "../../../../../packages/render/src/chute-look.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * BELL — it is not a parachute, it is the animal that swims by being one.
 *
 * **The canopy.** The shipped outline, and inside it the two things a
 * translucent shell has that a wash does not. The **far wall**, seen through
 * the near one: a second arc of the same curve drawn smaller and higher inside
 * the dome, lit on its *inside* — bright where a solid would be dark, which is
 * the one cue that says light went through this and came back. And the
 * **curl**: the hem turns under, so the rim is thickest and brightest along the
 * bottom edge and thins to nothing at the crown, which is where the material
 * doubles back on itself.
 *
 * It **pulses** rather than merely leaning. A bell swims by squeezing, so the
 * dome narrows and deepens on the beat and opens again after it, and the body
 * hanging under it lags — the sway the shipped canopy carries, kept, with the
 * squeeze laid over it. What the pair should be able to see is that the thing
 * is *working* rather than being blown about.
 *
 * **The plume.** A ring rather than a wedge: a hollow column with a dark core,
 * because that is what a bell expelling water leaves and what a wedge cannot
 * say. The two lit walls of the ring are the same far-wall trick pointed down.
 */

/** How deep the squeeze goes, as a share of the dome's width, and how fast.
 * Slower than the shipped breath: a squeeze is a stroke, not a shimmer. */
const SQUEEZE = 0.16;
const STROKE_HZ = 1.1;
/** How far the whole assembly leans, in radians — the shipped sway, kept, so
 * the pair is judging the pulse rather than a lean it lost. */
const SWAY = 0.16;
/** How far in the far wall stands and how high it rides, as shares of the
 * dome. */
const INNER = 0.6;
const RIDE = 0.3;
/** How long the ring of jet reaches, in body radii — the shipped length. */
const PLUME = 2.4;

export function belled(d: ChuteDraw): void {
  const { ctx, cfg, r, glow, rim, near, time, phase } = d;
  const stroke = Math.sin(time * STROKE_HZ + phase);
  const squeeze = 1 - SQUEEZE * Math.max(0, stroke);
  ctx.save();
  ctx.rotate(Math.sin(time * 0.7 + phase) * SWAY);
  // The squeeze is on the width alone and the belly answers it, which is what a
  // bell does: the narrower it draws, the deeper it goes.
  ctx.scale(squeeze, 1);
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;
  const belly = 1 + (1 - squeeze) * 1.6;
  const dome = canopyPath(r, belly);

  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.18;
  ctx.fill(dome);
  ctx.globalAlpha = 1;

  // The far wall, inside the near one and lit on its inside — bright where a
  // solid would be dark. Drawn as its own smaller copy of the same curve, so it
  // is plainly the *other side of this shell* rather than a second object.
  ctx.save();
  ctx.clip(dome);
  ctx.translate(0, -r * RIDE * belly);
  ctx.scale(INNER, INNER);
  const far = canopyPath(r, belly);
  ctx.fillStyle = rgba("#FFFFFF", 0.13);
  ctx.fill(far);
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = STROKE.inner / INNER;
  ctx.stroke(far);
  ctx.restore();

  // The curl: the rim at its thickest along the hem, where the material turns
  // under itself, and gone by the crown.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-half, lift);
  ctx.quadraticCurveTo(0, lift + r * 0.42, half, lift);
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline * 2.1;
  ctx.globalAlpha = 0.75;
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(dome);

  // The lines, as they ship. A bell has no shrouds, but this one is carrying a
  // body it did not grow, and four lines are what say so.
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const t = -1 + (k * 2) / 3;
    ctx.moveTo(half * t, lift + r * 0.42 * (1 - t * t));
    ctx.lineTo(0, -r * 0.45);
  }
  ctx.strokeStyle = hazed(cfg, PALETTE.dim, near);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
  ctx.restore();

  halo(ctx, 0, -r * CANOPY_LIFT * 0.5, r * 1.4, glow, 0.1);
}

export function jet(d: ChuteDraw): void {
  const { ctx, r, ember, time, phase } = d;
  const gutter = 1 + Math.sin(time * 22 + phase) * 0.12;
  const len = r * PLUME * gutter;
  const top = r * 0.4;
  ctx.save();
  // Two walls with nothing between them: the ring a bell expels, seen from the
  // side. The dark core is what a wedge cannot say — a solid column of flame is
  // a flare, and this is a body pushing water out of itself.
  for (const side of [-1, 1]) {
    const grad = ctx.createLinearGradient(side * r * 0.42, top, 0, top + len);
    grad.addColorStop(0, rgba("#FFF0D6", 0.8));
    grad.addColorStop(0.35, ember);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(side * r * 0.55, top);
    ctx.lineTo(side * r * 0.26, top);
    ctx.quadraticCurveTo(side * r * 0.2, top + len * 0.6, 0, top + len);
    ctx.quadraticCurveTo(side * r * 0.42, top + len * 0.6, side * r * 0.55, top);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
  halo(ctx, 0, r * 0.6, r * 1.2, ember, 0.18);
}
