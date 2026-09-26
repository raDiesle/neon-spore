import {
  addScaled,
  cross,
  dot,
  type Seen,
  see,
  turn,
  unit,
  type Vec3,
  type View,
} from "./solid.js";
import { keyLit } from "./surface.js";

/**
 * A LONG PART OF A RIG: a body, a neck, a tail — a spine of rings.
 *
 * `solid.ts` turns points; this turns a tube, which is the shape most of a
 * boss is made of and the one a flat drawing gets most wrong. Three things a
 * tube needs that a point does not:
 *
 * - **Its outline in any view.** Side-on it is two long edges; end-on it is a
 *   circle; between, it is the edges of every ring's projection. For a ring of
 *   radius `r` whose spine runs along screen direction `t`, the outline lies
 *   `r` out along the screen perpendicular of `t` — exact for an orthographic
 *   view, and the lens's own scale corrects it for a perspective one.
 * - **Its light across its width**, which is not a flat drawing's
 *   top-to-bottom ramp: the normal under a point `k` of the way from one edge
 *   to the other is `k·E + √(1-k²)·F`, where `E` is the edge's own normal and
 *   `F` the one facing the viewer — so the section is lit as the cylinder it
 *   is, from any side, with the light where it always is.
 * - **A frame to place things on.** A spine's rings carry a normal and a
 *   binormal that do not twist from one ring to the next (the double
 *   reflection, a rotation-minimising frame), so a ridge, a row of lamps or a
 *   seam placed at an angle round the body stays at that angle along it and
 *   goes round the back when the body turns.
 */

/** One ring of a tube, in model space. */
export interface Ring {
  readonly c: Vec3;
  readonly r: number;
}

/** A ring's frame: the spine's direction and two normals round it. */
export interface Frame {
  readonly t: Vec3;
  readonly n: Vec3;
  readonly b: Vec3;
}

/**
 * The frames along a spine. The first ring's normal is the model's `-y` — the
 * back, for a body authored lying down — so angle 0 round a ring is the top
 * of it and `π/2` the flank toward the viewer (`b`).
 */
export function tubeFrames(rings: readonly Ring[]): Frame[] {
  const n = rings.length;
  const tangent = (i: number): Vec3 => {
    const a = (rings[Math.max(0, i - 1)] as Ring).c;
    const c = (rings[Math.min(n - 1, i + 1)] as Ring).c;
    return unit({ x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }, { x: 1, y: 0, z: 0 });
  };
  const t0 = tangent(0);
  const up = { x: 0, y: -1, z: 0 };
  let nrm = unit(addScaled(up, t0, -dot(up, t0)), { x: 0, y: 0, z: 1 });
  const frames: Frame[] = [{ t: t0, n: nrm, b: cross(t0, nrm) }];
  for (let i = 1; i < n; i++) {
    const p0 = (rings[i - 1] as Ring).c;
    const p1 = (rings[i] as Ring).c;
    const prev = frames[i - 1] as Frame;
    const v1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
    const c1 = dot(v1, v1);
    if (c1 < 1e-12) {
      frames.push(prev);
      continue;
    }
    const rL = addScaled(prev.n, v1, (-2 / c1) * dot(v1, prev.n));
    const tL = addScaled(prev.t, v1, (-2 / c1) * dot(v1, prev.t));
    const ti = tangent(i);
    const v2 = { x: ti.x - tL.x, y: ti.y - tL.y, z: ti.z - tL.z };
    const c2 = dot(v2, v2);
    nrm = unit(c2 < 1e-12 ? rL : addScaled(rL, v2, (-2 / c2) * dot(v2, rL)), prev.n);
    frames.push({ t: ti, n: nrm, b: cross(ti, nrm) });
  }
  return frames;
}

/** A point on a ring's surface, `angle` round it from the top, `lift` radii out. */
export function onRing(ring: Ring, frame: Frame, angle: number, lift = 0): Vec3 {
  const k = ring.r * (1 + lift);
  const c = Math.cos(angle) * k;
  const s = Math.sin(angle) * k;
  return {
    x: ring.c.x + frame.n.x * c + frame.b.x * s,
    y: ring.c.y + frame.n.y * c + frame.b.y * s,
    z: ring.c.z + frame.n.z * c + frame.b.z * s,
  };
}

/** The surface's normal at `angle` round a ring, in model space. */
export function ringNormal(frame: Frame, angle: number): Vec3 {
  return addScaled(
    {
      x: frame.n.x * Math.cos(angle),
      y: frame.n.y * Math.cos(angle),
      z: frame.n.z * Math.cos(angle),
    },
    frame.b,
    Math.sin(angle),
  );
}

/** A ring as the view sees it: its centre, its two outline points, and its light across. */
export interface SeenRing {
  readonly c: Seen;
  /** The outline on the `E` side and the one opposite it, in screen space. */
  readonly left: { readonly x: number; readonly y: number };
  readonly right: { readonly x: number; readonly y: number };
  /** The screen radius, lens included. */
  readonly r: number;
  /** The edge's normal in the view — the screen perpendicular of the spine. */
  readonly e: Vec3;
  /** The normal facing the viewer. */
  readonly f: Vec3;
  /** How far the spine points at the viewer here, -1..1: the tube's end-on-ness. */
  readonly tz: number;
}

/** A tube's rings seen in a view. */
export function seeTube(rings: readonly Ring[], frames: readonly Frame[], w: View): SeenRing[] {
  let last = { x: 0, y: -1 };
  return rings.map((ring, i) => {
    const c = see(ring.c, w);
    const t = turn((frames[i] as Frame).t, w);
    const len = Math.hypot(t.x, t.y);
    // End-on the spine has no screen direction; keep the last one, so the
    // outline does not spin as the tube swings through pointing at the eye.
    if (len > 1e-3) last = { x: -t.y / len, y: t.x / len };
    const e = { x: last.x, y: last.y, z: 0 };
    const f = unit(addScaled({ x: 0, y: 0, z: 1 }, t, -t.z));
    const r = ring.r * c.s;
    return {
      c,
      left: { x: c.x + e.x * r, y: c.y + e.y * r },
      right: { x: c.x - e.x * r, y: c.y - e.y * r },
      r,
      e,
      f,
      tz: t.z,
    };
  });
}

/**
 * The light across a seen ring, at `ks` running -1 (the `right` edge) to 1
 * (the `left`). One number per sample, 0..1, for a gradient drawn from
 * `right` to `left` to read at `(k + 1) / 2`.
 */
export function ringLight(ring: SeenRing, ks: readonly number[]): number[] {
  const { across, facing } = ringSection(ring);
  return sectionLight(across, facing, ks);
}

/**
 * The two numbers a ring's light depends on: how much of the key falls along
 * its width (`e`) and how much on its face (`f`). A section is lit as a
 * cylinder, so every sample across it is a blend of these two — which is what
 * lets a renderer key a cache on them rather than on the nine samples.
 */
export function ringSection(ring: SeenRing): { across: number; facing: number } {
  const dot = (v: Vec3) => keyLit(v.x, v.y, v.z) - keyLit(-v.x, -v.y, -v.z);
  return { across: dot(ring.e), facing: dot(ring.f) };
}

/** `ringLight` from the two numbers `ringSection` gives. */
export function sectionLight(across: number, facing: number, ks: readonly number[]): number[] {
  return ks.map((k) => Math.max(0, across * k + facing * Math.sqrt(Math.max(0, 1 - k * k))));
}
