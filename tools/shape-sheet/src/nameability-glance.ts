import type { Pose } from "@neon-spore/content";

/**
 * **One posed contour, measured on the three axes through every way its
 * glance can turn it** — split out of `nameability.ts` the day the owner asked
 * for every enemy to glance as the bosses do, *within the naming gate*, so
 * each kind stays its own word (14 October 2026).
 *
 * A glance with a `hold` of 0 (`render/glance.ts`) turns a body about its
 * centre: on the screen, after its pose has scaled and rotated it, the half
 * the middle swings toward opens by `1 + swing` and the other closes by
 * `1 - swing`, and then the whole rolls. A turn about the centre leaves the
 * box's height alone and its width nearly so; what it can move is the lobe
 * profile — one half's lobes bunched, the other's spread — and the roll moves
 * the box.
 *
 * **A whole COCK round, as its envelope.** COCK swings once a round and
 * cocks two, three or four times in it (`render/glance-temper.ts`), on a
 * temper read off each enemy's id, so over a fight a body meets nearly every
 * swing with nearly every roll. The grid below is that: every swing from one
 * side to the other crossed with every roll, which takes in whatever one
 * round shows and does not depend on which temper a body was dealt.
 */

/** How big a body's glance is: its turn, in body radii, and its widest roll, radians (`GlanceSize`). */
export interface GlanceReach {
  reach: number;
  cock: number;
}

/** No glance at all: what every axis measured before 15 October 2026 and still measures by default. */
export const NO_GLANCE: GlanceReach = { reach: 0, cock: 0 };

/** Steps from one side of the swing to the other, ends and middle included. */
const SWINGS = 5;
/** Steps from one side of the roll to the other, ends and middle included. */
const ROLLS = 5;

/** Harmonics searched for the lobe count. Nothing living has more than nine. */
const MAX_HARMONIC = 12;

/** Each harmonic's cosines and sines round a contour of `n` points, worked out once per `n`. */
const TABLES = new Map<number, { cos: Float64Array; sin: Float64Array }>();

function harmonicTable(n: number): { cos: Float64Array; sin: Float64Array } {
  const known = TABLES.get(n);
  if (known !== undefined) return known;
  const cos = new Float64Array((MAX_HARMONIC - 1) * n);
  const sin = new Float64Array((MAX_HARMONIC - 1) * n);
  for (let k = 2; k <= MAX_HARMONIC; k++) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 * k;
      cos[(k - 2) * n + i] = Math.cos(a);
      sin[(k - 2) * n + i] = Math.sin(a);
    }
  }
  const table = { cos, sin };
  TABLES.set(n, table);
  return table;
}

/** `n` values from `-x` to `x`, or the one 0 where `x` is. */
function across(x: number, n: number): number[] {
  if (x === 0) return [0];
  return Array.from({ length: n }, (_, i) => x * ((2 * i) / (n - 1) - 1));
}

/** The samples one posed contour adds to each axis. */
export interface AxisSamples {
  aspects: number[];
  lobes: number[];
  sizes: number[];
}

/**
 * Measure the contour `pts` at `pose`, turned through every swing and roll of
 * `glance`, onto `out`. `footprint` turns contour units into reference pixels.
 */
export function measurePosed(
  pts: readonly { x: number; y: number }[],
  pose: Pose,
  glance: GlanceReach,
  footprint: number,
  out: AxisSamples,
): void {
  const { rot, sx, sy } = pose;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const n = pts.length;
  const px = new Float64Array(n);
  const py = new Float64Array(n);
  const tx = new Float64Array(n);
  const ty = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const x = p.x * sx;
    const y = p.y * sy;
    px[i] = x;
    py[i] = y;
    tx[i] = x * cos - y * sin;
    ty[i] = x * sin + y * cos;
  }
  const radii = new Array<number>(n);
  const gx = new Float64Array(n);
  for (const swing of across(glance.reach, SWINGS)) {
    for (let i = 0; i < n; i++) {
      // The turn is on the screen, after the pose has rotated the body; a
      // roll cannot change a radius, so the lobe profile is read before it.
      const x = tx[i]! * (tx[i]! < 0 ? 1 + swing : 1 - swing);
      gx[i] = x;
      // Unturned, read the radius off the unrotated point, as the gate always has.
      radii[i] = swing === 0 ? Math.hypot(px[i]!, py[i]!) : Math.hypot(x, ty[i]!);
    }
    out.lobes.push(dominantHarmonic(radii));
    for (const roll of across(glance.cock, ROLLS)) {
      const c = Math.cos(rot + roll);
      const s = Math.sin(rot + roll);
      const rc = Math.cos(roll);
      const rs = Math.sin(roll);
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (let i = 0; i < n; i++) {
        let x: number;
        let y: number;
        if (swing === 0) {
          x = px[i]! * c - py[i]! * s;
          y = px[i]! * s + py[i]! * c;
        } else {
          x = gx[i]! * rc - ty[i]! * rs;
          y = gx[i]! * rs + ty[i]! * rc;
        }
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      const w = x1 - x0;
      const h = y1 - y0;
      out.aspects.push(w / h);
      out.sizes.push(Math.sqrt(w * h) * footprint);
    }
  }
}

/**
 * The lobe count a contour actually has, as drawn.
 *
 * Not `silhouette.lobes` — that is a number somebody typed, and the whole
 * question is whether it survives being drawn. The radius is read off the
 * posed points and decomposed by angle; the strongest harmonic at or above 2
 * is what the shape reads as. Below 2 is not a lobe count, it is a body
 * sitting off its own centre — which is also all a turn about the centre
 * adds on its own.
 *
 * This is why the axis answers to the pose at all. A non-uniform scale is a
 * second harmonic added to the profile, and a round body squashed far enough
 * holds more energy in "ellipse" than in "nine bumps" — at which point it has
 * stopped reading as the knobbly one whatever `silhouettes.ts` says. That is
 * the failure `docs/alive.md` refused `BULB.wobble` 0.075 for, arriving
 * through the pose instead of through the contour.
 */
function dominantHarmonic(radii: readonly number[]): number {
  const n = radii.length;
  const { cos, sin } = harmonicTable(n);
  let best = 2;
  let bestEnergy = -1;
  for (let k = 2; k <= MAX_HARMONIC; k++) {
    let re = 0;
    let im = 0;
    const row = (k - 2) * n;
    for (let i = 0; i < n; i++) {
      re += radii[i]! * cos[row + i]!;
      im += radii[i]! * sin[row + i]!;
    }
    const energy = re * re + im * im;
    if (energy > bestEnergy) {
      bestEnergy = energy;
      best = k;
    }
  }
  return best;
}
