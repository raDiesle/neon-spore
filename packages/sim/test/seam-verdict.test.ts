import { describe, expect, it } from "bun:test";
import { hashWorld } from "../src/hash.js";
import { type SeamStep, seamLitStep, seamStepCol } from "../src/seam.js";
import { seamStruck, seamVerdict } from "../src/seam-shot.js";
import { install, MID, seam, shot, toLit } from "./seam-rig.js";

/**
 * **`seamVerdict` is `seamStruck` asked, not acted on**: the picture stops a
 * bolt where it meets the ridge with the verdict the simulation will give it
 * at row 0, so the two must never disagree, and asking must change nothing.
 */

const RED: SeamStep = { ask: "point", color: "red", offset: 0, seals: false };
const ROCK: SeamStep = { ask: "rock", color: "cyan", offset: 2, seals: false };
const DECOY: SeamStep = { ask: "decoy", color: "either", offset: 0, seals: false };

function lit(steps: readonly SeamStep[]) {
  const world = install(steps);
  toLit(world);
  const step = seamLitStep(seam(world));
  if (step === null) throw new Error("nothing is lit");
  return { world, col: seamStepCol(world, step) };
}

describe("seamVerdict", () => {
  it("names the lit point in its colour the target, and the other colour wrong", () => {
    const { world, col } = lit([RED]);
    expect(seamVerdict(world, col, "red")).toBe("target");
    expect(seamVerdict(world, col, "cyan")).toBe("wrong");
    expect(seamVerdict(world, col + 1, "red")).toBe(null);
  });

  it("puts the rock in its own column", () => {
    const { world, col } = lit([ROCK]);
    expect(col).not.toBe(MID);
    expect(seamVerdict(world, col, "cyan")).toBe("target");
    expect(seamVerdict(world, MID, "cyan")).toBe(null);
  });

  it("calls the false point held fire, in either colour", () => {
    const { world } = lit([DECOY]);
    expect(seamVerdict(world, MID, "red")).toBe("held");
    expect(seamVerdict(world, MID, "cyan")).toBe("held");
    expect(seamVerdict(world, MID + 1, "red")).toBe(null);
  });

  it("changes nothing, and agrees with seamStruck on every column and colour", () => {
    for (const steps of [[RED], [ROCK], [DECOY]]) {
      for (let c = 0; c < install().cfg.cols; c++) {
        for (const color of ["red", "cyan"] as const) {
          const { world } = lit(steps);
          const before = hashWorld(world);
          const v = seamVerdict(world, c, color);
          expect(hashWorld(world)).toBe(before);
          expect(seamStruck(world, shot(c, color))).toBe(v !== null);
        }
      }
    }
  });
});
