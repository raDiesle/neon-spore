import { facet, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
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
 * GORES — a dome is made of panels, and a panel has a normal.
 *
 * **The canopy.** The shipped outline, unchanged, with eight meridian gores
 * placed on it by longitude. Each is a seam running from the crown to the hem,
 * and each is put where `facet` says it is at this sway rather than spaced
 * evenly across the picture: the pair nearest the middle stand wide apart, the
 * ones approaching the limb crowd together and vanish, and the far four are not
 * drawn at all. That crowding is the whole of the argument — a dome drawn with
 * eight evenly spaced lines is a fan, and the same eight placed by longitude is
 * a hemisphere. Each panel is shaded by its own normal against the fixed key,
 * so the shoulder toward the light is pale and the one away from it holds the
 * membrane's own colour.
 *
 * **The plume.** The same argument pointed down: three lit ribs down the flame
 * rather than one flat taper, placed by longitude on a column and swinging with
 * the same clock, so the fire has a near side and a far one.
 */

/** How many gores the dome is cut into. Eight: four ever visible, which is the
 * fewest that read as a *shell* rather than as a pair of creases. */
const GORES = 8;
/** How far the sway carries the gores round, in radians at the ends of its
 * swing. Larger than the shipped lean, because a seam only reveals anything by
 * going round — and this is the canopy turning under a body that is not.  */
const TURN = 0.9;
/** What a panel keeps of its light with its own normal turned away. */
const FLOOR = 0.45;
/** How many ribs the plume carries. */
const RIBS = 3;

const PINS = Array.from({ length: GORES }, (_, i) => pin((i / GORES) * Math.PI * 2, 0, 1));
const RIB_PINS = Array.from({ length: RIBS }, (_, i) => pin((i / RIBS) * Math.PI * 2, 0, 1));

export function gored(d: ChuteDraw): void {
  const { ctx, cfg, r, glow, rim, near, time, phase } = d;
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;
  const belly = 1 + Math.sin(time * 1.6 + phase) * 0.06;
  const theta = Math.sin(time * 0.7 + phase) * TURN;

  ctx.save();
  const dome = canopyPath(r, belly);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.22;
  ctx.fill(dome);
  ctx.globalAlpha = 1;

  // The panels, inside the dome. Each seam is a curve from the crown to the hem
  // at the longitude `facet` puts it at, and the panel between it and the next
  // is filled at the light its own normal takes.
  ctx.save();
  ctx.clip(dome);
  for (let i = 0; i < GORES; i++) {
    const a = PINS[i];
    const b = PINS[(i + 1) % GORES];
    if (a === undefined || b === undefined) continue;
    const fa = facet(a, theta);
    const fb = facet(b, theta);
    if (!fa.near || !fb.near) continue;
    ctx.beginPath();
    ctx.moveTo(fa.x * half, lift);
    ctx.quadraticCurveTo(fa.x * half * 0.9, lift - r * 1.1 * belly, 0, lift - r * 1.28 * belly);
    ctx.quadraticCurveTo(fb.x * half * 0.9, lift - r * 1.1 * belly, fb.x * half, lift);
    ctx.quadraticCurveTo(
      ((fa.x + fb.x) / 2) * half,
      lift + r * 0.42 * (1 - ((fa.x + fb.x) / 2) ** 2),
      fa.x * half,
      lift,
    );
    ctx.closePath();
    ctx.fillStyle = rgba("#FFFFFF", 0.16 * surfaceDim(FLOOR, (fa.lit + fb.lit) / 2));
    ctx.fill();
    ctx.strokeStyle = rim;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = STROKE.inner;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(dome);

  // The four lines, as they ship: the hem is held down across its whole width
  // and a dome of panels still hangs off a body.
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

/** How long the fluted plume reaches, in body radii — the shipped length, so
 * the two are judged on their section rather than on their size. */
const PLUME = 2.4;

export function fluted(d: ChuteDraw): void {
  const { ctx, r, ember, time, phase } = d;
  const gutter = 1 + Math.sin(time * 22 + phase) * 0.12;
  const len = r * PLUME * gutter;
  const top = r * 0.4;
  const theta = time * 1.3 + phase;

  ctx.save();
  ctx.globalAlpha = 0.75;
  const grad = ctx.createLinearGradient(0, top, 0, top + len);
  grad.addColorStop(0, ember);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, top);
  ctx.lineTo(r * 0.55, top);
  ctx.lineTo(0, top + len);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Three ribs, placed by longitude on the column and going round it, so the
  // near one is wide and bright and the ones at the limb are slivers. A flame
  // with a near side is a flame with a volume.
  for (const p of RIB_PINS) {
    const f = facet(p, theta);
    if (!f.near) continue;
    ctx.beginPath();
    ctx.moveTo(f.x * r * 0.5, top);
    ctx.lineTo(0, top + len * 0.72);
    ctx.lineTo(f.x * r * 0.24, top);
    ctx.closePath();
    ctx.fillStyle = rgba("#FFF0D6", 0.7 * surfaceDim(0.3, f.lit));
    ctx.fill();
  }
  ctx.restore();
  halo(ctx, 0, r * 0.6, r * 1.2, ember, 0.18);
}
