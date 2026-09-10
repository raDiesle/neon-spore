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
 * RIBS — the canopy has a frame, and the membrane sags between it.
 *
 * **The canopy.** Four ribs from the crown to the hem, placed by longitude on a
 * hemisphere and carried round by the sway, so the near pair stands wide and
 * the pair going to the limb narrows and goes. Between each pair the membrane
 * **sags**: the hem dips lower at the middle of a panel than it does at a rib,
 * so the bottom edge is a scallop rather than a curve, and the sag deepens as
 * the pair it spans comes toward us. A rib is drawn as a thickening of the
 * material rather than as a line, tapered from the crown to the hem — the shape
 * an umbrella's stay is not, because everything in this game that is not rock
 * is grown.
 *
 * **The plume.** Three stacked pulses rather than one taper: the thrust is
 * *pumping*, not pouring. Each pulse is a lens that starts small at the body,
 * widens as it goes down and fades out, and a new one leaves every third of a
 * second — so the ascent has a rhythm the eye can count, which is what says the
 * body is being pushed rather than sliding upward.
 */

/** How many ribs the canopy carries. Four, which is two visible at rest: fewer
 * and it is a crease, more and the hem is a comb. */
const RIBS = 4;
/** How far the sway carries the ribs round, in radians at the ends of its
 * swing — larger than the shipped lean, because a rib only reveals anything by
 * going round. */
const TURN = 0.85;
/** How far the membrane dips between two ribs, as a share of the body. */
const SAG = 0.34;
/** What a rib keeps of its light with its own normal turned away. */
const FLOOR = 0.4;
/** How long the plume reaches and how many pulses are in it — the shipped
 * length, so the two are judged on their section rather than their size. */
const PLUME = 2.4;
const PULSES = 3;

const PINS = Array.from({ length: RIBS }, (_, i) => pin((i / RIBS) * Math.PI * 2, 0, 1));

export function ribbed(d: ChuteDraw): void {
  const { ctx, cfg, r, glow, rim, near, time, phase } = d;
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;
  const belly = 1 + Math.sin(time * 1.6 + phase) * 0.06;
  const theta = Math.sin(time * 0.7 + phase) * TURN;
  const crown = lift - r * 1.28 * belly;

  ctx.save();
  const dome = canopyPath(r, belly);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.22;
  ctx.fill(dome);
  ctx.globalAlpha = 1;

  // The scalloped hem. Between each visible pair of ribs the membrane dips, and
  // the dip is deepest where the panel faces us — a hem that sagged by the same
  // amount all the way across would be a fringe rather than a surface.
  const shown = PINS.map((p) => facet(p, theta)).filter((f) => f.near);
  ctx.save();
  ctx.clip(dome);
  for (let i = 0; i + 1 < shown.length; i++) {
    const a = shown[i];
    const b = shown[i + 1];
    if (a === undefined || b === undefined) continue;
    const mid = (a.x + b.x) / 2;
    const depth = r * SAG * Math.abs(b.x - a.x) * 0.5;
    ctx.beginPath();
    ctx.moveTo(a.x * half, lift + r * 0.42 * (1 - a.x * a.x));
    ctx.quadraticCurveTo(
      mid * half,
      lift + r * 0.42 + depth * 2,
      b.x * half,
      lift + r * 0.42 * (1 - b.x * b.x),
    );
    ctx.lineTo(b.x * half, lift + r * 0.42 * (1 - b.x * b.x) - depth);
    ctx.quadraticCurveTo(
      mid * half,
      lift + r * 0.42,
      a.x * half,
      lift + r * 0.42 * (1 - a.x * a.x) - depth,
    );
    ctx.closePath();
    ctx.fillStyle = rgba("#FFFFFF", 0.1 * surfaceDim(FLOOR, (a.lit + b.lit) / 2));
    ctx.fill();
  }

  // The ribs themselves: a thickening of the material from the crown to the
  // hem, narrow where the panel is edge-on and full where it faces us. `sx` is
  // the tangent plane's own foreshortening, so a rib at the limb is a hairline
  // without anything being clamped by hand.
  for (const f of shown) {
    const w = Math.max(0.7, r * 0.13 * Math.abs(f.sx));
    ctx.beginPath();
    ctx.moveTo(f.x * half, lift + r * 0.42 * (1 - f.x * f.x));
    ctx.quadraticCurveTo(f.x * half * 0.92, lift - r * 1.05 * belly, 0, crown);
    ctx.strokeStyle = rgba("#FFFFFF", 0.34 * surfaceDim(FLOOR, f.lit));
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(dome);

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

export function pulses(d: ChuteDraw): void {
  const { ctx, r, ember, time, phase } = d;
  const top = r * 0.4;
  const len = r * PLUME;
  ctx.save();
  for (let k = 0; k < PULSES; k++) {
    // Each pulse runs its own loop, a third of a cycle behind the one in front.
    // The wall clock, spread by the body's own phase, which is where every
    // other rhythm on this creature comes from.
    const u = (((time * 3 + phase + k / PULSES) % 1) + 1) % 1;
    const y = top + len * u;
    const wide = r * (0.16 + 0.5 * u);
    ctx.globalAlpha = 0.8 * (1 - u);
    ctx.beginPath();
    ctx.ellipse(0, y, wide, wide * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = ember;
    ctx.fill();
    // The white core inside the youngest of them, which is the part that is
    // leaving rather than the part that has left.
    ctx.beginPath();
    ctx.ellipse(0, y, wide * 0.42, wide * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba("#FFF0D6", 0.85);
    ctx.fill();
  }
  ctx.restore();
  halo(ctx, 0, r * 0.6, r * 1.2, ember, 0.18);
}
