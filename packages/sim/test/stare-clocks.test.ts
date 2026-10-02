import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type StareState,
  stareBlue,
  stareBoss,
  stareChargeLength,
  stareLashesOwed,
  stareTurnsLeft,
  startWave,
} from "../src/index.js";

/**
 * The clocks the hands, the cue and the picture read THE STARE by
 * (`sim/stare.ts`): whether the eye is on its blue pass, how many lashes and
 * beats a charge asks, and how many turns are left. None is re-derived
 * outside the simulation, so all are proved here.
 */

/** An eye on `..x.x`, set by hand to `phase`, `into` beats into it. */
function eye(phase: StareState["phase"], open: boolean, into = 0, turn = 0): StareState {
  const world = createWorld(DEFAULT_CONFIG, 3);
  startWave(world, 6, [], [], { kind: "stare", levels: ["..x.x"] });
  const s = stareBoss(world);
  if (s === null) throw new Error("no eye installed");
  s.phase = phase;
  s.phaseBeat = 100 - into;
  s.open = open;
  s.turn = turn;
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

describe("stareLashesOwed and stareChargeLength", () => {
  it("asks stareLashesFirst on the first level and doubles on each after", () => {
    const s = eye("charge", false);
    const owed = [0, 1, 2, 3].map((level) => stareLashesOwed({ ...s, level }, DEFAULT_CONFIG));
    expect(owed).toEqual([4, 8, 16, 32]);
  });

  it("gives a charge more beats for every lash it asks", () => {
    const s = eye("charge", false);
    const beats = [0, 3].map((level) => stareChargeLength({ ...s, level }, DEFAULT_CONFIG));
    expect(beats).toEqual([5, 13]);
  });
});

describe("stareTurnsLeft", () => {
  it("counts the turn being played, down to one", () => {
    expect(stareTurnsLeft(eye("live", false, 0, 0), DEFAULT_CONFIG)).toBe(
      DEFAULT_CONFIG.stareTurns,
    );
    expect(stareTurnsLeft(eye("live", false, 0, 4), DEFAULT_CONFIG)).toBe(1);
  });
});
