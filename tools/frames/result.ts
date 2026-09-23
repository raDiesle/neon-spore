/**
 * **What a capture answers with**, once it has taken the picture.
 *
 * The mirror of `spec.ts` and split out of `capture.ts` for the same reason
 * that file was: the ceiling CLAUDE.md sets, met again the day `--until-back`
 * needed six lines inside the frame loop. The seam is the one already there —
 * a shape a caller reads, with nothing in it that opens a browser — and
 * `capture.ts` re-exports the name, so nothing that reached for a
 * `CaptureResult` through it had to move.
 */

import type { Sent } from "./report.js";
import type { Fired } from "./until.js";

export interface CaptureResult {
  /** One path per frame, in capture order. */
  paths: string[];
  /**
   * A digest of the **whole** frame's pixels, one per path, whatever was
   * written.
   *
   * `run.ts` refuses to write a before-and-after pair that is the same on both
   * sides, and that refusal has to be about the game rather than about the
   * rectangle somebody asked to look at: a crop could otherwise hide the only
   * difference there was, or frame one that a reader would have found anyway.
   */
  whole: string[];
  /**
   * The `world.tick` each frame was actually taken at, one per path.
   *
   * Printed beside the filename, because a reader who has to work out which
   * tick they are looking at will work it out wrong: `--ticks` is absolute now
   * and a strip's own steps are not, so the second frame of a strip is a tick
   * nobody wrote anywhere. Empty on `--opening guide`, where the clock in
   * front of the camera is the film's rather than the world's.
   */
  atTick: number[];
  /** Whether a rehearsal's page had already played out when the first picture
   * was taken, so every frame after it is the same one (`guide-film.ts`).
   * `undefined` on anything but `--opening guide`. */
  heldPage?: boolean;
  /**
   * Every event the simulation reported on the way to these frames, on the
   * tick it fired.
   *
   * Collected always and printed when asked (`--events`), because the run that
   * has it is the run a reader is about to repeat: *which tick did the hull
   * break on* used to be answered by a sweep of fourteen frames, and it was
   * already in the loop's hand each time (`until.ts`).
   */
  fired: readonly Fired[];
  /** Every press sent on the way, and whether its tick would have heard it —
   * printed whenever one was refused, asked or not (`pressNote`). */
  sent: readonly Sent[];
  /**
   * Every off-origin URL the page asked for on its way to these frames, and
   * was refused (`offline.ts`).
   *
   * Empty is the answer a capture of this checkout should give. It is carried
   * out rather than merely counted because the useful form of the failure
   * names the host: a test that says *37* sends its reader back to the browser,
   * and one that says `https://fonts.googleapis.com/css2?family=…` names the
   * line in `index.html` that has to change.
   */
  offOrigin: string[];
}
