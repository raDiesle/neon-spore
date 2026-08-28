import type { Point } from "@neon-spore/content";

/**
 * Where a point is, a given fraction of the way around a contour — the same
 * question `SVGPathElement.getPointAtLength` answers, asked of the `d` string
 * instead of the browser.
 *
 * **Why not just ask the browser.** Because an answer costs 0.58 ms. Measured
 * in Chrome on a page of five nodes holding one `<path>` wearing THE BREACH's
 * real contour, five hundred consecutive `getPointAtLength` calls with nothing
 * else running and no write between them. Detaching the path does not help and
 * an empty document does not help, so it is neither a forced layout nor the
 * page's size: the call rebuilds its measure of the whole path each time. A
 * hundred strands is 65 ms a frame for one card — that card, alone, could not
 * reach twenty frames a second, and drawing fewer cards does not move it.
 *
 * **The same answer, not a cheaper one.** The lane that was reverted took 64
 * points off the browser's ruler and interpolated the rest out of them, which
 * drifted up to 1.6 contour units against strands 6 to 9 units long. This does
 * not sample the browser at all: it reads the same `d`, flattens every curve
 * to within half a unit of chord and measures arc length along the result,
 * which is what the browser does too. Over all sixty entries at four moments
 * each — 24,000 points against `getPointAtLength` — worst drift 0.036 units,
 * rms 0.004, total length within 0.03%.
 *
 * **Allocated once and written into.** A ruler belongs to one figure and lives
 * as long as it does; `measure` rewrites the tables in place and only ever
 * allocates to grow one, which happens in a figure's first frames and never
 * again. Sixty cards each building a fresh table sixty times a second is a
 * quarter of a million short-lived objects a second: a collector on a timer.
 *
 * **It understands `M`, `L`, `C` and `Z`** — every command the catalogue
 * writes, checked across all sixty. Anything else is skipped a number at a
 * time: a path a ruler cannot read costs that card its fringe, not the page.
 */

/** Chord length, in contour units, that a flattened curve may cut across. */
const CHORD = 0.5;
const MIN_STEPS = 4;
const MAX_STEPS = 24;

const SPACE = 32;
const COMMA = 44;
const MINUS = 45;
const PLUS = 43;
const DOT = 46;
const ZERO = 48;
const NINE = 57;

export interface Ruler {
  /** Read a contour's `d` and lay the tables out along it. Returns the total
   * arc length — the same number `getTotalLength` returns, 0 for an empty
   * path, so the test a caller made against that one still reads. */
  measure(d: string): number;
  /** The point `u` of the way around, `u` in 0..1. Written into `out`. */
  at(u: number, out: Point): void;
}

