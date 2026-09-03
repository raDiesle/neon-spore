import { catmullRomToBezierPath } from "@neon-spore/content";
import {
  type Creature,
  GYRE_RADIUS,
  gyreSucked,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { hazed, nearness } from "./depth.js";
import { strokeGlow } from "./glow.js";
import { drawGyreCore } from "./gyre-core.js";
import { gyreCenter, gyreCorners, gyreFlow } from "./gyre-place.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE GYRE's armature: a membrane, a rim through the six bodies, the spokes
 * that hold it out and the organelle in the middle (`gyre-core.ts`).
 *
 * **Only the wheel is drawn here.** The six on the rim are `mount`s, which
 * `wornKind` resolves to an ordinary slick or bulb, so `drawCreatures` draws
 * them exactly as it draws a body in a lane — same contour, same colour, same
 * own-motion, same size. That is the creature rather than a saving: what the
 * pair has to read off a wheel is *the colour standing in a column*, which is
 * the sentence they already know, and a mount that looked like anything else
 * would be a new word to learn instead of an old one that expires.
 *
 * **The rim runs through the bodies, and it cannot be a circle.** The six stand
 * on tiles, and a tile ring is not round: two of them are two tiles from the hub
 * and the other four are `sqrt(5)`, a quarter of a tile further out (`GYRE_RING`
 * in gyre-rim.ts). No circle holds all six the same way — one through the near
 * pair cuts the far four in half, one through the far four leaves the near pair
 * floating inside it. So it is a curve through their own centres, which says the
 * true thing once: every body sits in the middle of the border, and the border is
 * what carries it. **A curve rather than the six straight lines it used to be** —
 * a hexagon is a machined part, and nothing else on this field has a corner in
 * it. It is built from where the bodies are actually *drawn*, so it glides with
 * them between beats and the joint can never come apart — and a shot-away body
 * leaves its corner behind, because losing one costs the wheel an arm and not
 * its shape.
 *
 * **Violet rather than metal.** The armature used to be `rock` grey, the safe
 * answer to a real constraint: red and cyan are *words* on this field, and a
 * wheel painted in either would be saying one of them six times over. The palette
 * already keeps a neon that means no colour — `wisp`, chosen for a body that
 * either shot kills — and that is what a wheel is: the thing between the two
 * colours rather than one of them. Under a pull it is lit the shield's cyan,
 * which is the colour the ship's own suck is drawn in, the arrangement
 * `claspResonance` already has for the ward.
 *
 * It is drawn in a pass of its own, **before** the bodies rather than inside
 * their loop, because a wheel is one object spanning five rows: `byDepth` sorts
 * body by body, so a hub taking its turn in that order would have its spokes over
 * the mounts above it and under the ones below.
 */

/** Every wheel on the field. Exported so the armature and the wind ask once. */
export function gyres(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "gyre");
}

/** How far the outermost body reaches from the hub, in pixels — the whole
 * footprint of a wheel, and what the wind leaves from. */
export function gyreRadiusPx(l: Layout): number {
  return l.tile * GYRE_RADIUS;
}

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

/**
 * The armature of every wheel on the field. `pull` is 0..1, how hard the ship is
 * dragging — the same number `drawGyreWind` brightens with, so the two ends of
 * the pull can never light on different frames.
 */
export function drawGyres(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const live = gyres(world);
  if (live.length === 0) return;
  const pull = gyreSucked(world) ? 1 : 0;
  for (const c of live) {
    // The bodies this wheel is actually carrying, so the rim is built from the
    // things it holds rather than from an angle they ought to be at.
    const carried = world.creatures.filter((m) => m.gyreId === c.id);
    drawWheel(ctx, l, world, c, carried, beatPhase, time, pull);
  }
}

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
  return new Path2D(catmullRomToBezierPath(pts));
}

/** One of the two rim bands: the curve through the six drawn centres, scaled
 * about the hub so the pair of them reads as a vessel with a wall. */
function band(x: number, y: number, at: readonly { x: number; y: number }[], k: number): Path2D {
  return new Path2D(
    catmullRomToBezierPath(at.map((p) => ({ x: x + (p.x - x) * k, y: y + (p.y - y) * k }))),
  );
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
function drawWheel(
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
  ctx.globalAlpha = 0.85;
  // Through `strokeGlow` rather than a plain stroke, and that is the whole of
  // "more neon": violet is a third the luminance of the grey this used to be
  // drawn in, so the same alpha that read as metal reads as nothing at all. The
  // aura round the line is where a neon line's brightness comes from — never a
  // thicker line (`glow.ts`).
  for (const k of [1 - RIM_SPLIT, 1 + RIM_SPLIT]) {
    strokeGlow(ctx, band(x, y, at, k), tint, STROKE.inner, 1.4 + pull);
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
  ctx.lineWidth = STROKE.inner;
  ctx.globalAlpha = 0.6 + 0.3 * pull;
  const spokes = new Path2D();
  for (const p of at) {
    const dx = p.x - x;
    const dy = p.y - y;
    // The control point is the midpoint pushed sideways. Perpendicular to the
    // spoke and always the same way round the wheel, so all six trail together.
    spokes.moveTo(x, y);
    spokes.quadraticCurveTo(x + dx * 0.5 + dy * SPOKE_BOW, y + dy * 0.5 - dx * SPOKE_BOW, p.x, p.y);
  }
  strokeGlow(ctx, spokes, tint, STROKE.inner, 0.9 + pull);

  ctx.restore();

  // The surface in the middle. Last of the armature and over the spokes, which
  // is what makes the six read as growing out of it rather than crossing it.
  drawGyreCore(ctx, x, y, reach * CORE, tint, rim, flow, time, pull);

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
