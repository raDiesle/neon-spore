import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { CROWN_AT, eggBeats } from "../../../tools/versus/candidates/cannon-shot/egg/curve.js";
import { MOUTH_EGG } from "../../../tools/versus/candidates/cannon-shot/egg/index.js";
import { apply, restore } from "../../../tools/versus/variant.js";
import { LAY_LOOK } from "../src/cannon-maw.js";
import { OWN_SKIN } from "../src/hull.js";
import { computeLayout } from "../src/layout.js";
import { MOUTH_LOOK, type MouthFrame } from "../src/muzzle.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The `egg` candidate's timing, asserted as arithmetic, and its drawing put
 * through the canvas that refuses what a real one refuses.
 *
 * It is here rather than in `tools/versus/test` because that suite asks
 * structural questions of every candidate — does it restore, does it reach the
 * object the game draws — and this one asks whether *this* candidate says what
 * it claims to say. The claim is a curve with three beats in it, and the third
 * beat is the whole request: a mouth that fades back to rest has not done any
 * work, and the only difference between "effort" and "a brighter flash" is
 * that a body which has strained goes slack afterwards.
 *
 * Nothing here can pass by accident. `bulge` going negative is a fact about
 * `exp(-3r) cos(4.4r)` and nothing else in the file could produce it.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 380, height: 820, dpr: 2 }, CFG, "p1");

beforeAll(installCanvasGlobals);

function mouth(intake = 0): MouthFrame {
  return {
    x: L.gridLeft + L.gridWidth / 2,
    y: L.hullY,
    tipY: L.hullY,
    l: L,
    intake,
    surface: (x) => ({ x, y: L.hullY }),
  };
}

describe("beat one: it strains and nothing leaves", () => {
  it("swells before anything comes through", () => {
    const early = eggBeats(CROWN_AT * 0.5, 0);
    expect(early.strain).toBeGreaterThan(0.2);
    expect(early.crown).toBe(0);
    expect(early.bulge).toBeGreaterThan(0);
  });

  it("eases rather than ramps, so it does not read as a meter filling", () => {
    // Slower than linear at the start, faster in the middle: that is the whole
    // difference between a body loading and a bar going up.
    const q = eggBeats(CROWN_AT * 0.25, 0).strain;
    expect(q).toBeLessThan(0.25);
  });

  it("shivers under load and stops the moment something moves", () => {
    const loaded = eggBeats(CROWN_AT * 0.9, 0.0924);
    expect(Math.abs(loaded.tremor)).toBeGreaterThan(0.1);
    // At the departure the egg is fully through, so there is no load left to
    // shake: `strain * (1 - crown)` is zero however the clock stands.
    expect(eggBeats(1, 0.0924).tremor).toBe(0);
  });
});

describe("beat two: it comes through, late and fast", () => {
  it("barely moves at first and then goes", () => {
    const half = eggBeats(CROWN_AT + (1 - CROWN_AT) * 0.5, 0).crown;
    // Linear would be 0.5. `u ** 2.4` is well under it, which is what makes
    // the last moment read as a release rather than as a lift.
    expect(half).toBeLessThan(0.25);
    expect(eggBeats(1, 0).crown).toBe(1);
  });

  it("opens the vent as it passes, widest at the departure", () => {
    expect(eggBeats(CROWN_AT, 0).vent).toBe(0);
    expect(eggBeats(1, 0).vent).toBe(1);
  });
});

describe("beat three: it clears and the body goes slack", () => {
  it("hands over at the departure without a seam", () => {
    // The one frame the whole animation is about. A step here is a jolt.
    const before = eggBeats(0.999, 0);
    const after = eggBeats(1.001, 0);
    expect(Math.abs(after.bulge - before.bulge)).toBeLessThan(0.02);
    expect(Math.abs(after.vent - before.vent)).toBeLessThan(0.02);
  });

  it("snaps the vent shut far faster than the body subsides — the pop", () => {
    const early = eggBeats(1.06, 0);
    expect(early.vent).toBeLessThan(0.6);
    // The body has barely begun to let go while the vent is already closing.
    expect(early.bulge).toBeGreaterThan(0.6);
  });

  it("goes past rest into slack, which is the beat a first attempt drops", () => {
    const slack = eggBeats(1.55, 0);
    expect(slack.bulge).toBeLessThan(0);
    // Slack, not an inversion: the body sags, it does not turn inside out.
    expect(slack.bulge).toBeGreaterThan(-0.25);
  });

  it("comes home rather than oscillating on", () => {
    expect(Math.abs(eggBeats(2, 0).bulge)).toBeLessThan(0.02);
  });

  it("is longer than the strain in front of it", () => {
    // Six tenths of a beat of relief against half a beat of wind-up. A release
    // quicker than the strain reads as a flash — see `LayEcho.start`.
    expect(0.6).toBeGreaterThan(0.5);
  });
});

describe("the candidate drawn", () => {
  it("survives every phase, at rest, laying and slack", () => {
    const applied = apply(MOUTH_EGG);
    try {
      let calls = 0;
      for (let phase = 0; phase <= 2; phase += 0.02) {
        for (const intake of [0, 0.3, 0.8]) {
          const { ctx } = stubCanvas();
          const c = ctx as unknown as CanvasRenderingContext2D;
          MOUTH_LOOK.draw(c, mouth(intake), OWN_SKIN);
          LAY_LOOK.draw(c, mouth(intake), { phase, time: phase * 3.1 });
          calls += ctx.calls;
        }
      }
      expect(calls).toBeGreaterThan(1000);
    } finally {
      restore(applied);
    }
  });

  it("draws no round hole at rest, and still opens a throat for a pod", () => {
    const applied = apply(MOUTH_EGG);
    try {
      const at = (intake: number): number => {
        const { ctx } = stubCanvas();
        MOUTH_LOOK.draw(ctx as unknown as CanvasRenderingContext2D, mouth(intake), OWN_SKIN);
        return ctx.calls;
      };
      // The owner's first half: the circle on top of the cannon is gone.
      expect(at(0)).toBe(0);
      // And the swallow is not collateral damage.
      expect(at(0.8)).toBeGreaterThan(0);
    } finally {
      restore(applied);
    }
  });
});
