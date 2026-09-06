/**
 * Contour generation for hull and creatures. These pure functions take
 * parameters and time, return SVG path strings, and work identically on both
 * Canvas 2D (via new Path2D(d)) and SVG.
 *
 * Ported from legacy/style-guide.html without changes to the math.
 */

/**
 * A Catmull-Rom spline as the cubic Beziers it is made of: after the start
 * point, six numbers per curve — `c1x, c1y, c2x, c2y, x, y` — in one flat
 * array. `closed` wraps the loop round; open clamps the tangent at each end.
 *
 * **The one place the control points are worked out**, and the reason it is
 * numbers rather than text. A canvas never wanted a string: every site in
 * `render/` handed one straight to `new Path2D(...)`, which parsed the decimal
 * back into the numbers it had just been made from — 840 `toFixed(2)` calls and
 * a five-thousand-character string per hull, on every frame of every wave.
 * `packages/render/src/spline.ts` walks these numbers into a `Path2D` with
 * `bezierCurveTo` instead. The two functions below still format them for the
 * things that genuinely want an SVG `d`: `tools/shape-sheet`, the menu's
 * wordmark, and every contour that reaches a real `<path>` element.
 */
export function catmullRomSegments(pts: Point[], closed: boolean): number[] {
  const n = pts.length;
  const out: number[] = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = closed ? pts[(i - 1 + n) % n]! : pts[i === 0 ? 0 : i - 1]!;
    const p1 = pts[i]!;
    const p2 = closed ? pts[(i + 1) % n]! : pts[i + 1]!;
    const p3 = closed ? pts[(i + 2) % n]! : pts[i + 2 < n ? i + 2 : i + 1]!;
    out.push(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    );
  }
  return out;
}

/** The segments above written out as `C` commands, two decimals apiece. */
function curveText(seg: number[]): string {
  let d = "";
  for (let i = 0; i < seg.length; i += 6) {
    d += `C ${seg[i]!.toFixed(2)} ${seg[i + 1]!.toFixed(2)}, ${seg[i + 2]!.toFixed(2)} ${seg[i + 3]!.toFixed(2)}, ${seg[i + 4]!.toFixed(2)} ${seg[i + 5]!.toFixed(2)} `;
  }
  return d;
}

/**
 * Catmull-Rom spline through a closed loop of points. Returns an SVG path
 * string with Bezier curves.
 */
export function catmullRomToBezierPath(pts: Point[]): string {
  const head = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
  return `${head}${curveText(catmullRomSegments(pts, true))}Z`;
}

/**
 * Catmull-Rom spline through an open path of points (not closed). The spline
 * is clamped at the start and end.
 */
export function openSmoothPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  const head = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
  return head + curveText(catmullRomSegments(pts, false));
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
/**
 * Radius multiplier for a blob contour at angle `a`. Split out for the same
 * reason as `crystalRadiusMul`: anything that needs the outline itself rather
 * than a finished path string — the shape tools measuring a silhouette, the
 * queen's mark morphing one creature into another by interpolating two of
 * these — calls this, so a lobe cannot mean one thing in the game and
 * another wherever it is measured or blended.
 */
export function blobRadiusMul(
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
    const m = blobRadiusMul(a, lobes, depth, wobble, t, seed);
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

export interface Point {
  x: number;
  y: number;
}
