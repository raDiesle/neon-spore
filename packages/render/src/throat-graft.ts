import type { Point } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { mixHex, rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";
import { splineInto, splinePath } from "./spline.js";
import { evertedRings } from "./throat-evert.js";
import { type Ring, rings } from "./throat-shape.js";

/**
 * **Where THE THROAT and the ship are one body**: the hull's own skin flaring
 * up out of the membrane and closing round the gullet's root, with the lit
 * outline and the veins of the ship running on up the tube.
 *
 * The owner, 7 October 2026: *the throat is connected with the ship and looks
 * natural grown together.* The gullet is drawn with the field, under the hull,
 * so until this pass it stood *behind* the swelling — a grey pipe planted
 * behind a hill. This is drawn in the ship pass, after the hull, for the
 * reason THE CLAW's arm is (`reach-arm.ts`): it is the ship, and a part of the
 * ship drawn under the membrane comes out from behind the thing it belongs to.
 *
 * **A fillet, not a sleeve.** Its sides leave the membrane tangent to it, a
 * tile and more either side of the root, and climb to stand flush with the
 * tube, so there is no corner anywhere along the join for the eye to read as
 * an edge. Its paint goes the same way: the hull's violet at the foot, the
 * gullet's grey by the top, and the top itself fading out rather than ending.
 *
 * **A swallow runs into the ship through it.** The gulp (`ringSqueeze`) ends
 * at the root ring, and while it is there the veins carry its light down into
 * the hull — the last beat of a receipt that already runs from the mouth.
 *
 * Every number comes off the boss, the beat and the membrane; nothing is held.
 */

/** How far the graft spreads along the membrane either side of the root, in tiles. */
const SPREAD = 1.6;
/** How high it climbs the tube at most, in tiles, when the mouth is far enough away. */
const CLIMB = 1.4;
/** How far under the membrane its foot reaches, fading as it goes, so the join has no line. */
const BURY = 0.08;
/** How far past a ring the tube's skin bows, so the flank covers it (`throat-draw.ts`). */
const SKIN_BOW = 0.14;
/** How far a ring's band reaches past its own width, in tiles, so its ends stay under the graft (`throat-flesh.ts`). */
const RING_CAP = 0.08;
/** How much of its height, from the top, it spends fading into the tube. */
const FADE = 0.4;

/** Where the veins leave the membrane, as shares of `SPREAD`, and how high they reach up the tube. */
const VEINS: readonly (readonly [number, number])[] = [
  [-0.82, 1.55],
  [-0.4, 2.1],
  [0.12, 1.8],
  [0.55, 2.25],
  [0.9, 1.45],
];

/** The tube's middle and half-width at height `y`, between the two rings either side of it. */
function tubeAt(shape: readonly Ring[], y: number): { x: number; rx: number } {
  const first = shape[0];
  if (first === undefined) return { x: 0, rx: 0 };
  if (y >= first.y) return { x: first.x, rx: first.rx };
  for (let i = 1; i < shape.length; i++) {
    const a = shape[i - 1];
    const b = shape[i];
    if (a === undefined || b === undefined || y < b.y) continue;
    const t = (a.y - y) / Math.max(1e-6, a.y - b.y);
    return { x: a.x + (b.x - a.x) * t, rx: a.rx + (b.rx - a.rx) * t };
  }
  const last = shape[shape.length - 1] ?? first;
  return { x: last.x, rx: last.rx };
}

/** How many points down each flank, and along the foot between them. */
const STEPS = 9;
const FOOT = 8;

/**
 * One flank, from its foot on the membrane up to the tube, as points.
 *
 * Every point stands out from the tube *at its own height*, so the swaying
 * middle of the gullet (`throat-sway.ts`) carries the graft with it rather
 * than poking out of it. It leaves the tube upright and flares to the
 * membrane, arriving flat along it — no corner anywhere along the join.
 */
function flank(
  T: number,
  shape: readonly Ring[],
  surfaceY: SurfaceY,
  footX: number,
  topY: number,
  dir: -1 | 1,
): Point[] {
  const footY = surfaceY(footX);
  const cap = T * RING_CAP;
  const pts: Point[] = [];
  for (let i = STEPS; i >= 0; i--) {
    const s = i / STEPS;
    const y = topY + (footY - topY) * (1 - (1 - s) ** 2);
    const tube = tubeAt(shape, y);
    const hug = tube.x + dir * (tube.rx * (1 + SKIN_BOW) + cap);
    const x = hug + (footX - hug) * s ** 1.8;
    pts.push({ x, y: Math.min(y, surfaceY(x) + 1) });
  }
  return pts;
}

export function drawThroatGraft(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  surfaceY: SurfaceY,
  skin: SeatSkin,
  beatPhase: number,
  time: number,
): void {
  const b = world.boss;
  if (b?.kind !== "throat") return;
  const cfg = world.cfg;
  const T = l.tile;
  // The eversion pulls the root up out of the hull first, so the graft sinks
  // back into the membrane over the first ring's passage and is gone after it.
  const held = b.phase === "everts" ? 1 - evertedRings(cfg, b, world.beat, beatPhase) : 1;
  if (held <= 0) return;
  const shape = rings(l, cfg, b, world.beat, beatPhase);
  const root = shape[0];
  const top = shape[shape.length - 1];
  if (root === undefined || top === undefined) return;

  const footY = surfaceY(root.x);
  // Higher up a long gullet than a short one, so it reads as a root either way.
  const climb = Math.min(T * CLIMB, Math.max(T * 0.8, (footY - top.y) * 0.35));
  // Never up to the top two rings: the opening is the fight's, not the ship's.
  const topY = Math.min(footY - T * 0.15, Math.max(footY - climb * held, top.y + T * 0.55));
  const w = T * SPREAD * (0.6 + 0.4 * held);
  const flankL = flank(T, shape, surfaceY, root.x - w, topY, -1);
  const flankR = flank(T, shape, surfaceY, root.x + w, topY, 1);
  const tube = tubeAt(shape, topY);

  const lx = root.x - w;
  const rx = root.x + w;
  // The membrane the graft stands on, without the swelling: the graft *is*
  // the swelling now, so its foot reaches under the whole of the old one.
  const baseY = Math.max(surfaceY(lx), surfaceY(rx));
  const h = baseY - topY;

  // Down the left flank, across under the membrane, up the right, and over
  // the front of the tube the way a ring's front bows.
  const outline: Point[] = [...flankL];
  // Under the membrane it is a lens, deepest under the root and nothing at
  // the feet, so it has no side for the eye to find.
  for (let i = 1; i < FOOT; i++) {
    const u = i / FOOT;
    const x = lx + (rx - lx) * u;
    const under = surfaceY(lx) + (surfaceY(rx) - surfaceY(lx)) * u;
    outline.push({ x, y: under + T * BURY * Math.sin(Math.PI * u) });
  }
  outline.push(...[...flankR].reverse());
  outline.push({ x: tube.x, y: topY + tube.rx * 0.28 });
  const body = splinePath(outline, true);

  // Bottom to top: gone under the membrane, so the foot has no edge; the
  // hull's own colour at the membrane, going deeper; the gullet's grey; gone.
  const [bright, mid, deep] = skin.hull.body;
  const span = h + T * BURY;
  const at = (y: number) => Math.max(0, Math.min(1, (topY + span - y) / span));
  const fill = ctx.createLinearGradient(0, topY + span, 0, topY);
  fill.addColorStop(0, rgba(mixHex(bright, mid, 0.5), 0));
  fill.addColorStop(at(baseY - T * 0.02), rgba(mixHex(bright, mid, 0.5), held));
  fill.addColorStop(at(baseY - h * 0.25), rgba(mid, held));
  fill.addColorStop(at(baseY - h * 0.55), rgba(mixHex(mid, deep, 0.6), held));
  fill.addColorStop(1 - FADE * 0.5, rgba(PALETTE.rockDark, 0.92 * held));
  fill.addColorStop(1, rgba(PALETTE.rockDark, 0));
  ctx.save();
  ctx.fillStyle = fill;
  ctx.fill(body);

  // Round, not flat: the side away from the key light goes dark (`throat-flesh.ts`).
  ctx.clip(body);
  const round = ctx.createLinearGradient(lx, 0, rx, 0);
  round.addColorStop(0, rgba(PALETTE.background, 0.12 * held));
  round.addColorStop(0.4, rgba(PALETTE.background, 0));
  round.addColorStop(0.6, rgba(PALETTE.background, 0));
  round.addColorStop(1, rgba(PALETTE.background, 0.38 * held));
  ctx.fillStyle = round;
  ctx.fillRect(lx, topY, rx - lx, span);
  ctx.restore();

  // The veins: the ship's tissue climbing the gullet. The gulp lights them as it goes into the hull.
  const gulp = root.squeeze;
  const reach = Math.max(T * 0.3, footY - top.y - T * 0.5);
  ctx.save();
  ctx.lineCap = "round";
  const vein = ctx.createLinearGradient(0, footY, 0, footY - reach);
  vein.addColorStop(0, rgba(skin.flesh[0], (0.75 + 0.25 * gulp) * held));
  vein.addColorStop(0.55, rgba(skin.flesh[1], (0.45 + 0.4 * gulp) * held));
  vein.addColorStop(1, rgba(skin.flesh[2], 0));
  ctx.strokeStyle = vein;
  const veins = new Path2D();
  for (const [i, [at, rise]] of VEINS.entries()) {
    const sx = root.x + at * w;
    const sy = surfaceY(sx) + T * 0.04;
    const ey = Math.max(footY - T * rise * held, footY - reach);
    const end = tubeAt(shape, ey);
    const wob = Math.sin(time * 0.9 + i * 1.7) * T * 0.04;
    const ex = end.x + Math.sign(at) * end.rx * Math.min(0.85, Math.abs(at) * 0.9) + wob;
    const mid = tubeAt(shape, (sy + ey) / 2);
    veins.moveTo(sx, sy);
    veins.bezierCurveTo(
      sx - at * w * 0.25,
      sy - (sy - ey) * 0.35,
      mid.x + at * mid.rx * 0.9 + wob,
      ey + (sy - ey) * 0.3,
      ex,
      ey,
    );
  }
  ctx.lineWidth = Math.max(1, T * 0.05);
  ctx.stroke(veins);
  ctx.restore();

  // The membrane's lit outline, carried on up both flanks and fading as it climbs.
  const out = T * 0.12;
  const rimLine = splinePath(
    [{ x: lx - out, y: surfaceY(lx - out) }, ...flankL.slice(0, -1)],
    false,
  );
  splineInto(rimLine, [{ x: rx + out, y: surfaceY(rx + out) }, ...flankR.slice(0, -1)], false);
  // A soft glow in the seat's tint and the bright thread over it, as the hull's own rim is.
  const rim = (hex: string, a: number) => {
    const g = ctx.createLinearGradient(0, baseY, 0, topY);
    g.addColorStop(0, rgba(hex, a * held));
    g.addColorStop(0.6, rgba(hex, 0.5 * a * held));
    g.addColorStop(1, rgba(hex, 0));
    return g;
  };
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = rim(skin.tint, 0.45);
  ctx.lineWidth = T * 0.09;
  ctx.stroke(rimLine);
  ctx.strokeStyle = rim(skin.rim, 0.9);
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(rimLine);
  ctx.restore();
}
