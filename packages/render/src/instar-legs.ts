import type { Point } from "./instar-place.js";
import { faded } from "./instar-plate.js";
import { bodyOf } from "./instar-profile-surface.js";
import { PALETTE } from "./palette.js";
import { hazeSkin } from "./solid-haze.js";
import { drawTube, type Skin } from "./solid-tube-draw.js";
import { splineAt } from "./spline.js";

/**
 * **THE INSTAR's legs side-on** — the owner, 7 October 2026: *overall like a
 * dragon*, and *I most concern about body shape and 3d perspective*. A long
 * body with no legs reads as a serpent or a hose; four legs hung under the
 * chest and the haunches read as a dragon at any size.
 *
 * The legs dangle, as a flying dragon's do: a foreleg under the chest, its
 * elbow back and its hand curled forward, and a hind leg under the haunches,
 * its knee forward and its hock back. Each is a lit tube of the rig like the
 * body, with three claws at its foot. **The far pair hangs behind the body and
 * is hazed toward the field**, offset a little so it shows past the near pair:
 * one leg over another is the depth a flat side view otherwise lacks.
 *
 * They hang off the belly, leaning toward the screen's down, so in a coil or an
 * upright rise they stay under the body rather than standing through it.
 */

/** A joint of a leg as it hangs: back along the body, down off the belly, and its radius — in head radii. */
type Joint = readonly [back: number, down: number, radius: number];

/** A leg: where along the body it hangs, 0 neck to 1 rear, and its joints from the hip to the toes. */
interface LegShape {
  readonly at: number;
  readonly joints: readonly Joint[];
}

const FORE: LegShape = {
  at: 0.34,
  joints: [
    [0, -0.1, 0.28],
    [0.26, 0.48, 0.16],
    [-0.08, 0.88, 0.11],
    [-0.3, 1.0, 0.09],
  ],
};

const HIND: LegShape = {
  at: 0.8,
  joints: [
    [0, -0.1, 0.38],
    [-0.34, 0.5, 0.2],
    [0.08, 0.9, 0.12],
    [-0.2, 1.12, 0.1],
  ],
};

/** How the far leg of each pair sits off the near one: along the body, up toward the back, and turned. */
const FAR = { back: -0.14, up: 0.18, turn: 0.22 };
/** How far the far pair goes into the field's dark. */
const FAR_HAZE = 0.65;
/** How far a leg swings as it dangles, in radians, and how fast. */
const DANGLE = 0.07;
const DANGLE_RATE = 1.4;

/** One leg as drawn: its centre line and radius at each joint, and whether it is on the far side. */
export interface Leg {
  readonly far: boolean;
  readonly bones: readonly Point[];
  readonly radii: readonly number[];
}

/** The four legs, far pair first, under the body whose centre runs along `spine` and belly along `bottom`. */
export function profileLegs(
  spine: readonly Point[],
  bottom: readonly Point[],
  r: number,
  time: number,
): Leg[] {
  const legs: Leg[] = [];
  for (const far of [true, false])
    [FORE, HIND].forEach((shape, k) => {
      legs.push(hang(shape, spine, bottom, r, time + k * 1.7 + (far ? 0.9 : 0), far));
    });
  return legs;
}

function hang(
  shape: LegShape,
  spine: readonly Point[],
  bottom: readonly Point[],
  r: number,
  time: number,
  far: boolean,
): Leg {
  const n = spine.length - 1;
  const i = Math.max(1, Math.min(n - 1, Math.round(shape.at * n)));
  const c = spine[i] as Point;
  const b = bottom[i] as Point;
  const toBelly = unit({ x: b.x - c.x, y: b.y - c.y }, { x: 0, y: 1 });
  // Down off the belly, leaning toward the screen's down.
  const d = unit({ x: toBelly.x * 0.6, y: toBelly.y * 0.6 + 0.4 }, toBelly);
  const next = spine[i + 1] as Point;
  const prev = spine[i - 1] as Point;
  const run = { x: next.x - prev.x, y: next.y - prev.y };
  const a = -d.y * run.x + d.x * run.y >= 0 ? { x: -d.y, y: d.x } : { x: d.y, y: -d.x };
  const sink = far ? 0.5 - FAR.up : 0.5;
  const hip = { x: c.x + (b.x - c.x) * sink, y: c.y + (b.y - c.y) * sink };
  const swing = DANGLE * Math.sin(time * DANGLE_RATE) + (far ? FAR.turn : 0);
  const cs = Math.cos(swing);
  const sn = Math.sin(swing);
  const shift = far ? FAR.back : 0;
  const bones = shape.joints.map(([back, down]) => {
    // Turned about the hip, the toes swinging toward the head as the angle grows.
    const x = back * cs - down * sn + shift;
    const y = back * sn + down * cs;
    return { x: hip.x + (a.x * x + d.x * y) * r, y: hip.y + (a.y * x + d.y * y) * r };
  });
  return { far, bones, radii: shape.joints.map(([, , w]) => w * r) };
}

