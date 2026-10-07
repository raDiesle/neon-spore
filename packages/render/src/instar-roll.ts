import { dot, type Frame, type Vec3 } from "@neon-spore/content";

/**
 * **Where THE INSTAR's back is, part of the way round between its views**
 * (`instar-turning.ts`). Face-on the back is up off every ring; side-on it is
 * whichever way the side view has it, and a spine that leaves the neck running
 * backward has it underneath, so the body rolls a half turn over on the way.
 *
 * The tube's own frames are no help here: they swing about the spine as the
 * spine bends through the turn, so an angle read off them twists the hide
 * wherever the side-on spine stands on end. Instead each ring's whole frame —
 * along, back, flank — is turned from its face-on place to its side-on one as
 * one rotation, the same share of the way as the body, and down the spine
 * each ring turns the same way round as the one before it, so the body never
 * twists against itself and no share of the turn flips it.
 */

type Quat = readonly [number, number, number, number];

/**
 * The back off each of `frames` — the turned body's own, by angle round each
 * ring off its `n` — `k` of the way from `fronts`, whose `n` is the back, to
 * `sides`, whose back is `n` if `upright` and `-n` if not.
 */
export function rolledBack(
  fronts: readonly Frame[],
  sides: readonly Frame[],
  upright: boolean,
  frames: readonly Frame[],
  k: number,
): number[] {
  let last: Quat = [1, 0, 0, 0];
  return frames.map((m, i) => {
    const f = fronts[i] as Frame;
    const s = sides[i] as Frame;
    const n = upright ? s.n : neg(s.n);
    const b = upright ? s.b : neg(s.b);
    let q = quatOf(f, { t: s.t, n, b });
    // The same rotation either sign; the one nearer the last ring's, so the spine turns as one.
    if (q[0] * last[0] + q[1] * last[1] + q[2] * last[2] + q[3] * last[3] < 0)
      q = [-q[0], -q[1], -q[2], -q[3]];
    last = q;
    const back = rotate(partial(q, k), f.n);
    return Math.atan2(dot(back, m.b), dot(back, m.n));
  });
}

function neg(v: Vec3): Vec3 {
  return { x: -v.x, y: -v.y, z: -v.z };
}

/** The rotation that carries frame `a` onto frame `b`, as a unit quaternion `[w, x, y, z]`. */
function quatOf(a: Frame, b: Frame): Quat {
  // R = B·Aᵀ, the columns of each the frame's three axes.
  const r = (row: "x" | "y" | "z", col: "x" | "y" | "z") =>
    b.t[row] * a.t[col] + b.n[row] * a.n[col] + b.b[row] * a.b[col];
  const m00 = r("x", "x");
  const m11 = r("y", "y");
  const m22 = r("z", "z");
  const tr = m00 + m11 + m22;
  let q: [number, number, number, number];
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    q = [
      s / 4,
      (r("z", "y") - r("y", "z")) / s,
      (r("x", "z") - r("z", "x")) / s,
      (r("y", "x") - r("x", "y")) / s,
    ];
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = [
      (r("z", "y") - r("y", "z")) / s,
      s / 4,
      (r("x", "y") + r("y", "x")) / s,
      (r("x", "z") + r("z", "x")) / s,
    ];
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = [
      (r("x", "z") - r("z", "x")) / s,
      (r("x", "y") + r("y", "x")) / s,
      s / 4,
      (r("y", "z") + r("z", "y")) / s,
    ];
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = [
      (r("y", "x") - r("x", "y")) / s,
      (r("x", "z") + r("z", "x")) / s,
      (r("y", "z") + r("z", "y")) / s,
      s / 4,
    ];
  }
  const len = Math.hypot(...q) || 1;
  return [q[0] / len, q[1] / len, q[2] / len, q[3] / len];
}

/** `k` of the way along the rotation `q` from none — the long way round if `q` says so, as the spine chose. */
function partial(q: Quat, k: number): Quat {
  const half = Math.acos(Math.max(-1, Math.min(1, q[0])));
  const s = Math.sin(half);
  if (s < 1e-9) return [1, 0, 0, 0];
  const a = half * k;
  const v = Math.sin(a) / s;
  return [Math.cos(a), q[1] * v, q[2] * v, q[3] * v];
}

/** `v` turned by the unit quaternion `q`. */
function rotate(q: Quat, v: Vec3): Vec3 {
  const [w, x, y, z] = q;
  // t = 2 (q × v); v' = v + w t + q × t
  const tx = 2 * (y * v.z - z * v.y);
  const ty = 2 * (z * v.x - x * v.z);
  const tz = 2 * (x * v.y - y * v.x);
  return {
    x: v.x + w * tx + (y * tz - z * ty),
    y: v.y + w * ty + (z * tx - x * tz),
    z: v.z + w * tz + (x * ty - y * tx),
  };
}
