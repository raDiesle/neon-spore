import { JITTER_UNUSABLE, NOISE_PCT, noiseFloorFor } from "./noise.js";

/**
 * What a performance run *is*, and what two of them say when held side by side.
 *
 * Its own file beside `run.ts` because none of it opens a browser: everything
 * here is arithmetic over numbers somebody already measured, which is the half
 * a test can hold. `measure.ts` produces a `Run`, `run.ts` prints one and
 * writes it down, and this file is the only place that decides what "worse"
 * means.
 */

/** One 60 Hz frame. Every verdict in this file is a fraction of it. */
export const FRAME_MS = 16.7;

/**
 * How much slower than the measuring machine the run pretends to be. 4 is what
 * Chrome DevTools labels *mid-tier mobile* and 6 *low-end mobile*; those two
 * names are the whole reason the number is not something rounder.
 */
export const DEFAULT_THROTTLE = 4;

export interface WaveCost {
  /** 1-based, the number a player would say. */
  wave: number;
  name: string;
  /** Creatures on the field at the tick this was measured. */
  bodies: number;
  /**
   * What the wave sent when this row was measured — `arrivalsOf`'s count and
   * digest of its spawn queue. The name above catches a wave renamed or
   * inserted; this catches a wave whose *arrivals* changed under a name that
   * still matches, which is the way a row actually goes stale. A row written
   * before this field existed has none, and is read as stale for the same
   * reason: nothing can say what it was measuring.
   */
  arrivals?: string;
  /**
   * The middle batch of the sample, per paint — and what two runs are compared
   * on, rather than `mean`.
   *
   * Three estimators were tried and two of them were wrong. A **mean** is
   * pushed upward by whatever else the machine was doing, so it carries the
   * ambient load into every figure. A **minimum** throws that away but picks up
   * something else instead: `paint` is handed `performance.now()`, so every run
   * samples the game's animations at different phases, and the cheapest batch
   * is whichever phase happened to be cheapest this time. A **median** is
   * indifferent to both — the busy frames are in the tail it discards, and the
   * phases average out across the batches either side of it.
   */
  typical: number;
  /** Milliseconds for one paint, averaged. What a player actually gets. */
  mean: number;
  /** The slow ones — the 90th percentile of the same sample. */
  p90: number;
  /**
   * How unsteady the sample was — its interquartile spread over its median,
   * so 0.1 is "the middle half of the batches lay within a tenth of the
   * middle one". A row written before this existed has none.
   */
  jitter?: number;
}

export interface Run {
  /** ISO date, so a baseline says how old it is without asking git. */
  measuredAt: string;
  /** The commit measured, so a delta can be attributed. */
  commit: string;
  /** CPU throttling rate the whole run was taken at. */
  throttle: number;
  viewport: { width: number; height: number; dpr: number };
  /**
   * This machine's speed, as thousands of iterations per second of one fixed
   * arithmetic loop (`CALIBRATION_ITERATIONS` in `measure.ts`). It is not a
   * benchmark anybody should care about on its own — it exists so that two runs
   * can say whether they are even comparable.
   */
  calibration: number;
  waves: WaveCost[];
}

export interface WaveDelta {
  wave: number;
  name: string;
  /** Each run's typical paint, in milliseconds — the statistic the percentage
   * is taken on. */
  before: number;
  after: number;
  /** Positive is worse. */
  changePct: number;
  /** What this wave had to clear to earn a verdict — `noiseFloorFor`. */
  floorPct: number;
  verdict: "worse" | "better" | "same" | "new" | "noisy";
}

/**
 * Every wave's change, worst first.
 *
 * The verdict is taken on each wave's **share of its own run's median**, not on
 * its milliseconds, and that is the difference between a tool that works and one
 * that cries wolf. Two runs of the identical commit, minutes apart on the same
 * desk, came back 15% to 41% apart on every single wave — the whole run had
 * shifted, because something else on the machine was busy. Milliseconds cannot
 * tell that from a real change; a wave's share of its own run can, because an
 * ambient slowdown moves the median with it and cancels.
 *
 * What survives normalising is exactly what this tool is for: a wave that got
 * dearer *relative to the rest of the game*, which is what a new shape or a new
 * animation does. `before` and `after` still carry the milliseconds, because a
 * reader wants to see them even when they are not what the verdict was taken on.
 *
 * A wave the baseline has never seen is `new` rather than a regression: adding
 * a wave is not making one slower, and the point of this tool is that the new
 * shape gets a number of its own rather than a verdict it cannot earn.
 *
 * The floor each wave has to clear is its own (`noiseFloorFor`), because a flat
 * one was still naming waves nobody had touched. A wave whose sample was too
 * unsteady to compare at all is `noisy`, which is a thing worth saying out loud
 * — reporting `same` about a wave nothing could ever move past is the quiet
 * version of the same lie.
 */
