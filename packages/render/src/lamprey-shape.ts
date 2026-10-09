import { LAMPREY_TEETH } from "@neon-spore/sim";
import { swung } from "./lamprey-settle.js";
import type { Layout } from "./layout.js";

/**
 * **THE LAMPREY's shape** (§41, *The look*): two drafts combined, named on the
 * shape sheet. **LIGHT TRACE** is the body, a long lobed eel on a lagging
 * spine that trails from the mouth and tapers to a tail; **BULB
 * · SPIKE** is the mouth, a round sucker ringed with seven hooked teeth.
 *
 * Everything here is geometry in the field's pixels and nothing is read off
 * the world: the pose hands over where the mouth is and how the body bends
 * (`lamprey-pose.ts`), and this turns it into paths.
 */

/** The mouth's radius, in tiles. */
export const MOUTH = 0.95;
/** The body's length from the mouth to the tail, in tiles: short enough to leap about the field. */
const LENGTH = 4.5;
/** The body's half-width at the neck, in tiles, and what is left of it at the tail. */
const NECK = 0.62;
const TAIL = 0.12;
/** The lobes along the body, and how far each swells it. */
const LOBES = 5;
const LOBE = 0.14;
/** The points along the spine. */
const SPINE = 28;
/** Where the teeth sit on the ring, in radii; their fangs are `lamprey-teeth.ts`'s. */
const TOOTH_ROOT = 0.9;
/** The gullet's opening in radii, what each hit takes off it, and the least it shrinks to. */
const GULLET = 0.45;
const GULLET_HIT = 0.08;
const GULLET_LEAST = 0.12;

/** How wide the gullet opens after `hits`, in mouth radii: a step smaller per hit. */
export function lampreyGulletReach(hits: number): number {
  return Math.max(GULLET_LEAST, GULLET - GULLET_HIT * hits);
}

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
  /**
   * While it crawls, the places its head has been, newest first, on the
   * screen: the body is laid along them instead of along `lean`.
   */
  trail?: readonly Point[];
  /**
   * Stopped on a tile it crawled to, how far the body has swung off `trail`
   * onto `lean`: 0 still along the trail, 1 laid along `lean` — and the turn
   * that takes, radians on the screen, decided once so the swing never
   * changes its mind about which way round it goes.
   */
  settle?: number;
  settleTurn?: number;
}

/**
 * The spine, from the neck to the tail: each piece turned a little further
 * than the last, and the turn a wave travelling down it, so the tail lags
 * the head and a crawl ripples away from the mouth.
 */
export function lampreySpine(l: Layout, p: LampreyPose): Point[] {
  if (p.trail === undefined || p.trail.length === 0) return leanSpine(l, p);
  const along = trailSpine(l, p, p.trail);
  const k = p.settle ?? 0;
  return k <= 0 ? along : swung(along, leanSpine(l, p), k, p.settleTurn ?? 0);
}

/** The spine laid along `lean` from the back of the mouth, bending as the wave runs down it. */
function leanSpine(l: Layout, p: LampreyPose): Point[] {
  const seg = (LENGTH * l.tile) / SPINE;
  // The neck leaves the back of the mouth on the side the body lies.
  const neck = p.r * 0.6;
  const out: Point[] = [
    { x: p.x + Math.sin(p.lean) * neck, y: p.y - Math.cos(p.lean) * neck * p.tilt },
  ];
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

/** How far a crawling body swings either side of its trail, in tiles: a worm's wriggle. */
const WRIGGLE = 0.16;

/**
 * The spine of a worm crawling: from the neck back along the places the head
 * has been, a piece at a time, and on past the last of them the way the trail
 * was going — with a wriggle across it that travels down from the mouth.
 */
function trailSpine(l: Layout, p: LampreyPose, trail: readonly Point[]): Point[] {
  const seg = (LENGTH * l.tile) / SPINE;
  const path = [{ x: p.x, y: p.y }, ...trail];
  const out: Point[] = [];
  let leg = 0;
  let from = path[0] ?? p;
  for (let i = 0; i <= SPINE; i++) {
    let want = i === 0 ? p.r * 0.6 : seg;
    while (want > 0) {
      const to = path[leg + 1];
      if (to === undefined) {
        // Past the trail: on along the way it was going.
        const a = path[leg - 1] ?? { x: from.x, y: from.y + 1 };
        const len = Math.hypot(from.x - a.x, from.y - a.y) || 1;
        from = {
          x: from.x + ((from.x - a.x) / len) * want,
          y: from.y + ((from.y - a.y) / len) * want,
        };
        path[leg] = from;
        want = 0;
        break;
      }
      const left = Math.hypot(to.x - from.x, to.y - from.y);
      if (left <= want) {
        want -= left;
        from = to;
        leg += 1;
        continue;
      }
      const k = want / left;
      from = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
      want = 0;
    }
    out.push(from);
  }
  // The wriggle: each point pushed across the body, a wave running tailward.
  return out.map((at, i) => {
    const a = out[Math.max(0, i - 1)] ?? at;
    const b = out[Math.min(out.length - 1, i + 1)] ?? at;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const f = i / SPINE;
    const swing = Math.sin(p.wave * 2 - f * 9) * WRIGGLE * l.tile * Math.min(1, f * 4);
    return { x: at.x - ((b.y - a.y) / len) * swing, y: at.y + ((b.x - a.x) / len) * swing };
  });
}

/** The tail's tip: the spine's last point, where a thumb holds it. */
export function lampreyTailTip(spine: readonly Point[]): Point {
  return spine[spine.length - 1] ?? { x: 0, y: 0 };
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

/** The empty socket a tooth knocked out leaves on the ring. */
export function lampreySocket(p: LampreyPose, t: number): Path2D {
  const at = lampreyToothAt(p, t);
  const r = p.r * 0.13;
  const path = new Path2D();
  path.ellipse(at.x, at.y, r, r * (0.4 + 0.6 * p.tilt), 0, 0, Math.PI * 2);
  return path;
}
