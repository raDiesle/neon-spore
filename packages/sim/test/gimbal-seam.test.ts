import { describe, expect, it } from "bun:test";
import { midCol } from "../src/config-derived.js";
import { gimbalTeeth, NO_SEAM, type World } from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  CFG,
  FIRST,
  gimbal,
  install,
  letGoTogether,
  lit,
  MARKS,
  onFirstMarks,
  runTo,
  TPB,
} from "./gimbal-harness.js";

/**
 * THE GIMBAL's seam, and the end of it.
 *
 * The second page of `gimbal.test.ts`, cut off it the day it was written:
 * the receipts for the rings alone came to within a few lines of the
 * 250-line ceiling, and the seam is the half of this fight the *cannon*
 * answers rather than a thumb — a hazard on a clock, where everything next
 * door is a bearing. What these pin: that the last tooth pair leaves the
 * seam leaking over the middle, that a bolt of either colour in its column
 * shuts it, that nobody's bolt is one strike on the hull and so the wave,
 * and that the shear after it opens the drum, hangs, and goes.
 */

const MID = midCol(CFG);

/** Both rings onto the first marks and let go of together: the first shear. */
function shorn(world: World): string[] {
  onFirstMarks(world);
  return letGoTogether(world).map((e) => e.type);
}

describe("the seam", () => {
  it("leaks over the middle once one tooth pair is left", () => {
    const world = install();
    lit(world);
    expect(shorn(world)).toContain("gimbalLeak");
    expect(gimbal(world).seamCol).toBe(MID);
  });

  it("is shut by a bolt of either colour in its column", () => {
    const world = install(MARKS, { gimbalSeamBeats: 24 });
    lit(world);
    shorn(world);
    const t = world.tick;
    const seen = runTo(world, t + TPB * 12, [
      { tick: t, player: 1, command: { kind: "cannonCol", col: MID } },
      { tick: t + 2, player: 2, command: { kind: "fire", color: "cyan" } },
    ]);
    expect(seen.map((e) => e.type)).toContain("gimbalSeamOut");
    expect(gimbal(world).seamCol).toBe(NO_SEAM);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("is shut where the bolt meets the bead, and the bolt goes no further", () => {
    const world = install(MARKS, { gimbalSeamBeats: 24 });
    lit(world);
    shorn(world);
    const t = world.tick;
    const seen = runTo(world, t + TPB * 2, [
      { tick: t, player: 1, command: { kind: "cannonCol", col: MID } },
      { tick: t + 2, player: 2, command: { kind: "fire", color: "red" } },
    ]);
    const types = seen.map((e) => e.type);
    expect(types).toContain("gimbalSeamOut");
    // Met on its way up rather than past the top: no shot ever left it.
    expect(types).not.toContain("shotOut");
    expect(world.bullets).toHaveLength(0);
  });

  it("and unanswered is one strike on the hull, which is the wave", () => {
    const world = install();
    lit(world);
    shorn(world);
    const seen = runTo(world, world.tick + TPB * (CFG.gimbalSeamBeats + 1));
    expect(seen.map((e) => e.type)).toContain("gimbalSeamHit");
    expect(gimbal(world).seamCol).toBe(NO_SEAM);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });
});

describe("the last tooth pair", () => {
  it("opens the drum, hangs, and takes the boss off the field", () => {
    const world = install([FIRST], { gimbalSeamBeats: 999 });
    lit(world);
    expect(shorn(world)).toContain("gimbalShear");
    expect(gimbalTeeth(gimbal(world))).toBe(0);
    const beats = (n: number) => runTo(world, world.tick + TPB * n).map((e) => e.type);
    expect(beats(CFG.gimbalShearBeats + 1)).toContain("gimbalHatch");
    expect(beats(CFG.gimbalOpenBeats + 1)).toContain("gimbalOut");
    expect(world.boss).toBe(null);
  });
});
