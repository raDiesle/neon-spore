import type { Pose } from "./pose-kit.js";

/**
 * **The probe's own clock**: how far apart its samples stand, how many it
 * takes, and how much time each one tells the renderer has passed.
 *
 * Its own file beside `versus-seat.ts`, split off when that one reached the
 * 250-line ceiling, along the seam it already had. Next door decides *which
 * seats a candidate is worth drawing* — a question about two difference
 * pictures and whether they agree — and everything here is about *when to
 * look*, which is a question about a pose's own tempo and about what a page
 * can afford to spend before a row appears. Neither half reads the other's
 * reasoning, and the sixty lines of argument above `seatPlan` were what made
 * that hard to see.
 */

/** How many ticks apart each sample is, and how many samples are taken —
 * `SAMPLES * SAMPLE_EVERY` ticks is comfortably past one `waveRestBeats`
 * rebuild at the default tempo, so a transient tied to the pose's opening
 * moment is not the only thing this ever looks at. The floor: a pose with a
 * cadence of its own stretches both (`probeSchedule`). */
const SAMPLE_EVERY = 6;
const SAMPLES = 24;
/** The most samples a long pose is allowed to cost. Two seats, two renders
 * and a `getImageData` each, at page open: past this the row is slow to
 * appear, so a long cadence widens the stride rather than the count. */
const MAX_SAMPLES = 48;

/** The probe's own clock: ticks between samples, how many, and how much
 * time each sample tells the renderer has passed. */
export interface ProbeSchedule {
  readonly every: number;
  readonly samples: number;
  /** Seconds per sample — `every / tickHz`, never a frame of the wall clock. */
  readonly dt: number;
}

/**
 * **The renderer is told the time the simulation actually advanced, and the
 * probe runs for at least one loop of the pose.** Until 10 September 2026 it
 * handed every sample `dt: 1 / 60` while stepping six ticks between them, so
 * effects aged six times slower than the world they were drawn over. A look
 * *revealed* by an effect — a crater, hidden by `RockImpactFx.coversCrater`
 * until the rock has lain in it and rolled off — never appeared inside the
 * 144 ticks sampled, and `ship:crater` was reported as moving nothing on
 * either seat: one screen, and *under the floor* printed beneath a candidate
 * that repaints a hull's worth of pixels.
 *
 * So `dt` is `every / tickHz`, and a pose that carries `cadenceSeconds` is
 * sampled across the whole of it, with the stride widened rather than the
 * count grown once `MAX_SAMPLES` would be passed. A pose with no cadence keeps
 * the old span exactly.
 */
export function probeSchedule(pose: Pose, tickHz: number): ProbeSchedule {
  const span = Math.max(SAMPLES * SAMPLE_EVERY, Math.ceil((pose.cadenceSeconds ?? 0) * tickHz));
  const every = Math.max(SAMPLE_EVERY, Math.ceil(span / MAX_SAMPLES));
  const samples = Math.ceil(span / every);
  return { every, samples, dt: every / tickHz };
}
