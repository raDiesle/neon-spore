/**
 * The numbers a paint is sampled with, and the statistics taken off the
 * sample — the whole of *how* a performance run is measured, with nothing in
 * it that needs a browser to be driven from outside.
 *
 * Its own file because there are two callers now. `measure.ts` drives a
 * headless Chrome over a wire from Node; `apps/game/src/perf-sweep.ts` runs
 * the same sweep inside the page, on the phone the game is actually for, where
 * there is no wire and no throttle. If those two ever sampled differently their
 * numbers would not be comparable, and the whole point of the phone run is that
 * it is the same measurement taken somewhere else.
 *
 * Nothing here imports playwright, which is what lets the game's bundle have
 * it.
 */

/**
 * Samples per wave, and paints per sample, after 25 discarded to warm the
 * caches — several of the renderer's savings only pay off from the second frame
 * on (`packages/render/test/frame-budget.test.ts` says which).
 *
 * The batch is the load-bearing number. `performance.now()` is clamped to a
 * tenth of a millisecond in Chrome, and the cheapest waves paint in about that
 * — THE GAUGE's fastest frame came back as `0.1`, then as `0.0`, which is a
 * 100% "improvement" in a game nobody had touched. Timing eight paints inside
 * one clock reading divides the quantum by eight and puts a real figure back
 * under the cheap end of the table.
 */
export const SAMPLES = 30;
export const BATCH = 8;
export const WARMUP = 25;

/**
 * Real milliseconds left between batches, which is what spreads a wave's
 * thirty readings over about two seconds instead of two hundred milliseconds.
 *
 * With no wait the whole sample lands inside one short window, so a single
 * transient somewhere else on the machine — a background task waking up, a
 * timer firing — is not an outlier the median discards but the condition
 * *every* batch was taken under. That is what made individual waves swing by a
 * third between runs of identical code while the run's own median held still.
 */
export const BETWEEN_BATCHES_MS = 45;

/** Sim ticks run between paints: the game's own ratio of a 120 Hz tick to a
 * 60 Hz frame, so bodies move between frames exactly as they do in play. */
export const TICKS_PER_FRAME = 2;

/** One frame at 60 Hz, in milliseconds — what the posed clock steps by. */
export const FRAME_STEP_MS = 1000 / 60;

/**
 * Where the posed clock starts, once for a whole sweep rather than once per
 * wave — and the reason a sweep has to carry it from one wave to the next.
 *
 * `paint` is handed `performance.now() / 1000` as `time`, so both sweeps freeze
 * that clock and step it by exactly one frame per paint: the sequence of
 * pictures is then the same every run, which is the whole reason the fake clock
 * exists. What it used to do as well was restart at nought for every wave. The
 * clock is *absolute* — a transient in `Effects` records the `time` it began at
 * and reads its age back as `time - began` — so the second wave's first paint
 * was handed an age of minus however long the first wave had been measured
 * for. A clasp coming apart on a negative age put a ring at a negative radius
 * and Chrome refused the frame with `IndexSizeError`, which reads as a bug in
 * the game and is not one.
 *
 * `Effects.update` refuses a non-positive step now, so nothing crashes either
 * way. That guard is not the fix: it makes the harness's lie survivable, and
 * the frame it was lying on is a real frame in a real measurement. The fix is
 * that a wave picks the clock up where the wave before it put it down, which
 * keeps the pictures identical run to run *and* keeps time going forwards.
 */
export const POSE_CLOCK_START = 0;

/** One 60 Hz frame, rounded — every verdict in `compare.ts` is a fraction of
 * it, and the phone readout says what it is measuring against. */
export const FRAME_MS = 16.7;

/** How far a wave is searched for its busiest moment, and in what steps. Six
 * hundred ticks is five seconds of play at 120 Hz, and 2 400 covers the
 * longest wave's arrivals without running past the end of a short one. */
export const PEAK_SEARCH_TICKS = 2_400;
export const PEAK_SEARCH_STEP = 15;

/** What one wave's sample says, once the batches are in. */
export interface Sample {
  typical: number;
  mean: number;
  p90: number;
  jitter: number;
}

/**
 * The four figures a wave's batches are reduced to. Milliseconds per paint in,
 * milliseconds per paint out.
 *
 * The middle batch rather than the cheapest or the average, for the reason
 * `WaveCost.typical` in `compare.ts` sets out at length: a mean carries the
 * ambient load of the machine into every figure, and a minimum picks whichever
 * phase of the game's animations happened to be cheapest this time.
 */
export function summarise(taken: readonly number[]): Sample {
  const sorted = [...taken].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.floor(sorted.length * q)] as number;
  const middle = at(0.5);
  return {
    typical: sorted[Math.floor(sorted.length / 2)] as number,
    mean: taken.reduce((sum, v) => sum + v, 0) / taken.length,
    p90: at(0.9),
    // How unsteady this wave's own sample was: the interquartile spread of the
    // batches, as a fraction of the middle one.
    jitter: middle === 0 ? 0 : (at(0.75) - at(0.25)) / middle,
  };
}
