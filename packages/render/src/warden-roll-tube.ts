import { surfaceLit } from "@neon-spore/content";
import type { WardenSurfaceDraw } from "./warden-surface.js";

/**
 * THE WARDEN's material as a **tube**: the ring read as a torus seen face-on,
 * and the one projection every mark on it is placed by.
 *
 * At a bearing `phi` from the ring's centre the material runs from the hole's
 * edge at `rin` to the body's edge at `rout`. Read as a tube, its cross-section
 * is a circle of radius `rho = (rout − rin) / 2` centred at `rc`, and a point
 * on that circle sits at *tube latitude* `beta`: `+π/2` is the outer edge,
 * `0` the crest facing us, `−π/2` the inner edge on the lip of the hole, and
 * anything past either is round the back and not drawn. Its place on screen
 * is `rc + rho·sin(beta)` out along the bearing; its normal is
 * `(sin β·cos φ, sin β·sin φ, cos β)`.
 *
 * That is the same arithmetic `surface.ts` does for a ball, with the tube's
 * own axis in place of the vertical one, so the light is read by *calling*
 * `surfaceLit` on that normal rather than by writing a dot product against
 * `KEY` here: any unit normal is `(cos lat·sin α, sin lat, cos lat·cos α)` for
 * some latitude and longitude, and the decomposition is three lines.
 *
 * `rout` is read off the contour the body was actually drawn from — the
 * sampled points `warden.ts` hands over — never a radius worked out again
 * here, for the reason `warden-cilia.ts` gives: an edge that wobbles on the
 * wall clock and a shade computed from its own copy of the lobing would
 * breathe a frame out of step.
 */

export interface TubeAt {
  readonly rin: number;
  readonly rout: number;
  /** The crest's radius and the tube's own. */
  readonly rc: number;
  readonly rho: number;
}

/** The tube's section at bearing `phi`. */
export function tubeAt(d: WardenSurfaceDraw, phi: number): TubeAt {
  const { cx, cy, outer, pupilX, pupilR } = d;
  const n = outer.length;
  const j = ((Math.round((phi / (Math.PI * 2)) * n) % n) + n) % n;
  const p = outer[j] as { x: number; y: number };
  const rout = Math.hypot(p.x - cx, p.y - cy);
  // The hole is a circle standing off the ring's centre by `dx`: where a ray
  // at `phi` meets it, by the cosine rule, with the root clamped so a hole slid
  // further than its own radius still gives a width rather than a NaN.
  const dx = pupilX - cx;
  const s = dx * Math.sin(phi);
  const rin = Math.min(
    rout * 0.92,
    dx * Math.cos(phi) + Math.sqrt(Math.max(0, pupilR ** 2 - s * s)),
  );
  return { rin, rout, rc: (rin + rout) / 2, rho: Math.max(1, (rout - rin) / 2) };
}

/** How much light the tube's surface takes at bearing `phi` and tube
 * latitude `beta` — the projection called on the tube's own normal. */
export function tubeLit(phi: number, beta: number): number {
  const sb = Math.sin(beta);
  const nx = sb * Math.cos(phi);
  const ny = sb * Math.sin(phi);
  const nz = Math.cos(beta);
  const cosLat = Math.sqrt(Math.max(1e-6, 1 - ny * ny));
  return surfaceLit(cosLat, ny, nx / cosLat, nz / cosLat);
}

/** Where a point at (`phi`, `beta`) lands on screen. */
export function tubePoint(
  d: WardenSurfaceDraw,
  t: TubeAt,
  phi: number,
  beta: number,
): { x: number; y: number } {
  const rad = t.rc + t.rho * Math.sin(beta);
  return { x: d.cx + Math.cos(phi) * rad, y: d.cy + Math.sin(phi) * rad };
}
