/**
 * **What a performance run is, written down**: one wave's cost, a whole run of
 * them, and the row a comparison of two runs hands back.
 *
 * Its own file beside `compare.ts`, split when that one reached the 250-line
 * ceiling, and the seam is between a record and what is decided from it. Every
 * field here carries the argument for its own existence — why a row is matched
 * on `Wave.id` rather than on a number that moves when a wave is inserted, what
 * a `typical` is the typical of, what an unmeasured row means. Next door is the
 * only place that decides what *worse* means. The two are read at different
 * times: this one by anybody writing or reading a run, that one by somebody
 * arguing about a verdict.
 *
 * `compare.ts` re-exports all three, so the ten files that ask it for them ask
 * it still.
 */

export interface WaveCost {
  /**
   * `Wave.id` — the handle a row is *matched* on, and the only field here that
   * does not move. `wave` and `name` are the human-readable columns beside it.
   * `shape.ts`'s `keyOf` is where it is read, and carries what matching on the
   * number cost once. A row written before this existed has none.
   */
  id?: string;
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
  /**
   * Present only on a row that was **merged in later** rather than swept with
   * the rest of the file, and what it was merged from.
   *
   * A baseline used to be one afternoon's work, all forty-seven rows or none:
   * `--save` refused a narrow run, so the only way to fix a single row a wave
   * had outgrown was a three-minute sweep that silently re-baselined the other
   * forty-six off whatever the machine was doing. `bun run perf --wave X --save`
   * now puts one row back instead (`shape.ts`'s `mergeInto`).
   *
   * The milliseconds above are the ones the baseline's own run *would* have
   * recorded, not the ones the narrow run measured: `scale` is the factor they
   * were multiplied by, read off the reference waves both runs measured and
   * neither changed. Without that a merged row is read against a median taken
   * over five waves where the rest of the file was read against one taken over
   * forty-seven, and the wave comes out a regression nobody caused.
   *
   * It is recorded rather than merely applied so that a stitched baseline is
   * legible in the file — which afternoon a row is really from, on what commit,
   * and how far the arithmetic moved it.
   */
  mergedFrom?: { measuredAt: string; commit: string; scale: number };
  /**
   * On a row for a wave **nobody has measured**: it says a figure is owed and
   * claims nothing else (`unmeasured.ts`). No median
   * counts it and no comparison takes a verdict on it, so the figures above are
   * placeholders nothing reads — this flag is asked first everywhere.
   */
  unmeasured?: true;
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
  verdict: "worse" | "better" | "same" | "new" | "noisy" | "unmeasured";
}
