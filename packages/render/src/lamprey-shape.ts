import { LAMPREY_TEETH } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * **THE LAMPREY's shape** (§41, *The look*): two drafts combined, named on the
 * shape sheet. **LIGHT TRACE** is the body, a long lobed eel on a lagging
 * spine that trails up the field from the mouth and tapers to a tail; **BULB
 * · SPIKE** is the mouth, a round sucker ringed with seven hooked teeth.
 *
 * Everything here is geometry in the field's pixels and nothing is read off
 * the world: the pose hands over where the mouth is and how the body bends
 * (`lamprey-pose.ts`), and this turns it into paths.
 */

/** The mouth's radius, in tiles. */
export const MOUTH = 0.95;
/** The body's length from the mouth to the tail, in tiles. */
const LENGTH = 7.5;
/** The body's half-width at the neck, in tiles, and what is left of it at the tail. */
const NECK = 0.62;
const TAIL = 0.12;
/** The lobes along the body, and how far each swells it. */
const LOBES = 5;
const LOBE = 0.14;
/** The points along the spine. */
const SPINE = 28;
/** Where the teeth sit on the ring, in radii, and how far in their hooks reach. */
const TOOTH_ROOT = 0.9;
const TOOTH_TIP = 0.52;
/** A tooth's root, as a share of the gap between two. */
const TOOTH_WIDE = 0.42;

export interface Point {
  x: number;
  y: number;
}

/** Where the eel is this frame: everything the paths are cut from. */
export interface LampreyPose {
  /** The mouth's middle. */
  x: number;
  y: number;
  /** The mouth's radius, in pixels. */
  r: number;
  /** The mouth seen from above: 1 full-face, small flattened onto the hull. */
  tilt: number;
  /** Which way the body leaves the mouth, radians from straight up the field. */
  lean: number;
  /** How hard the body bends, and where along it the bend has travelled to. */
  curve: number;
  wave: number;
  /** Limp and falling away: 0 alive, 1 spent. */
  spent: number;
}

/**
 * The spine, from the neck to the tail: each piece turned a little further
 * than the last, and the turn a wave travelling down it, so the tail lags
 * the head and a crawl ripples away from the mouth.
 */
export function lampreySpine(l: Layout, p: LampreyPose): Point[] {
  const seg = (LENGTH * l.tile) / SPINE;
  const out: Point[] = [{ x: p.x, y: p.y - p.r * p.tilt * 0.6 }];
  let x = out[0]?.x ?? p.x;
  let y = out[0]?.y ?? p.y;
  for (let i = 1; i <= SPINE; i++) {
    const f = i / SPINE;
    const turn = p.lean + Math.sin(p.wave - f * 4.2) * p.curve * (0.25 + f) + p.spent * f * 0.9;
    x += Math.sin(turn) * seg;
    y -= Math.cos(turn) * seg;
    out.push({ x, y });
  }
  return out;
}

/** The body's half-width at `f` along it, 0 the neck: tapering, swollen in lobes. */
export function lampreyWidth(l: Layout, f: number): number {
  const taper = NECK + (TAIL - NECK) * f ** 1.4;
  return taper * l.tile * (1 + LOBE * Math.abs(Math.sin(f * Math.PI * LOBES)));
}

/** The body: one closed path down one side of the spine and back up the other. */
export function lampreyBody(l: Layout, spine: readonly Point[]): Path2D {
  const left: Point[] = [];
  const right: Point[] = [];
  const n = spine.length - 1;
  for (let i = 0; i <= n; i++) {
    const at = spine[i] ?? { x: 0, y: 0 };
    const a = spine[Math.max(0, i - 1)] ?? at;
    const b = spine[Math.min(n, i + 1)] ?? at;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const w = lampreyWidth(l, i / n);
    left.push({ x: at.x - (dy / len) * w, y: at.y + (dx / len) * w });
    right.push({ x: at.x + (dy / len) * w, y: at.y - (dx / len) * w });
  }
  const path = new Path2D();
  const all = [...left, ...right.reverse()];
  const first = all[0] ?? { x: 0, y: 0 };
  path.moveTo(first.x, first.y);
  for (let i = 1; i < all.length; i++) {
    const p = all[i] ?? first;
    const q = all[i + 1] ?? p;
    path.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
  }
  path.closePath();
  return path;
}

/** The mouth's ring at `reach` radii, flattened by its tilt. */
export function lampreyRing(p: LampreyPose, reach: number): Path2D {
  const path = new Path2D();
  path.ellipse(p.x, p.y, p.r * reach, p.r * reach * p.tilt, 0, 0, Math.PI * 2);
  return path;
}

/** Where tooth `t` stands round the ring at `reach` radii, the first at the top. */
export function lampreyToothAt(p: LampreyPose, t: number, reach = TOOTH_ROOT): Point {
  const a = -Math.PI / 2 + (t * Math.PI * 2) / LAMPREY_TEETH;
  return { x: p.x + p.r * reach * Math.cos(a), y: p.y + p.r * reach * p.tilt * Math.sin(a) };
}

/** Tooth `t`: a spike hooked in toward the gullet, its root on the ring. */
export function lampreyTooth(p: LampreyPose, t: number): Path2D {
  const gap = (Math.PI * 2) / LAMPREY_TEETH;
  const a = -Math.PI / 2 + t * gap;
  const at = (angle: number, reach: number): Point => ({
    x: p.x + p.r * reach * Math.cos(angle),
    y: p.y + p.r * reach * p.tilt * Math.sin(angle),
  });
  const l = at(a - gap * TOOTH_WIDE * 0.5, TOOTH_ROOT);
  const r = at(a + gap * TOOTH_WIDE * 0.5, TOOTH_ROOT);
  const tip = at(a + gap * 0.22, TOOTH_TIP);
  const bow = at(a - gap * 0.08, (TOOTH_ROOT + TOOTH_TIP) / 2);
  const path = new Path2D();
  path.moveTo(l.x, l.y);
  path.quadraticCurveTo(bow.x, bow.y, tip.x, tip.y);
  path.lineTo(r.x, r.y);
  path.closePath();
  return path;
}

/** The empty socket a tooth knocked out leaves on the ring. */
export function lampreySocket(p: LampreyPose, t: number): Path2D {
  const at = lampreyToothAt(p, t);
  const r = p.r * 0.13;
  const path = new Path2D();
  path.ellipse(at.x, at.y, r, r * (0.4 + 0.6 * p.tilt), 0, 0, Math.PI * 2);
  return path;
}
