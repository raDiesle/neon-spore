import { WAVES } from "@neon-spore/content";
import type { Page } from "playwright-core";
import { clearOpening } from "../frames/opening.js";
import { arrivalsOf } from "./arrivals.js";
import type { WaveCost } from "./compare.js";
import type { Sample } from "./sweep-timing.js";
import {
  BATCH,
  BETWEEN_BATCHES_MS,
  FRAME_STEP_MS,
  PEAK_SEARCH_STEP,
  PEAK_SEARCH_TICKS,
  SAMPLES,
  summarise,
  TICKS_PER_FRAME,
  WARMUP,
} from "./sweep-timing.js";

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
export async function timePaints(page: Page): Promise<Sample> {
  const batches = await page.evaluate(
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
      return taken;
    },
    [SAMPLES, BATCH, WARMUP, TICKS_PER_FRAME, FRAME_STEP_MS, BETWEEN_BATCHES_MS] as const,
  );
  // Reduced out here rather than in the page: the arithmetic is the phone
  // sweep's too, and it is the one part of a measurement a test can hold
  // (`sweep-timing.ts`).
  return summarise(batches);
}

/** The name a player would call a wave, or its number when it has none. */
export function waveName(index: number): string {
  const wave = WAVES[index] as { name?: string } | undefined;
  return wave?.name ?? `WAVE ${index + 1}`;
}

/**
 * The handle a baseline row is matched on — `Wave.id`, which exists so that a
 * rename cannot break a reference and is the one field the director never
 * edits. A row with no id is a row from before this existed, and falls back to
 * the number it was written at.
 */
export function waveId(index: number): string {
  const wave = WAVES[index] as { id?: string } | undefined;
  return wave?.id ?? `wave${index + 1}`;
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
    const { typical, mean, p90, jitter } = await timePaints(page);
    const round = (v: number): number => Math.round(v * 100) / 100;
    const cost: WaveCost = {
      id: waveId(index),
      wave: index + 1,
      name: waveName(index),
      bodies,
      arrivals: arrivalsOf(index),
      typical: round(typical),
      mean: round(mean),
      p90: round(p90),
      jitter: Math.round(jitter * 1000) / 1000,
    };
    out.push(cost);
    onWave?.(cost);
  }
  return out;
}
