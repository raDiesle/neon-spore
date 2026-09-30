import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type StareState,
  stareBlue,
  stareBoss,
  stareClearShot,
  startWave,
} from "../src/index.js";

/**
 * The two clocks the hands and the cue read THE STARE by (`sim/stare.ts`):
 * whether the eye is on its blue pass, and whether a shot now is a clean one.
 * Neither is re-derived outside the simulation, so both are proved here.
 */

/** An eye on `..x.x`, set by hand to `phase`, `into` beats into it. */
function eye(phase: StareState["phase"], open: boolean, into = 0, pass = 0): StareState {
  const world = createWorld(DEFAULT_CONFIG, 3);
  startWave(world, 6, [], [], { kind: "stare", levels: ["..x.x"] });
  const s = stareBoss(world);
  if (s === null) throw new Error("no eye installed");
  s.phase = phase;
  s.phaseBeat = 100 - into;
  s.open = open;
  s.pass = pass;
  return s;
}

describe("stareBlue", () => {
  it("is the teaching pass, and the rest before it", () => {
    expect(stareBlue(eye("teach", false))).toBe(true);
    expect(stareBlue(eye("rest", false, 0, 0))).toBe(true);
  });

  it("is not a rest between live passes, nor a live pass", () => {
    expect(stareBlue(eye("rest", false, 0, 1))).toBe(false);
    expect(stareBlue(eye("live", false))).toBe(false);
    expect(stareBlue(eye("charge", false))).toBe(false);
  });
});

describe("stareClearShot", () => {
  it("holds on a shut live beat with a shut beat after it", () => {
    expect(stareClearShot(eye("live", false, 0), 100)).toBe(true);
  });

  it("does not hold when the next beat opens", () => {
    // Beat 1 of `..x.x`: the eye opens on beat 2, where the bolt would land.
    expect(stareClearShot(eye("live", false, 1), 100)).toBe(false);
    expect(stareClearShot(eye("live", false, 3), 100)).toBe(false);
  });

  it("does not hold on an open beat, or outside a live pass", () => {
    expect(stareClearShot(eye("live", true, 0), 100)).toBe(false);
    expect(stareClearShot(eye("teach", false, 0), 100)).toBe(false);
    expect(stareClearShot(eye("rest", false, 0), 100)).toBe(false);
    expect(stareClearShot(eye("charge", false, 0), 100)).toBe(false);
  });
});
