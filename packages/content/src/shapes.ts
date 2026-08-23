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
    let m = 1 + depth * Math.cos(sides * a * 0.5 + seed);
    m *= 1 + wobble * Math.sin(a * 2 + t * 0.4 + seed);
    pts.push({ x: cx + Math.cos(a) * rx * m, y: cy + Math.sin(a) * ry * m });
  }
  let d = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
  for (let i = 1; i < pts.length; i++) {
    d += `L ${pts[i]!.x.toFixed(2)} ${pts[i]!.y.toFixed(2)} `;
  }
  return `${d}Z`;
}

/**
 * Gaussian bump used to deform the hull. The bump rises to full `strength`
 * over a `plateau` range and falls back to 0 over a `shoulder` range on each
 * side, so the derivative is always 0 at the edges (no kinks).
 *
 * Used by both the cannon and shield lobes, which are bumps on the hull contour
 * at a controllable angle.
 */
export function bumpAdd(diff: number, strength: number, plateau: number, shoulder: number): number {
  const ad = Math.abs(diff);
  if (ad <= plateau) return strength;
  const total = plateau + shoulder;
  if (ad >= total) return 0;
  const local = (ad - plateau) / shoulder;
  return strength * 0.5 * (1 + Math.cos(Math.PI * local));
}

/**
 * Radius multiplier for the hull at angle `a`. This combines the base lobes,
 * the wobble (three frequency layers), and optional bumps (cannon, shield).
 * Returns a value to multiply the nominal radius by.
 */
export function hullRadiusMul(
  a: number,
  lobes: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
  bumps?: Bump[],
): number {
  let m = 1 + depth * Math.cos(lobes * a + seed);
  m *= 1 + wobble * Math.sin(a * 3 + t * 0.9 + seed * 1.7);
  m *= 1 + wobble * 0.6 * Math.sin(a * 5 - t * 0.53 + seed * 2.3);
  m *= 1 + wobble * 0.4 * Math.sin(a * 2 + t * 0.31 + seed * 0.6);
  m *= 1 + 0.02 * Math.sin(t * 0.6 + seed);
  if (bumps) {
    for (const b of bumps) {
      let diff = a - b.angle;
      // Wrap to ±π so the bump doesn't split at the seam
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      m += bumpAdd(diff, b.strength, b.plateau, b.shoulder);
    }
  }
  return m;
}

/**
 * A point on the hull contour at angle `a`. The hull is an ellipse at
 * (hullCx, hullCy) with semi-axes (hullRx, hullRy), deformed by lobes and
 * animated by wobble and time.
 */
export function hullPointAt(
  a: number,
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
  const m = hullRadiusMul(a, lobes, depth, wobble, t, seed, bumps);
  return { x: cx + Math.cos(a) * rx * m, y: cy + Math.sin(a) * ry * m };
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
