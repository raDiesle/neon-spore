import { WAVES } from "@neon-spore/content";
import type { Page } from "playwright-core";
import { clearOpening } from "../frames/opening.js";
import type { Run, WaveCost } from "./compare.js";

/**
 * One performance run, taken off a real browser driving the real bundle.
 *
 * Every number this file produces is a measurement, and the two things that
 * make one worth keeping are here rather than at the call site: the page is
 * stepped to the tick a wave carries the **most bodies**, so the shapes that
 * wave introduces are actually on screen when the frame is weighed; and the
 * paints are timed in small batches with a macrotask between them, so what is
 * measured is one frame's work rather than a tight loop backing up on the
 * compositor. A sweep without either reports a number about nothing — both
 * mistakes were made and corrected on the way to the first baseline.
 *
 * `run.ts` owns the browser and the server; this file only drives a page it is
 * handed. `clearOpening` is `tools/frames`' own, not a second copy — a wave's
 * opening is one rule and this tool has no business restating it.
 */

/** Iterations of the calibration loop. Fixed forever: the figure is only
 * meaningful against another run of the identical loop. */
export const CALIBRATION_ITERATIONS = 3_000_000;

/** How far a wave is searched for its busiest moment, and in what steps. Six
 * hundred ticks is five seconds of play at 120 Hz, and 2 400 covers the
 * longest wave's arrivals without running past the end of a short one. */
const PEAK_SEARCH_TICKS = 2_400;
const PEAK_SEARCH_STEP = 15;

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
const SAMPLES = 30;
const BATCH = 8;
const WARMUP = 25;

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
const BETWEEN_BATCHES_MS = 45;

/** Sim ticks run between paints: the game's own ratio of a 120 Hz tick to a
 * 60 Hz frame, so bodies move between frames exactly as they do in play. */
const TICKS_PER_FRAME = 2;

export interface Seat {
  seat: "p1" | "p2";
}

/** This machine's speed, so a later run can say whether it is comparable. */
export async function calibrate(page: Page): Promise<number> {
  return page.evaluate((iterations) => {
    const started = performance.now();
    let x = 0;
    for (let i = 0; i < iterations; i++) x = (x + Math.sin(i * 0.001) * Math.sqrt(i + 1)) % 1e6;
    // `x` is read so the loop cannot be optimised away entirely.
    const ms = performance.now() - started + (x === Number.POSITIVE_INFINITY ? 1 : 0);
    return Math.round(iterations / ms);
  }, CALIBRATION_ITERATIONS);
}

/**
 * Put one wave on the field and step it to its busiest tick.
 *
 * The search is run twice over: once to find where the peak is, then the wave
 * is restarted and replayed to exactly that tick. Stopping at the peak the
 * first time round is not the same thing — the search has to run *past* it to
 * know it was a peak.
 */
export async function toPeak(page: Page, waveIndex: number): Promise<number> {
  const enter = async (): Promise<void> => {
    await page.evaluate((w) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing");
      ns.jumpToWave(w);
    }, waveIndex);
    await clearOpening(page);
  };

  await enter();
  const peak = await page.evaluate(
    ([wave, limit, step]) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing");
      let best = { tick: 0, bodies: ns.world.creatures.length };
      for (let t = step; t <= limit; t += step) {
        ns.advance(step);
        // The wave moved on; anything past here belongs to the next one.
        if (ns.world.wave !== wave) break;
        const bodies = ns.world.creatures.length;
        if (bodies > best.bodies) best = { tick: t, bodies };
      }
      return best;
    },
    [waveIndex, PEAK_SEARCH_TICKS, PEAK_SEARCH_STEP] as const,
  );

  await enter();
  if (peak.tick > 0) {
    await page.evaluate((ticks) => window.neonSpore?.advance(ticks), peak.tick);
  }
  return peak.bodies;
}