function unit(v: Point, fallback: Point): Point {
  const len = Math.hypot(v.x, v.y);
  return len < 0.3 ? fallback : { x: v.x / len, y: v.y / len };
}

/** Samples along a leg's bones: how many, and the centre and radius at each. */
const SAMPLES = 14;

/** A leg's centre line and radius, smoothed through its joints: the rings a bolt meets. */
export function legRings(leg: Leg): { c: Point; r: number }[] {
  return Array.from({ length: SAMPLES + 1 }, (_, j) => {
    const u = j / SAMPLES;
    const s = u * (leg.radii.length - 1);
    const k = Math.min(leg.radii.length - 2, Math.floor(s));
    const r0 = leg.radii[k] as number;
    const r1 = leg.radii[k + 1] as number;
    return { c: splineAt(leg.bones, u), r: r0 + (r1 - r0) * (s - k) };
  });
}

/** Draw the legs whose side is `far`: the far pair before the body, the near pair after it. */
export function drawLegs(
  ctx: CanvasRenderingContext2D,
  legs: readonly Leg[],
  far: boolean,
  skin: Skin,
  r: number,
  fade: number,
): void {
  if (fade <= 0) return;
  const hazed = far ? hazeSkin(skin, FAR_HAZE, PALETTE.background, 0.6) : skin;
  for (const leg of legs) {
    if (leg.far !== far) continue;
    const rings = legRings(leg);
    const top: Point[] = [];
    const bottom: Point[] = [];
    rings.forEach((ring, j) => {
      const p = (rings[Math.max(0, j - 1)] as { c: Point }).c;
      const q = (rings[Math.min(rings.length - 1, j + 1)] as { c: Point }).c;
      const t = unit({ x: q.x - p.x, y: q.y - p.y }, { x: 1, y: 0 });
      top.push({ x: ring.c.x + t.y * ring.r, y: ring.c.y - t.x * ring.r });
      bottom.push({ x: ring.c.x - t.y * ring.r, y: ring.c.y + t.x * ring.r });
    });
    // No rim: a lit edge round the hip would show the tube's cut end on the flank.
    drawTube(ctx, bodyOf(top, bottom).seen, hazed, fade);
    drawClaws(ctx, leg, r, far ? 0.55 : 1, fade);
  }
}

/** Three hooked claws off the foot, splayed about the way the toes point. */
function drawClaws(
  ctx: CanvasRenderingContext2D,
  leg: Leg,
  r: number,
  lit: number,
  fade: number,
): void {
  const toe = leg.bones.at(-1) as Point;
  const heel = leg.bones.at(-2) as Point;
  const dir = unit({ x: toe.x - heel.x, y: toe.y - heel.y }, { x: -1, y: 0 });
  const w = leg.radii.at(-1) as number;
  ctx.save();
  for (const spread of [-0.55, 0, 0.55]) {
    const c = Math.cos(spread);
    const s = Math.sin(spread);
    const o = { x: dir.x * c - dir.y * s, y: dir.x * s + dir.y * c };
    const len = r * (spread === 0 ? 0.32 : 0.26);
    const root = { x: toe.x + o.x * w * 0.6, y: toe.y + o.y * w * 0.6 };
    const tip = { x: root.x + o.x * len, y: root.y + o.y * len };
    // The hook: the tip curls down, the way a talon closes.
    const bend = {
      x: root.x + o.x * len * 0.6 + o.y * len * 0.3,
      y: root.y + o.y * len * 0.6 - o.x * len * 0.3,
    };
    ctx.fillStyle = faded(PALETTE.rockDark, fade, lit);
    ctx.beginPath();
    ctx.moveTo(root.x - o.y * w, root.y + o.x * w);
    ctx.quadraticCurveTo(bend.x, bend.y, tip.x, tip.y);
    ctx.lineTo(root.x + o.y * w, root.y - o.x * w);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = faded(PALETTE.rock, fade, 0.8 * lit);
    ctx.lineWidth = Math.max(0.6, w * 0.35);
    ctx.beginPath();
    ctx.moveTo(root.x - o.y * w * 0.5, root.y + o.x * w * 0.5);
    ctx.quadraticCurveTo(bend.x, bend.y, tip.x, tip.y);
    ctx.stroke();
  }
  ctx.restore();
}
