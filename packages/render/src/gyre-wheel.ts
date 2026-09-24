import type { Creature, SimConfig, World } from "@neon-spore/sim";
import { hazed, nearness } from "./depth.js";
import { strokeGlow } from "./glow.js";
import { gyreRadiusPx } from "./gyre.js";
import { GYRE_LOOK } from "./gyre-look.js";
import { gyreCenter, gyreCorners, gyreFlow } from "./gyre-place.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **One wheel, drawn**: the membrane around it, the two rim bands through the
 * six bodies, the spokes that hold it out and the organelle in the middle.
 *
 * Its own file beside `gyre.ts`, split when that one reached the 250-line
 * ceiling. The seam is the one the file already had: next door finds the
 * wheels on the field and loops over them, which is a question about a world,
 * and this is what one of them looks like, which is a question about six
 * numbers and a context. The six constants come with the drawing because every
 * one of them is a share of the reach and nothing but the drawing reads them.
 */

/** How far the two rim lines sit either side of the bodies' own centres, as a
 * share of the reach. Small: what makes a band read as a vessel is having a
 * thickness at all, and wider would show past the contours it is holding. */
const RIM_SPLIT = 0.05;

/** Where the outer membrane floats, as a share of the reach, how far it ripples
 * in and out, and how many points it is sampled at. Outside every body, so it is
 * never mistaken for one; twice the twelve rim positions, so the ripple and the
 * wheel's own clock face are the same twelve-fold thing. */
const MEMBRANE = 1.15;
const RIPPLE = 0.055;
const MEMBRANE_POINTS = 24;

/** How far a spoke bows off the straight line, as a share of its length. It bows
 * *against* the turn, a stalk being dragged — the one cue on the wheel that says
 * which way it is going without a mark on it. */
const SPOKE_BOW = 0.14;

/** The organelle's radius, as a share of the reach. Large enough to be a
 * surface, and still nowhere near the bodies (`gyre-core.ts`). */
const CORE = 0.3;

/** The membrane: a closed ripple outside every body, stroked as a dashed
 * current whose flow is the wheel's true rate (`gyreFlow`). It is the readout
 * for the maw — see the argument in `gyre-place.ts`. */
function membrane(x: number, y: number, r: number, flow: number, time: number): Path2D {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < MEMBRANE_POINTS; i++) {
    const a = (i / MEMBRANE_POINTS) * Math.PI * 2;
    const m = 1 + RIPPLE * Math.sin(a * 3 - time * 0.9) + RIPPLE * 0.5 * Math.sin(a * 5 + flow);
    pts.push({
      x: x + Math.cos(a + flow * 0.25) * r * m,
      y: y + Math.sin(a + flow * 0.25) * r * m,
    });
  }
  return splinePath(pts, true);
}

/** One of the two rim bands: the curve through the six drawn centres, scaled
 * about the hub so the pair of them reads as a vessel with a wall. */
function band(x: number, y: number, at: readonly { x: number; y: number }[], k: number): Path2D {
  const scaled = at.map((p) => ({ x: x + (p.x - x) * k, y: y + (p.y - y) * k }));
  return splinePath(scaled, true);
}

/**
 * One wheel: a membrane, a rim through the six, six bowed spokes and the
 * organelle they meet at.
 *
 * Everything but the core is stroked rather than filled. The mounts are the only
 * solid bodies on a wheel — they are what has to be read at a glance, in colour,
 * from across a phone screen — and an armature with any weight to it would be
 * competing with the six things the pair is actually looking at.
 */
