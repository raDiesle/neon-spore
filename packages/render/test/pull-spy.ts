import { PULL_KNOB, type PullKnobDraw } from "../src/pull-knob.js";
import { PULL_TRACK, type PullTrack, type PullTrackDraw } from "../src/pull-track.js";

/**
 * **What the PULL LAB's knob and channel were asked to draw**, and nothing
 * drawn: for a handle's test that asks *is the pull there, held, how far* —
 * the knob's own look lights itself with gradients and colours of its own
 * (`goo-knob.ts`), which a test counting a halo's gradient would otherwise
 * count too. `drawPullKnob` and `drawPullTrack` still run, so their sizing and
 * `PullMemory` are what the game's are; only the paint is held.
 */
export interface PullSpied {
  readonly knobs: PullKnobDraw[];
  readonly tracks: { t: PullTrack; o: PullTrackDraw }[];
}

export function spyPulls<T>(run: () => T): PullSpied & { out: T } {
  const inner = { knob: PULL_KNOB.paint, track: PULL_TRACK.paint };
  const knobs: PullKnobDraw[] = [];
  const tracks: { t: PullTrack; o: PullTrackDraw }[] = [];
  PULL_KNOB.paint = (_c, _at, _r, o) => {
    knobs.push(o);
  };
  PULL_TRACK.paint = (_c, t, o) => {
    tracks.push({ t, o });
  };
  try {
    return { knobs, tracks, out: run() };
  } finally {
    PULL_KNOB.paint = inner.knob;
    PULL_TRACK.paint = inner.track;
  }
}
