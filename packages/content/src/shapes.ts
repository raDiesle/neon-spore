/**
 * Contour generation for hull and creatures. These pure functions take
 * parameters and time, return SVG path strings, and work identically on both
 * Canvas 2D (via new Path2D(d)) and SVG.
 *
 * Ported from legacy/style-guide.html without changes to the math.
 */

/**
 * Catmull-Rom spline through a closed loop of points. Returns an SVG path
 * string with Bezier curves.
 */
export function catmullRomToBezierPath(pts: Point[]): string {
  const n = pts.length;
  let d = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return `${d}Z`;
}

/**
 * Catmull-Rom spline through an open path of points (not closed). The spline
 * is clamped at the start and end.
 */
export function openSmoothPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return d;
}

/**
 * An SVG circle drawn as two semicircles (for use with SVG fill-rule evenodd).
 * Used to cut a hole in the hull for the fire opening.
 */
export function circleSubpath(cx: number, cy: number, r: number): string {
  return (
    `M ${(cx - r).toFixed(2)} ${cy.toFixed(2)} ` +
    `A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(cx + r).toFixed(2)} ${cy.toFixed(2)} ` +
    `A ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(cx - r).toFixed(2)} ${cy.toFixed(2)} Z `
  );
}

/**
 * A blob with lobes, wobble and time-based animation. Creatures use this.
 * Parameters are bioluminescent — the same ones that tune a creature in the
 * style guide.
 */
export function blobPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lobes: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
  N = 40,
): string {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    let m = 1 + depth * Math.cos(lobes * a + seed);
    m *= 1 + wobble * Math.sin(a * 3 + t * 0.9 + seed * 1.7);
    m *= 1 + wobble * 0.6 * Math.sin(a * 5 - t * 0.53 + seed * 2.3);
    m *= 1 + wobble * 0.4 * Math.sin(a * 2 + t * 0.31 + seed * 0.6);
    m *= 1 + 0.02 * Math.sin(t * 0.6 + seed);
    pts.push({ x: cx + Math.cos(a) * rx * m, y: cy + Math.sin(a) * ry * m });
  }
  return catmullRomToBezierPath(pts);
}

/**
 * Radius multiplier for a crystal facet at angle `a`. Split out for the same
 * reason as `hullRadiusMul`: the shape tools measure a silhouette by calling
 * this, so a facet cannot mean one thing in the game and another on the sheet.
 */
export function crystalRadiusMul(
  a: number,
  sides: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
): number {
  let m = 1 + depth * Math.cos(sides * a * 0.5 + seed);
  m *= 1 + wobble * Math.sin(a * 2 + t * 0.4 + seed);
  return m;
}

/**
 * A crystal with angular facets instead of curves. Meteors in free flight would
 * use this; the raster prototype uses a geometrically simple meteor, so this is
 * prepared for later use.
 */
export function crystalPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  sides: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
): string {
  const pts: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const m = crystalRadiusMul(a, sides, depth, wobble, t, seed);
    pts.push({ x: cx + Math.cos(a) * rx * m, y: cy + Math.sin(a) * ry * m });
  }
  let d = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
  for (let i = 1; i < pts.length; i++) {
    d += `L ${pts[i]!.x.toFixed(2)} ${pts[i]!.y.toFixed(2)} `;
  }
  return `${d}Z`;
}

/**
 * Bump used to deform the hull. It holds full `strength` over a `plateau` range
 * and falls back to 0 over a `shoulder` range on each side.
 *
 * The falloff is a smootherstep, not a raised cosine: both leave the slope at 0
 * where the lobe meets the hull, but the cosine still turns a corner in
 * curvature there, and on a membrane that corner is visible as a crease at the
 * foot of the lobe. Smootherstep flattens the second derivative as well, so the
 * lobe grows out of the surface instead of being set down on it.
 *
 * Used by both the cannon and shield lobes, which are bumps on the hull contour
 * at a controllable angle.
 */