/** One ruler, for one figure. See the header for why it is not shared. */
export function newRuler(): Ruler {
  // Small on purpose: one ruler per CILIA figure and most are never on screen,
  // so the ones nobody looks at stay at a few kilobytes.
  let px = new Float64Array(256);
  let py = new Float64Array(256);
  /** Arc length from the start of the path to point `i`. */
  let pl = new Float64Array(256);
  let n = 0;
  let total = 0;
  let src = "";
  let at = 0;

  /** Room for one more point. Grows only until the tables hold the biggest
   * contour this body reaches, which is a matter of its first few frames. */
  function room(): void {
    if (n < px.length) return;
    const size = px.length * 2;
    const nx = new Float64Array(size);
    const ny = new Float64Array(size);
    const nl = new Float64Array(size);
    nx.set(px);
    ny.set(py);
    nl.set(pl);
    px = nx;
    py = ny;
    pl = nl;
  }

  /** A point on the outline. `jump` is a `moveto`, which covers no distance. */
  function add(x: number, y: number, jump: boolean): void {
    room();
    if (n > 0 && !jump) {
      total += Math.hypot(x - (px[n - 1] as number), y - (py[n - 1] as number));
    }
    px[n] = x;
    py[n] = y;
    pl[n] = total;
    n++;
  }

  /** The next number in `src`, read digit by digit so that no substring of it
   * is ever allocated. The generators write two decimals and no exponent. */
  function num(): number {
    let c = src.charCodeAt(at);
    while (c === SPACE || c === COMMA || (c >= 9 && c <= 13)) c = src.charCodeAt(++at);
    let sign = 1;
    if (c === MINUS) {
      sign = -1;
      c = src.charCodeAt(++at);
    } else if (c === PLUS) {
      c = src.charCodeAt(++at);
    }
    let v = 0;
    while (c >= ZERO && c <= NINE) {
      v = v * 10 + (c - ZERO);
      c = src.charCodeAt(++at);
    }
    if (c === DOT) {
      c = src.charCodeAt(++at);
      let f = 0.1;
      while (c >= ZERO && c <= NINE) {
        v += (c - ZERO) * f;
        f *= 0.1;
        c = src.charCodeAt(++at);
      }
    }
    return sign * v;
  }

  /** A cubic, in steps short enough that the chord between two is within
   * `CHORD` of the curve. The control polygon bounds the arc from above, so
   * counting steps off it never under-samples. */
  function cubic(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ): void {
    const poly =
      Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
    let steps = Math.ceil(poly / CHORD);
    if (steps < MIN_STEPS) steps = MIN_STEPS;
    else if (steps > MAX_STEPS) steps = MAX_STEPS;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      const mt = 1 - t;
      const a = mt * mt * mt;
      const b = 3 * mt * mt * t;
      const c = 3 * mt * t * t;
      const e = t * t * t;
      add(a * x0 + b * x1 + c * x2 + e * x3, a * y0 + b * y1 + c * y2 + e * y3, false);
    }
  }

  return {
    measure(d: string): number {
      src = d;
      at = 0;
      n = 0;
      total = 0;
      // The pen, and the start of the subpath it is in, which `Z` draws to.
      let cx = 0;
      let cy = 0;
      let sx = 0;
      let sy = 0;
      let cmd = 0;
      const len = d.length;
      while (at < len) {
        const c = d.charCodeAt(at);
        if (c === SPACE || c === COMMA || (c >= 9 && c <= 13)) {
          at++;
          continue;
        }
        // A letter is a command; a digit repeats the last one, per the grammar.
        // 77/109 is `M m`, 76/108 `L l`, 67/99 `C c`, 90/122 `Z z`.
        if (c < ZERO || c > NINE) {
          if (c !== MINUS && c !== PLUS && c !== DOT) {
            cmd = c;
            at++;
            if (c === 90 || c === 122) {
              add(sx, sy, false);
              cx = sx;
              cy = sy;
            }
            continue;
          }
        }
        if (cmd === 77 || cmd === 109) {
          cx = num();
          cy = num();
          sx = cx;
          sy = cy;
          add(cx, cy, true);
          // A second pair after an `M` is a `lineto`, per the SVG grammar.
          cmd = 76;
        } else if (cmd === 76 || cmd === 108) {
          cx = num();
          cy = num();
          add(cx, cy, false);
        } else if (cmd === 67 || cmd === 99) {
          const x1 = num();
          const y1 = num();
          const x2 = num();
          const y2 = num();
          const x3 = num();
          const y3 = num();
          cubic(cx, cy, x1, y1, x2, y2, x3, y3);
          cx = x3;
          cy = y3;
        } else {
          // Not something the generators write; skipped rather than thrown at.
          num();
        }
      }
      src = "";
      return total;
    },

    at(u: number, out: Point): void {
      if (n === 0) {
        out.x = 0;
        out.y = 0;
        return;
      }
      const want = u * total;
      let lo = 0;
      let hi = n - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if ((pl[mid] as number) < want) lo = mid + 1;
        else hi = mid;
      }
      if (lo === 0) {
        out.x = px[0] as number;
        out.y = py[0] as number;
        return;
      }
      const l0 = pl[lo - 1] as number;
      const span = (pl[lo] as number) - l0;
      const f = span > 0 ? (want - l0) / span : 0;
      const x0 = px[lo - 1] as number;
      const y0 = py[lo - 1] as number;
      out.x = x0 + ((px[lo] as number) - x0) * f;
      out.y = y0 + ((py[lo] as number) - y0) * f;
    },
  };
}
