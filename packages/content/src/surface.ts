import { KEY } from "./light.js";

/**
 * A SURFACE, AND THE ONE LINE THAT PUTS A MARK ON IT.
 *
 * `docs/style-guide.md` states the rule this file exists to make callable:
 * **a body's silhouette is posed; its surface is placed.** The contour may be
 * squashed and leaned by an affine transform, and anything *on* the surface —
 * a pore, a vein, a crater, a lit seam — is positioned by longitude and
 * latitude instead, so a slow turn carries the far ones round into view and
 * the near ones away. The two halves are reachable by different machinery and
 * mixing them up is what makes an attempt read as a coin flipping.
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
 * angular speed crosses fast through the middle and crawls at the limb. That
 * ratio is **22.9 : 1** between the facing meridian and the limb, against the
 * **1.10 : 1** an affine pose manages, which is the measurement that says a
 * pose cannot fake this and nothing about tuning one will help.
 *
 * The `scale(cos α, cos lat)` those give is the tangent plane's own map, so it
 * is right for a feature of **any shape and not only for a dot**: geometry
 * drawn about its own origin in tangent coordinates — east right, south down —
 * foreshortens across its width *and* swings its long axis toward the vertical
 * as the limb approaches, because that is what an anisotropic scale does to a
 * direction. Lay features out in picture coordinates and squash the picture
 * instead and you get the first half only, which reads as a sticker shrinking.
 *
 * **The light does not turn.** `KEY` is fixed and each feature is shaded by its
 * own normal against it, so the lit shoulder stays put while the surface
 * travels under it. `docs/dimensional.md` is the argument that neither half
 * works alone: a squash with no shading is a coin, and a convincing ball that
 * does not move is a still life.
 *
 * **Why it is here, and not in `render`.** The same reason `light.ts` is here,
 * word for word: the projection has to be readable from two places forbidden to
 * reach each other — `tools/director/src/skins/`, which may not import
 * `packages/render`, and `packages/render` itself, which may not import
 * `tools/`. It is arithmetic with no clock, no randomness and no DOM in it, so
 * `purity.test.ts` has nothing to object to; `hashWorld` is untouched, and two
 * devices that disagree about a highlight still agree about the world.
 */

/**
 * How far in front of the body the key light stands. `KEY` is a screen
 * direction with no depth, and without a `z` every feature on the meridian
 * facing us would sit exactly at the terminator and the disc would read half
 * dark.
 */
const KEY_Z = 0.5;
const KEY_LEN = Math.hypot(1, KEY_Z);
const LX = KEY.x / KEY_LEN;
const LY = KEY.y / KEY_LEN;
const LZ = KEY_Z / KEY_LEN;

/**
 * How near the poles a feature may be placed. A patch at `cos(lat) ≈ 0` is a
 * horizontal hairline whatever the rotation does, and reads as a scratch
 * rather than as anything on a surface. Three skins wrote this number out by
 * hand before it moved here.
 */
export const LAT_LIMIT = 0.82;

/**
 * The lambert term for a surface point, clamped at the terminator: 0 in full
 * shadow, 1 square to the light. `sinA` and `cosA` are the sine and cosine of
 * the feature's *apparent* longitude, so this is the one place the rotation and
 * the fixed light meet.
 */
export function surfaceLit(cosLat: number, sinLat: number, sinA: number, cosA: number): number {
  return Math.max(0, cosLat * sinA * LX + sinLat * LY + cosLat * cosA * LZ);
}

/**
 * How much of the light a feature is allowed to lose. `dim` is what is left of
 * it in full shadow: 0 vanishes into the body, 1 ignores the light entirely.
 * A feature that reaches zero at the terminator reads as a hole rather than as
 * a mark, and one that reaches it on every mark makes the far half of a body
 * empty — so the floor is a property of the feature and is set where the
 * feature is authored, never here.
 */
export function surfaceDim(dim: number, lit: number): number {
  return dim + (1 - dim) * lit;
}

/**
 * A place on the surface with everything constant about it worked out once.
 * `k` is `reach·cos(lat)`, the radius of its own circle of latitude, and `cy`
 * is `reach·sin(lat)`, the screen height the rotation never touches.
 */
export interface Pin {
  readonly lon: number;
  readonly cosLat: number;
  readonly sinLat: number;
  readonly k: number;
  readonly cy: number;
}

/** Pin a feature to a longitude and latitude on a ball of radius `reach`. */
export function pin(lon: number, lat: number, reach: number): Pin {
  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  return { lon, cosLat, sinLat, k: reach * cosLat, cy: reach * sinLat };
}

/** Where a pinned feature is this frame, and what the surface does to it. */
export interface Facet {
  /** Where it lands, about the body's own centre. */
  readonly x: number;
  readonly y: number;
  /** The tangent plane's map: `cos α` across, `cos lat` down. */
  readonly sx: number;
  readonly sy: number;
  /** Whether it is on the near hemisphere at all. A far feature is not drawn. */
  readonly near: boolean;
  /** Its own normal against `KEY`, 0 in full shadow and 1 square to the light. */
  readonly lit: number;
}

/**
 * One frame for one feature. Allocating, because a canvas caller places tens of
 * these rather than the hundreds an SVG scatter carries — where the count is
 * high, hold the `Pin`s and read `k`, `cy` and `surfaceLit` directly, which is
 * what `tools/director/src/skins/mounted.ts` does in its own loop.
 */
export function facet(p: Pin, theta: number): Facet {
  const a = p.lon + theta;
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);
  return {
    x: p.k * sinA,
    y: p.cy,
    sx: cosA,
    sy: p.cosLat,
    near: cosA > 0,
    lit: surfaceLit(p.cosLat, p.sinLat, sinA, cosA),
  };
}

/**
 * A vertex of an outline that spans more than one tangent plane, **folded onto
 * the limb** when it goes round the back rather than dropped: `x = ±k`
 * satisfies `x² + y² = reach²` at its own height, so a run of folded vertices
 * *traces* the silhouette between the two crossings — the visible half of a
 * plate with its true boundary, out of one sign. The one outline this cannot
 * express is a closed ring of **constant** latitude, every far vertex of which
 * folds to the same point.
 */
export function limbX(k: number, sinA: number, cosA: number): number {
  return cosA > 0 ? k * sinA : sinA >= 0 ? k : -k;
}
