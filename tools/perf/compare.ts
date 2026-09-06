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

/**
 * A change smaller than this is noise, not a regression — applied to a wave's
 * **share** of its run's median rather than to its milliseconds.
 *
 * **20 is a measured number, not a chosen one, and it is the honest limit of
 * this tool.** Repeated runs of an identical commit on one quiet desk, with
 * every defence below in place — the median batch rather than the mean or the
 * minimum, each wave normalised against its own run, and the game's clock held
 * still so the animations pose identically — still moved individual waves by up
 * to 19%. Set lower, the tool reports a regression every time it is run.
 *
 * So this catches a shape that costs *substantially* more, which is what a new
 * creature or a new animation does and what `CLAUDE.md` asks it to be run for.
 * It is not a fine instrument, and it should not be read as one: a real 15%
 * regression will pass through it unremarked. `packages/render/test/frame-budget.test.ts`
 * is the exact guard, because an op count has no variance at all.
 */
export const NOISE_PCT = 20;

/**
 * The fewest waves a run needs before its median carries the machine's drift
 * rather than the change being looked for. A run of one wave has a median that
 * *is* that wave, so dividing by it cancels the very thing the run was taken to
 * see and every verdict comes out `same` — and the ordinary run is a narrow one
 * now, since a lane that adds a creature measures the waves it appears in.
 */
export const DRIFT_MIN_WAVES = 5;

/** Whether a run has enough waves for `compareRuns`' verdicts to mean anything.
 * Here so the rule is one number in one file that a test can hold; what a
 * caller does about a `false` is its own business. */
export function driftIsMeasurable(run: Run): boolean {
  return run.waves.length >= DRIFT_MIN_WAVES;
}

/**
 * Two machines whose calibration differs by more than this cannot have their
 * millisecond figures compared at all — only their shapes. The owner alternates
 * between a Windows box and a Mac (`docs/cloud-session.md` adds a third), and a
 * baseline taken on one of them is not a fact about the others.
 */
export const CALIBRATION_TOLERANCE_PCT = 25;

export interface WaveCost {
  /** 1-based, the number a player would say. */
  wave: number;
  name: string;
  /** Creatures on the field at the tick this was measured. */
  bodies: number;
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
  verdict: "worse" | "better" | "same" | "new";
}

/** Whether two runs' milliseconds mean the same thing. */
export function comparable(before: Run, after: Run): boolean {
  if (before.throttle !== after.throttle) return false;
  if (before.viewport.dpr !== after.viewport.dpr) return false;
  if (before.viewport.width !== after.viewport.width) return false;
  const drift = Math.abs(after.calibration - before.calibration) / before.calibration;
  return drift * 100 <= CALIBRATION_TOLERANCE_PCT;
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
        verdict: "new",
      });
      continue;
    }
    const changePct = ((nowShare - thenShare) / thenShare) * 100;
    const verdict = changePct > NOISE_PCT ? "worse" : changePct < -NOISE_PCT ? "better" : "same";
    out.push({
      wave: now.wave,
      name: now.name,
      before: then.typical,
      after: now.typical,
      changePct,
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