export function bumpAdd(diff: number, strength: number, plateau: number, shoulder: number): number {
  const ad = Math.abs(diff);
  if (ad <= plateau) return strength;
  const total = plateau + shoulder;
  if (ad >= total) return 0;
  const u = (ad - plateau) / shoulder;
  return strength * (1 - u * u * u * (u * (u * 6 - 15) + 10));
}

/**
 * Radius multiplier for the hull at angle `a`. This combines the base lobes and
 * the wobble (three frequency layers). Returns a value to multiply the nominal
 * radius by.
 *
 * Bumps are deliberately *not* part of it: they lift the surface straight up
 * (`bumpLift`), not outwards along the radius. See `hullPointAtX`.
 */
export function hullRadiusMul(
  a: number,
  lobes: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
): number {
  let m = 1 + depth * Math.cos(lobes * a + seed);
  m *= 1 + wobble * Math.sin(a * 3 + t * 0.9 + seed * 1.7);
  m *= 1 + wobble * 0.6 * Math.sin(a * 5 - t * 0.53 + seed * 2.3);
  m *= 1 + wobble * 0.4 * Math.sin(a * 2 + t * 0.31 + seed * 0.6);
  m *= 1 + 0.02 * Math.sin(t * 0.6 + seed);
  return m;
}

/**
 * How far the bumps lift the surface at angle `a`, in units of `ry`.
 *
 * The lift is vertical, and that is the whole point. Added to the radius
 * instead, a bump would push the surface *outwards along the ellipse*, so the
 * further a lobe sits from the apex the more it would lean and stretch
 * sideways — the cannon would no longer stand above the column it fires from.
 * Straight up means the lobe looks the same in the middle of the hull as it
 * does at either edge, and its tip is always directly above its base.
 */
export function bumpLift(a: number, bumps?: Bump[]): number {
  if (!bumps) return 0;
  let lift = 0;
  for (const b of bumps) {
    // Wrap to ±π so the bump doesn't split at the seam
    const diff = Math.atan2(Math.sin(a - b.angle), Math.cos(a - b.angle));
    lift += bumpAdd(diff, b.strength, b.plateau, b.shoulder);
  }
  return lift;
}

/**
 * The hull surface directly above a screen `x`.
 *
 * The hull is a height field, not a closed contour: only the arc around the
 * apex is ever in view, and every lobe has to stand exactly above the column it
 * belongs to. Taking the angle as the parameter and reading x back off it does
 * not do that — the lobe depth multiplies the radius, so it slides the point
 * sideways by as much as `depth * (x - cx)`, and a cannon at the edge of the
 * field ends up leaning towards the middle of it. So x is the parameter, and
 * the lobes, the wobble and the bumps only ever move the surface up and down.
 *
 * The ellipse is at (cx, cy) with semi-axes (rx, ry); the angle is derived from
 * x, which is what keeps the mapping linear. Bumps lift straight up.
 */
export function hullPointAtX(
  x: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lobes: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
  bumps?: Bump[],
): Point {
  const a = -Math.PI / 2 + (x - cx) / rx;
  const m = hullRadiusMul(a, lobes, depth, wobble, t, seed);
  const lift = bumpLift(a, bumps) * ry;
  return { x, y: cy + Math.sin(a) * ry * m - lift };
}

/** The angle a screen `x` sits at on a hull centred at `cx` with radius `rx`. */
export function hullAngleAtX(x: number, cx: number, rx: number): number {
  return -Math.PI / 2 + (x - cx) / rx;
}

export interface Point {
  x: number;
  y: number;
}

export interface Bump {
  /** Angle on the hull where the bump centre sits. */
  angle: number;
  /** Peak strength of the bump at the centre. */
  strength: number;
  /** How wide the full-strength plateau is. */
  plateau: number;
  /** How wide the falloff shoulder is on each side. */
  shoulder: number;
}