/**
 * Time one wave's paint, in milliseconds, as the per-paint cost of each batch.
 *
 * The `setTimeout` between batches is the load-bearing part. Without it the
 * measurement is one long tight loop, the GPU queue backs up, and the 99th
 * percentile comes back at 200 ms — a number about Chrome's back-pressure
 * rather than about this game. `BATCH` says why the paints inside one reading
 * are grouped rather than timed singly.
 */
export async function timePaints(
  page: Page,
): Promise<{ typical: number; mean: number; p90: number }> {
  return page.evaluate(
    async ([samples, batch, warmup, ticks, frameMs, gapMs]) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing");

      // The game's own clock, held still and stepped by hand.
      //
      // `apps/game/src/main.ts` hands `paint` `performance.now() / 1000`, so
      // every shimmer, wobble and eased pose in the frame is a function of the
      // wall clock — which means two runs sample the animations at whatever
      // phases they happened to land on, and a wave's cost moves by a fifth
      // between runs of identical code. Stepping a fake clock by exactly one
      // frame per paint makes the sequence of pictures the same every time.
      //
      // The real clock is kept for the timing itself, in a closure the stub
      // cannot reach, and put back in a `finally` — leaving a page with a
      // frozen `performance.now` would make every later wave in the sweep
      // measure zero.
      const realNow = performance.now.bind(performance);
      let posed = 0;
      performance.now = () => posed;
      const taken: number[] = [];
      try {
        for (let i = 0; i < warmup; i++) {
          posed += frameMs;
          ns.paint();
        }
        for (let i = 0; i < samples; i++) {
          // Between batches, never inside one: the pause lets the GPU queue
          // drain, which is what keeps this a measurement of one frame's work
          // rather than of Chrome's back-pressure, and spreads the sample over
          // real time so a transient is an outlier rather than the weather.
          await new Promise((resolve) => setTimeout(resolve, gapMs));
          const started = realNow();
          for (let b = 0; b < batch; b++) {
            posed += frameMs;
            ns.advance(ticks);
            ns.paint();
          }
          taken.push((realNow() - started) / batch);
        }
      } finally {
        performance.now = realNow;
      }
      const sorted = [...taken].sort((a, b) => a - b);
      const mean = taken.reduce((sum, v) => sum + v, 0) / taken.length;
      return {
        // The middle batch, per paint. `WaveCost.typical` says why the middle
        // and not the cheapest.
        typical: sorted[Math.floor(sorted.length / 2)] as number,
        mean,
        p90: sorted[Math.floor(sorted.length * 0.9)] as number,
      };
    },
    [SAMPLES, BATCH, WARMUP, TICKS_PER_FRAME, 1000 / 60, BETWEEN_BATCHES_MS] as const,
  );
}

/** The name a player would call a wave, or its number when it has none. */
export function waveName(index: number): string {
  const wave = WAVES[index] as { name?: string } | undefined;
  return wave?.name ?? `WAVE ${index + 1}`;
}

/**
 * The waves asked for, in play order, each at its own busiest tick.
 *
 * `only` is a list of indices (`wavesAsked`), and the default is every wave.
 * A narrow run is the ordinary case — a lane that adds a creature measures the
 * waves that creature appears in, and nothing else — and a full sweep is what a
 * baseline is taken from.
 */
export async function sweep(
  page: Page,
  onWave?: (cost: WaveCost) => void,
  only: readonly number[] = WAVES.map((_, i) => i),
): Promise<WaveCost[]> {
  const out: WaveCost[] = [];
  for (const index of only) {
    const bodies = await toPeak(page, index);
    const { typical, mean, p90 } = await timePaints(page);
    const round = (v: number): number => Math.round(v * 100) / 100;
    const cost: WaveCost = {
      wave: index + 1,
      name: waveName(index),
      bodies,
      typical: round(typical),
      mean: round(mean),
      p90: round(p90),
    };
    out.push(cost);
    onWave?.(cost);
  }
  return out;
}

/** A finished run, ready to be printed or written down. */
export function assemble(parts: Omit<Run, "measuredAt">): Run {
  return { measuredAt: new Date().toISOString().slice(0, 10), ...parts };
}
