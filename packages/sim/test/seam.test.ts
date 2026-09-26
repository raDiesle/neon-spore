import { describe, expect, it } from "bun:test";
import { SEAM_POINTS } from "../src/seam.js";
import { seamStruck } from "../src/seam-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  CFG,
  install,
  MID,
  runUntil,
  SCRIPT,
  seam,
  shield,
  shot,
  tick,
  toLit,
} from "./seam-rig.js";

/**
 * THE SEAM: a script of steps, each answered with the standard controls — a
 * lit point shot in its colour, grit taken on the shield under the ridge, a
 * rock shot in its column, or grit and a rock at once.
 *
 * What these pin is the gate a phone cannot show: that a shot or a shield
 * outside its own step does nothing, that the wrong colour or column is no
 * answer, that a guard pressed before the step lit is not one either, that a
 * step with two halves waits for both, and that a step run out is the wave.
 */

describe("THE SEAM comes in", () => {
  it("still, the crack dark, nothing sealed", () => {
    const world = install();
    const s = seam(world);
    expect(s.phase).toBe("still");
    expect(s.sealed).toBe(0);
    expect(s.steps).toEqual([...SCRIPT]);
    expect(world.events.some((e) => e.type === "seamEnter")).toBe(true);
  });

  it("lights the first step after it settles, under THE SLOW", () => {
    const world = install();
    const seen = toLit(world);
    expect(seen.has("seamLight")).toBe(true);
    expect(world.beat).toBe(CFG.seamStillBeats);
    expect(seam(world).cursor).toBe(0);
    expect(slowing(world)).toBe(true);
  });

  it("takes no shot before a step is lit", () => {
    const world = install();
    seamStruck(world, shot(MID, "red"));
    expect(seam(world).shot).toBe(false);
  });
});

describe("a point", () => {
  it("wants its own colour: the other is a colour missed, and it stays lit", () => {
    const world = install();
    toLit(world);
    const misses = world.balance.colorMisses;
    seamStruck(world, shot(MID, "cyan"));
    expect(world.balance.colorMisses).toBe(misses + 1);
    expect(seam(world).phase).toBe("lit");
  });

  it("wants its own column", () => {
    const world = install();
    toLit(world);
    seamStruck(world, shot(MID + 1, "red"));
    expect(seam(world).phase).toBe("lit");
  });

  it("shot in its colour dims, rests, and the next step lights", () => {
    const world = install();
    toLit(world);
    seamStruck(world, shot(MID, "red"));
    const s = seam(world);
    expect(world.events.some((e) => e.type === "seamDim")).toBe(true);
    expect(s.phase).toBe("rest");
    expect(s.cursor).toBe(1);
    expect(slowing(world)).toBe(false);
    toLit(world);
    expect(seam(world).cursor).toBe(1);
  });

  it("marked to seal, shot shut, is one of the three", () => {
    const world = install();
    toLit(world);
    answer(world);
    toLit(world);
    answer(world);
    toLit(world);
    seamStruck(world, shot(MID, "cyan"));
    expect(seam(world).sealed).toBe(1);
    expect(world.events.some((e) => e.type === "seamSeal")).toBe(true);
  });
});

describe("grit", () => {
  function toGrit() {
    const world = install();
    toLit(world);
    answer(world);
    toLit(world);
    expect(seam(world).steps[seam(world).cursor]?.ask).toBe("grit");
    return world;
  }

  it("is taken on the shield under the ridge, with the guard pressed", () => {
    const world = toGrit();
    const deflected = world.guard.deflected;
    const seen = shield(world);
    expect(seen.has("seamBlock")).toBe(true);
    expect(world.guard.deflected).toBe(deflected + 1);
    expect(seam(world).phase).toBe("rest");
  });

  it("is not taken on a shield off to the side", () => {
    const world = toGrit();
    shield(world, MID + 1);
    expect(seam(world).phase).toBe("lit");
  });

  it("is not taken by a guard pressed before it lit", () => {
    const world = toGrit();
    world.shieldCol = MID;
    world.guardTick = seam(world).litTick - 1;
    tick(world);
    expect(seam(world).phase).toBe("lit");
  });

  it("takes no shot", () => {
    const world = toGrit();
    seamStruck(world, shot(MID, "red"));
    expect(seam(world).shot).toBe(false);
    expect(seam(world).phase).toBe("lit");
  });
});

describe("a step run out", () => {
  it("is a hull hit, and that is the wave", () => {
    const world = install();
    toLit(world);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.seamPointBeats + 2);
    expect(seen.has("seamMiss")).toBe(true);
  });
});

describe("the rest of the script", () => {
  function toStep(n: number) {
    const world = install();
    for (let i = 0; i < n; i++) {
      toLit(world);
      answer(world);
    }
    toLit(world);
    return world;
  }

  it("spits a rock to one side, shot in its own column and colour", () => {
    const world = toStep(7);
    const rock = MID + 2;
    seamStruck(world, shot(MID, "cyan"));
    seamStruck(world, shot(rock, "red"));
    expect(seam(world).phase).toBe("lit");
    seamStruck(world, shot(rock, "cyan"));
    expect(world.events.some((e) => e.type === "seamRockOut")).toBe(true);
    expect(seam(world).phase).toBe("rest");
  });

  it("the white point takes either colour", () => {
    for (const color of ["red", "cyan"] as const) {
      const world = toStep(9);
      seamStruck(world, shot(MID, color));
      expect(seam(world).sealed).toBe(3);
    }
  });

  it("grit and a rock at once wait for both halves, in either order", () => {
    const world = toStep(10);
    seamStruck(world, shot(MID - 2, "red"));
    expect(seam(world).phase).toBe("lit");
    shield(world);
    expect(seam(world).phase).toBe("rest");

    const other = toStep(10);
    shield(other);
    expect(seam(other).phase).toBe("lit");
    seamStruck(other, shot(MID - 2, "cyan"));
    expect(seam(other).phase).toBe("rest");
  });

  it("answered whole, the sealed ridge splits and the fight ends", () => {
    const world = toStep(10);
    answer(world);
    expect(seam(world).sealed).toBe(SEAM_POINTS);
    const seen = runUntil(world, (w) => w.boss === null);
    expect(seen.has("seamSplit")).toBe(true);
    expect(seen.has("seamOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
