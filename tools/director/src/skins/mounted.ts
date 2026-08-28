import { KEY } from "./light.js";
import { SVG } from "./types.js";

/**
 * The projection every turning skin shares, in one place.
 *
 * A feature sits at a fixed longitude `lon` and latitude `lat` on a ball of
 * radius `reach`; the body's rotation about its vertical axis is `θ`, so its
 * apparent longitude is `α = lon + θ` and it projects to
 *
 *     x = reach·cos(lat)·sin(α)      y = reach·sin(lat)
 *
 * with the far hemisphere — `cos α ≤ 0` — simply not drawn. Differentiating
 * that one line gives the two things the eye reads. **Width:** `dx/dλ =
 * reach·cos(lat)·cos α`, so a patch is full width facing the viewer and nothing
 * at all at the silhouette — it narrows to zero rather than being clipped by an
 * edge, which is the difference between a feature on a surface and a sticker on
 * a disc. **Speed:** `dx/dt` carries the same cosine, so a body at constant
 * angular speed crosses fast through the middle and crawls at the limb.
 *
 * The `scale(cos α, cos lat)` those give is the tangent plane's own map, so it
 * is right for a feature of **any shape and not only for a dot**: geometry
 * drawn about its own origin in tangent coordinates — east right, south down —
 * foreshortens across its width *and* swings its long axis toward the vertical
 * as the limb approaches, because that is what an anisotropic scale does to a
 * direction. Lay features out in picture coordinates and squash the picture
 * instead and you get the first half only, which reads as a sticker shrinking.
 * A feature too large for one tangent plane wants `spinPlates`.
 *
 * The light does not turn. `KEY` is fixed for the page and each feature is
 * shaded by its own normal against it, so the lit shoulder stays put while the
 * surface travels under it — the second half of the read, and
 * `docs/dimensional.md` is the argument that neither half works alone.
 */

/** How far in front of the body the key light stands. `KEY` is a screen
 * direction with no depth, and without a `z` every feature on the meridian
 * facing us would sit exactly at the terminator and the disc read half dark. */
const KEY_Z = 0.5;
const KEY_LEN = Math.hypot(1, KEY_Z);
const LX = KEY.x / KEY_LEN;
const LY = KEY.y / KEY_LEN;
const LZ = KEY_Z / KEY_LEN;

/** Latitudes are kept off the poles: a patch at `cos(lat) ≈ 0` is a horizontal
 * hairline whatever the rotation does, and reads as a scratch. */
export const LAT_LIMIT = 0.82;

/** The lambert term for a surface point, clamped at the terminator. */
function lit(cosLat: number, sinLat: number, sinA: number, cosA: number): number {
  return Math.max(0, cosLat * sinA * LX + sinLat * LY + cosLat * cosA * LZ);
}

/** Show or hide, writing only on the transition, so a card whose back half is
 * quiet writes nothing for it. Answers whether the caller should go on. */
function toggle(m: { readonly el: SVGElement; shown: boolean }, near: boolean): boolean {
  if (near !== m.shown) {
    if (near) m.el.removeAttribute("display");
    else m.el.setAttribute("display", "none");
    m.shown = near;
  }
  return near;
}

/** A feature pinned to the surface: where it sits, and what does not change. */
export interface Mounted {
  /** The feature's own geometry, drawn about its origin in tangent units. */
  readonly el: SVGGElement;
  readonly lon: number;
  readonly cosLat: number;
  readonly sinLat: number;
  /** `reach·cos(lat)`, the radius of its own circle of latitude, and
   * `reach·sin(lat)`, the screen height the rotation never touches. */
  readonly k: number;
  readonly cy: number;
  /** What is left of it in full shadow: 0 vanishes, 1 ignores the light. */
  readonly dim: number;
  shown: boolean;
}

/** Pin one built group to a longitude and latitude. Everything constant about
 * the projection is worked out here, once, and never again in the loop. */
export function mount(
  el: SVGGElement,
  lon: number,
  lat: number,
  reach: number,
  dim: number,
): Mounted {
  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  return { el, lon, cosLat, sinLat, k: reach * cosLat, cy: reach * sinLat, dim, shown: true };
}

/**
 * One frame of rotation: position, foreshortening and shading for every
 * feature. Two attributes each and no allocation but the strings SVG insists
 * on. A feature whose `dim` is 1 writes one attribute rather than two — its
 * opacity would be 1 every frame, and a scatter carries hundreds of these.
 */
export function spin(list: readonly Mounted[], theta: number): void {
  for (const m of list) {
    const a = m.lon + theta;
    const c = Math.cos(a);
    if (!toggle(m, c > 0)) continue;
    const s = Math.sin(a);
    m.el.setAttribute(
      "transform",
      `translate(${(m.k * s).toFixed(2)} ${m.cy.toFixed(2)}) scale(${c.toFixed(4)} ${m.cosLat.toFixed(4)})`,
    );
    if (m.dim >= 1) continue;
    m.el.setAttribute("opacity", (m.dim + (1 - m.dim) * lit(m.cosLat, m.sinLat, s, c)).toFixed(3));
  }
}

