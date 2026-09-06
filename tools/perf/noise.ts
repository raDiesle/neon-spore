import type { Run } from "./compare.js";

/**
 * WHEN A MEASUREMENT CAN BE TRUSTED, and by how much it has to move before
 * anybody is told about it.
 *
 * Split out of `compare.ts` — which is what two runs *say* — because this is
 * the other question, and it is the one that decides whether the tool is worth
 * reading at all. Every number here was measured rather than picked, and the
 * comment above each one carries the run it came off, so the next person to
 * think it is too high has the evidence in front of them.
 */

/**
 * The floor under every wave: a change smaller than this is noise, not a
 * regression — applied to a wave's **share** of its run's median rather than to
 * its milliseconds.
 *
 * **20 is a measured number, not a chosen one.** Repeated runs of an identical
 * commit on one quiet desk, with every defence below in place — the median
 * batch rather than the mean or the minimum, each wave normalised against its
 * own run, and the game's clock held still so the animations pose identically —
 * still moved individual waves by up to 19%. Set lower, the tool reports a
 * regression every time it is run.
 *
 * It is a floor and not the whole rule, because 20 was still not enough: on
 * 6 September 2026 three sweeps taken back to back named two waves apiece that
 * nobody had touched. `noiseFloorFor` says what a wave gets on top of it, and
 * why a flat number could never have been the answer.
 */
export const NOISE_PCT = 20;

/**
 * How much of a wave's **own unsteadiness** its floor has to clear, on top of
 * `NOISE_PCT`.
 *
 * Six full sweeps of one commit, on an idle machine, said three things. The
 * waves that swing are not the cheap ones — the two cheapest in the game held
 * still, and the swings landed on ordinary 4 ms waves — so a floor that scales
 * with how cheap a wave is would have been scaling on the wrong axis. An
 * absolute millisecond gate is no better: every run's median is about 4 ms, so
 * "more than 20% of its share" and "more than 0.8 ms" are the same sentence
 * twice. And a flat floor high enough to silence the swings is 35%, which is
 * more than a whole new creature costs — THE CRAWLER is 25% over a bare wave —
 * so the tool would have gone quiet about the one thing it exists to catch.
 *
 * What did separate them is each wave's own sample. `WaveCost.jitter` is the
 * interquartile spread of the thirty batches a wave was timed over, and a wave
 * that was unsteady *while it was being measured* is the wave that comes back
 * somewhere else next time. At 1.5x it takes 282 wave-pairs of identical code
 * from six wrongly named waves to none, and it leaves 23 of the 47 waves on the
 * flat 20% — so the tool is no blunter than it was where it was already right.
 *
 * A floor, not a cure. Two later sweeps of the same commit each still named two
 * waves, and never the same two, so a single `WORSE` is worth one more run
 * before it is worth an afternoon.
 * Raising this until even that goes quiet costs more than the tool is worth:
 * `docs/performance.md` carries the arithmetic.
 */
export const JITTER_FLOOR_MUL = 1.5;

/**
 * Past this much unsteadiness a wave earns no verdict at all, only its
 * milliseconds. PINBALL's thirty batches spread over sixteen times their own
 * median — its floor would come out at 2400%, which is not a threshold anybody
 * is served by pretending to hold. Better to say the sample was unusable than
 * to report `same` about a wave nothing could have moved past.
 */
export const JITTER_UNUSABLE = 0.5;

/**
 * The floor one wave has to clear, given how unsteady its own sample was.
 *
 * A row from a baseline written before `jitter` existed has none, and gets the
 * flat `NOISE_PCT` — which is exactly how the tool read before this, so an old
 * baseline is not made to lie by a field it never carried.
 */
export function noiseFloorFor(jitter: number | undefined): number {
  return Math.max(NOISE_PCT, (jitter ?? 0) * 100 * JITTER_FLOOR_MUL);
}

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

/** Whether two runs' milliseconds mean the same thing. */
export function comparable(before: Run, after: Run): boolean {
  if (before.throttle !== after.throttle) return false;
  if (before.viewport.dpr !== after.viewport.dpr) return false;
  if (before.viewport.width !== after.viewport.width) return false;
  const drift = Math.abs(after.calibration - before.calibration) / before.calibration;
  return drift * 100 <= CALIBRATION_TOLERANCE_PCT;
}