export function drawWheel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  carried: readonly Creature[],
  beatPhase: number,
  time: number,
  pull: number,
): void {
  const cfg: SimConfig = world.cfg;
  const { x, y } = gyreCenter(l, c, beatPhase);
  const at = gyreCorners(l, world, c, carried, beatPhase, time);
  const row = c.fromRow + (c.row - c.fromRow) * beatPhase;
  const near = nearness(l, row);
  const tint = hazed(cfg, pull > 0 ? PALETTE.shield : PALETTE.wisp, near);
  const rim = hazed(cfg, pull > 0 ? PALETTE.shieldRim : PALETTE.wispRim, near);
  const reach = gyreRadiusPx(l);
  const flow = gyreFlow(world, c, beatPhase, time);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // The membrane, first and farthest out.
  ctx.strokeStyle = tint;
  ctx.lineWidth = STROKE.inner;
  ctx.globalAlpha = 0.45 + 0.35 * pull;
  ctx.setLineDash([reach * 0.1, reach * 0.16]);
  ctx.lineDashOffset = -flow * reach * 0.55;
  ctx.stroke(membrane(x, y, reach * MEMBRANE, flow, time));

  // The rim, as two curves a hair either side of the bodies' own centres: a
  // vessel with a wall, rather than one line that would read as a wire. The
  // bodies are drawn over it afterwards, so what shows in the end is a rim
  // running behind each of them and out to the next.
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  // Through `strokeGlow` rather than a plain stroke, and that is the whole of
  // "more neon": violet is a third the luminance of the grey this used to be
  // drawn in, so the same alpha that read as metal reads as nothing at all. The
  // aura round the line is where a neon line's brightness comes from — never a
  // thicker line (`glow.ts`).
  for (const k of [1 - RIM_SPLIT, 1 + RIM_SPLIT]) {
    // At 0.85 as an argument: `strokeGlow` sets its own alpha.
    strokeGlow(ctx, band(x, y, at, k), tint, STROKE.inner, 1.4 + pull, 0.85);
  }

  // And the fluid inside that wall: a bright short run of it going round at the
  // wheel's true rate. It is the second half of the maw's readout, out where an
  // eye already is — a *dash* rather than a light, because a light travelling
  // among the bodies would be read as a body.
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.globalAlpha = 0.55 + 0.4 * pull;
  ctx.setLineDash([reach * 0.5, reach * 2.6]);
  ctx.lineDashOffset = -flow * reach;
  ctx.stroke(band(x, y, at, 1));
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // The spokes, core to rim, one per slot, bowed against the turn. They end at
  // the corner rather than short of it, because the corner *is* the middle of a
  // body — the spoke runs under the contour and the contour is drawn over it,
  // which is what a thing bolted through the middle looks like.
  const spokes = new Path2D();
  for (const p of at) {
    const dx = p.x - x;
    const dy = p.y - y;
    // The control point is the midpoint pushed sideways. Perpendicular to the
    // spoke and always the same way round the wheel, so all six trail together.
    spokes.moveTo(x, y);
    spokes.quadraticCurveTo(x + dx * 0.5 + dy * SPOKE_BOW, y + dy * 0.5 - dx * SPOKE_BOW, p.x, p.y);
  }
  strokeGlow(ctx, spokes, tint, STROKE.inner, 0.9 + pull, 0.6 + 0.3 * pull);

  ctx.restore();

  // The surface in the middle, over the spokes so the six read as growing out
  // of it — through a record, so a second organelle can be offered beside it.
  GYRE_LOOK.core({ ctx, x, y, r: reach * CORE, tint, rim, flow, time, pull });

  // A mark pointing at the first slot. It turns with the rim because it is aimed
  // at the rim's own first corner rather than at an angle of its own — six
  // spokes are six-fold symmetric and say nothing about which way the wheel is
  // going, and that is exactly what the pair has to read off it.
  const head = at[0];
  if (!head) return;
  const dx = head.x - x;
  const dy = head.y - y;
  const d = Math.hypot(dx, dy) || 1;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.globalAlpha = 0.7 + 0.3 * pull;
  // Clear of the organelle at both ends: a line drawn across the middle of it
  // reads as a scratch on the surface rather than as a thing pointing.
  ctx.beginPath();
  ctx.moveTo(x + (dx / d) * reach * CORE * 1.05, y + (dy / d) * reach * CORE * 1.05);
  ctx.lineTo(x + (dx / d) * reach * CORE * 1.7, y + (dy / d) * reach * CORE * 1.7);
  ctx.stroke();
  ctx.restore();
}
