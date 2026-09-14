/**
 * **Dart-throwing inside a contour** — blue noise, placed against a density
 * field the caller supplies, and nothing about what is drawn on top of it.
 *
 * Its own file, split off when `pore.ts` reached the 250-line ceiling, along a
 * seam that had two skins standing on it already: PORE measures closeness
 * against a handful of hotspots and SUCKER against a line, and that difference
 * is the whole of what keeps the two apart. The scatter was in `pore.ts` and
 * `sucker.ts` imported it from there — a skin importing another skin for the
 * engine under both, which reads as one being built out of the other.
 *
 * What stays next door is a pore: the field, the hotspots, the bump paint and
 * the two `PORE` skins.
 */

/** One placed dart: a body-relative position and its own radius. */
export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export interface ScatterOptions {
  /** How many darts to land, and a hard cap on candidates drawn so that a
   * dense band cannot spin forever. */
  readonly target: number;
  readonly attempts: number;
  /** Sample disc radius, as a multiple of `reach` — `clipGroup` trims it. */
  readonly cover: number;
  readonly rMin: number;
  readonly rMax: number;
  /** Minimum centre-to-centre gap, as a multiple of a dart's own radius, at
   * closeness 1 and closeness 0 — the two ends of the density field. */
  readonly spacingDense: number;
  readonly spacingSparse: number;
  /** A candidate below this closeness is discarded outright, before spacing is
   * even checked — the way a region stays genuinely bare. */
  readonly minCloseness: number;
  /** 0 (bare) .. 1 (densest) at a body-relative point. The only thing that
   * tells two scatters apart is what this function measures against. */
  closeness(x: number, y: number): number;
  /** Optional multiplier on the radius pick, driven by closeness. */
  sizeBias?(closeness: number): number;
}

/** Dart-throwing, not a jittered lattice: a candidate is a uniformly-random
 * point in the disc (`sqrt(rand())` for area, so it isn't centre-heavy),
 * rejected if the local density field says so or if it lands too near a dart
 * already kept. Runs once in `build()`, like every other skin's lattice. */
export function poissonScatter(
  rand: () => number,
  reach: number,
  opts: ScatterOptions,
): ScatterPoint[] {
  const placed: ScatterPoint[] = [];
  const bias = opts.sizeBias ?? (() => 1);
  let tries = 0;
  while (placed.length < opts.target && tries < opts.attempts) {
    tries++;
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * reach * opts.cover;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    const c = opts.closeness(x, y);
    if (c < opts.minCloseness) continue;
    const r = reach * (opts.rMin + rand() * (opts.rMax - opts.rMin)) * bias(c);
    const spacing = r * (opts.spacingSparse - (opts.spacingSparse - opts.spacingDense) * c);
    const clash = placed.some((p) => Math.hypot(p.x - x, p.y - y) < spacing);
    if (clash) continue;
    placed.push({ x, y, r });
  }
  return placed;
}
