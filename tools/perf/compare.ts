import { JITTER_UNUSABLE, NOISE_PCT, noiseFloorFor } from "./noise.js";
import type { Run, WaveCost, WaveDelta } from "./run-types.js";
import { keyOf, shapeOf } from "./shape.js";

/**
 * What a performance run *is*, and what two of them say when held side by side.
 *
 * Its own file beside `run.ts` because none of it opens a browser: everything
 * here is arithmetic over numbers somebody already measured, which is the half
 * a test can hold. `measure.ts` produces a `Run`, `run.ts` prints one and
 * writes it down, and this file is the only place that decides what "worse"
 * means.
 */

/** Putting runs on one footing, and one row into another run's baseline. The
 * subject is `shape.ts`'s; every caller already asks this file, so both names
 * come through here rather than moving. */
export { keyOf, medianMs, mergeInto, shapeOf } from "./shape.js";

/** One 60 Hz frame and the two readings taken as a fraction of it. The subject
 * is `sweep-timing.ts`'s, which owns the frame and is what the phone's own
 * readout measures against; every caller asks this file, so they come through
 * here rather than moving. */
export { budgetPct, FRAME_MS, verdictFor } from "./sweep-timing.js";

/**
 * How much slower than the measuring machine the run pretends to be. 4 is what
 * Chrome DevTools labels *mid-tier mobile* and 6 *low-end mobile*; those two
 * names are the whole reason the number is not something rounder.
 */
export const DEFAULT_THROTTLE = 4;

/** The record a run writes and the row a comparison hands back. The subject is
 * `run-types.ts`'s; ten files already ask this one for all three, so they come
 * through here rather than moving. */
export type { Run, WaveCost, WaveDelta } from "./run-types.js";

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
/** A row with no comparison in it: the figures as they stand and a verdict
 * saying why none was taken. Two branches of `compareRuns` end here. */
function noVerdict(w: WaveCost, before: number, verdict: WaveDelta["verdict"]): WaveDelta {
  const at = w.unmeasured === true ? 0 : w.typical;
  return {
    wave: w.wave,
    name: w.name,
    before,
    after: at,
    changePct: 0,
    floorPct: NOISE_PCT,
    verdict,
  };
}

export function compareRuns(before: Run, after: Run): WaveDelta[] {
  const was = new Map(before.waves.map((w) => [keyOf(w), w]));
  // **Like for like.** A narrow run's median is taken over the waves it
  // measured, so the baseline's is taken over the same ones or the two shares
  // are shares of different games — THE GAUGE alone, at a fifth of any other
  // wave, moves a sweep's median somewhere a three-wave run's cannot reach.
  const covered = new Set(after.waves.map((w) => keyOf(w)));
  const wasShape = shapeOf(
    after.waves.length === before.waves.length
      ? before
      : { ...before, waves: before.waves.filter((w) => covered.has(keyOf(w))) },
  );
  const nowShape = shapeOf(after);
  const out: WaveDelta[] = [];
  for (const now of after.waves) {
    const then = was.get(keyOf(now));
    // Not a regression and not a new wave: an absence. `new` would read as
    // "here is this wave's first figure", and there is none (`unmeasured.ts`).
    if (now.unmeasured === true || then?.unmeasured === true) {
      out.push(noVerdict(now, 0, "unmeasured"));
      continue;
    }
    const thenShare = wasShape.get(keyOf(now));
    const nowShare = nowShape.get(keyOf(now));
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
      out.push(noVerdict(now, then?.typical ?? 0, "new"));
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