/**
 * A feature too large for one tangent plane: an outline carried round vertex by
 * vertex, because a carapace plate spans most of a hemisphere and one `scale()`
 * about its centre would read as a card glued to a ball. The `d` is rebuilt
 * each frame — a string per plate, no element or gradient made in the loop.
 */
export interface Plate {
  readonly el: SVGPathElement;
  /** Vertex longitudes, and `reach·cos(lat)`/`reach·sin(lat)` per vertex, in
   * order round the outline. */
  readonly lon: Float64Array;
  readonly k: Float64Array;
  readonly cy: Float64Array;
  /** The plate's own centre, which is what the light is measured against. */
  readonly cLon: number;
  readonly cosLat: number;
  readonly sinLat: number;
  readonly dim: number;
  shown: boolean;
}

/** Pin an outline, given as `[lon, lat]` pairs, and a centre to shade it by. */
export function mountPlate(
  el: SVGPathElement,
  verts: readonly (readonly [number, number])[],
  centre: readonly [number, number],
  reach: number,
  dim: number,
): Plate {
  const n = verts.length;
  const lon = new Float64Array(n);
  const k = new Float64Array(n);
  const cy = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const v = verts[i]!;
    lon[i] = v[0];
    k[i] = reach * Math.cos(v[1]);
    cy[i] = reach * Math.sin(v[1]);
  }
  const cosLat = Math.cos(centre[1]);
  const sinLat = Math.sin(centre[1]);
  return { el, lon, k, cy, cLon: centre[0], cosLat, sinLat, dim, shown: true };
}

/**
 * One frame for plates. A far vertex is **folded onto the limb** rather than
 * dropped: `x = ±reach·cos(lat)` satisfies `x² + y² = reach²`, so it lands on
 * the silhouette circle at its own height, and a run of folded vertices
 * therefore *traces* the silhouette between the two crossings — the visible
 * half of a plate with its true boundary, out of one sign. The one outline this
 * cannot express is a closed ring of **constant** latitude, every far vertex of
 * which folds to the same point; that is why `carapace.ts` builds gores that
 * reach the pole and not a cap.
 */
export function spinPlates(list: readonly Plate[], theta: number): void {
  for (const p of list) {
    let d = "";
    let near = false;
    for (let i = 0; i < p.lon.length; i++) {
      const a = p.lon[i]! + theta;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      if (cosA > 0) near = true;
      const k = p.k[i]!;
      const x = cosA > 0 ? k * sinA : sinA >= 0 ? k : -k;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${p.cy[i]!.toFixed(2)}`;
    }
    if (!toggle(p, near)) continue;
    p.el.setAttribute("d", `${d}Z`);
    const a = p.cLon + theta;
    const lam = lit(p.cosLat, p.sinLat, Math.sin(a), Math.cos(a));
    p.el.setAttribute("opacity", (p.dim + (1 - p.dim) * lam).toFixed(3));
  }
}

/** Gradient stops, since `light.ts` keeps its own copy private. */
export function stops(
  grad: SVGElement,
  list: readonly (readonly [number, string, number])[],
): void {
  for (const [offset, colour, alpha] of list) {
    const stop = document.createElementNS(SVG, "stop");
    stop.setAttribute("offset", `${(offset * 100).toFixed(2)}%`);
    stop.setAttribute("stop-color", colour);
    stop.setAttribute("stop-opacity", alpha.toFixed(3));
    grad.appendChild(stop);
  }
}

/** A place on the surface, and which way is "away from the crown" there. */
export interface Place {
  readonly lon: number;
  readonly lat: number;
  /** Tangent bearing: 0 is east, `+π/2` is toward the south pole. */
  readonly bearing: number;
}

const STEP = 1e-4;

function along(c: number, psi: number): { lon: number; lat: number } {
  const s = Math.sin(c);
  return {
    lat: Math.asin(Math.max(-1, Math.min(1, s * Math.sin(psi)))),
    lon: Math.atan2(s * Math.cos(psi), Math.cos(c)),
  };
}

/**
 * Read a point of a **flat** scatter as a place on the sphere, so a skin's own
 * seeded layout is lifted rather than rewritten. The map is Lambert azimuthal
 * equal-area about the point facing the viewer at rest — `ρ = span·sin(c/2)`,
 * so a disc of radius `span` is the whole sphere and **area is preserved
 * exactly**: a scatter uniform in the picture is uniform on the ball, and a
 * density field in picture units keeps its weight. Being azimuthal, a straight
 * line through the scatter's origin comes out a great circle, which is why
 * `sucker.ts`'s spine wraps the body instead of ending at the edge of a disc.
 * `null` for a point off the map, or one landing too near a pole.
 */
export function lift(x: number, y: number, span: number): Place | null {
  const rho = Math.hypot(x, y);
  if (rho > span) return null;
  const psi = Math.atan2(y, x);
  const c = 2 * Math.asin(Math.min(1, rho / span));
  const here = along(c, psi);
  if (Math.abs(Math.sin(here.lat)) > LAT_LIMIT) return null;
  const next = along(c + STEP, psi);
  const dLon = next.lon - here.lon;
  const bearing = Math.atan2(
    next.lat - here.lat,
    Math.atan2(Math.sin(dLon), Math.cos(dLon)) * Math.cos(here.lat),
  );
  return { lon: here.lon, lat: here.lat, bearing };
}