export function compareRuns(before: Run, after: Run): WaveDelta[] {
  const was = new Map(before.waves.map((w) => [w.wave, w]));
  // **Like for like.** A narrow run's median is taken over the waves it
  // measured, so the baseline's is taken over the same ones or the two shares
  // are shares of different games — THE GAUGE alone, at a fifth of any other
  // wave, moves a sweep's median somewhere a three-wave run's cannot reach.
  const covered = new Set(after.waves.map((w) => w.wave));
  const wasShape = shapeOf(
    after.waves.length === before.waves.length
      ? before
      : { ...before, waves: before.waves.filter((w) => covered.has(w.wave)) },
  );
  const nowShape = shapeOf(after);
  const out: WaveDelta[] = [];
  for (const now of after.waves) {
    const then = was.get(now.wave);
    const thenShare = wasShape.get(now.wave);
    const nowShare = nowShape.get(now.wave);
    // `Number.isFinite` and not just a presence check: a baseline written
    // before `typical` existed has no such field, its median comes out `NaN`, and
    // every comparison against `NaN` is false — so a run against one would have
    // called all 38 waves `same` and reported that nothing had changed. It did,
    // once. An unusable share is treated as no share at all.
    const usable =
      then !== undefined &&
      thenShare !== undefined &&
      nowShare !== undefined &&
      Number.isFinite(thenShare) &&
      Number.isFinite(nowShare) &&
      thenShare !== 0;
    if (!usable) {
      out.push({
        wave: now.wave,
        name: now.name,
        before: then?.typical ?? 0,
        after: now.typical,
        changePct: 0,
        floorPct: NOISE_PCT,
        verdict: "new",
      });
      continue;
    }
    const changePct = ((nowShare - thenShare) / thenShare) * 100;
    // **The unsteadier of the two samples decides the floor.** A wave that was
    // solid when the baseline was taken and all over the place today is exactly
    // as uncomparable as the other way round, and taking the smaller of the two
    // would let whichever run happened to be calm license a verdict the other
    // cannot support.
    const jitter = Math.max(then.jitter ?? 0, now.jitter ?? 0);
    const floorPct = noiseFloorFor(jitter);
    const verdict =
      jitter > JITTER_UNUSABLE
        ? "noisy"
        : changePct > floorPct
          ? "worse"
          : changePct < -floorPct
            ? "better"
            : "same";
    out.push({
      wave: now.wave,
      name: now.name,
      before: then.typical,
      after: now.typical,
      changePct,
      floorPct,
      verdict,
    });
  }
  return out.sort((a, b) => b.changePct - a.changePct);
}

/** How much of a 60 Hz frame a figure spends, as a percentage. */
export function budgetPct(ms: number): number {
  return (ms / FRAME_MS) * 100;
}

/**
 * The one-word reading of a wave's cost. `tight` starts at three quarters of
 * the frame because a phone that is warm is already slower than the one that
 * was measured, and a wave with a quarter of a frame spare has nowhere to go.
 */
export function verdictFor(ms: number): "fine" | "tight" | "over" {
  const pct = budgetPct(ms);
  if (pct >= 100) return "over";
  if (pct >= 75) return "tight";
  return "fine";
}

/** The middle wave of a run, by whichever statistic is asked for. */
function median(run: Run, of: (w: WaveCost) => number): number {
  if (run.waves.length === 0) return 0;
  const sorted = run.waves.map(of).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] as number;
}

/** The figure a whole run is summarised by, in what a player actually gets. */
export function medianMs(run: Run): number {
  return median(run, (w) => w.mean);
}

/**
 * Every wave's cost as a multiple of its own run's median.
 *
 * Two defences against the same problem, stacked. `typical` throws away the
 * frames the machine interfered with; dividing by the run's own median throws
 * away a slowdown that reached every frame evenly. What is left is the game's own
 * shape, which is comparable across machines, across days, and across a desk
 * that got busy halfway through.
 */
export function shapeOf(run: Run): Map<number, number> {
  const mid = median(run, (w) => w.typical);
  const out = new Map<number, number>();
  if (mid === 0) return out;
  for (const w of run.waves) out.set(w.wave, w.typical / mid);
  return out;
}
