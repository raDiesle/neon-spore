import { describe, expect, it } from "bun:test";
import type { FlueLevel } from "../src/flue.js";
import { CFG, flue, install, runUntil, shoot, TPB, tick, toLit } from "./flue-rig.js";

/**
 * THE FLUE's two kinds of level beyond weapon, colour and speed (the owner, 7
 * October 2026: *add some more ideas and more levels*): an ember that sets
 * off from the right end and runs the other way, and a level that asks for
 * the ember twice, the first meeting beaming it home with no shot spent.
 */

const RIGHT: FlueLevel = {
  weapon: "bolt",
  color: "red",
  speedMilli: 1000,
  slowMilli: 1000,
  from: "right",
  needs: 1,
};
const TWICE: FlueLevel = { ...RIGHT, from: "left", needs: 2 };
const AFTER: FlueLevel = { ...RIGHT, from: "left" };

describe("a level from the right", () => {
  it("waits at the right end, then runs left", () => {
    const world = install([AFTER, RIGHT]);
    toLit(world);
    shoot(world);
    expect(flue(world).emberMilli).toBe(CFG.flueSpanMilli);
    expect(flue(world).emberDir).toBe(-1);
    toLit(world);
    for (let i = 0; i < 2 * TPB; i += 1) tick(world);
    expect(flue(world).emberMilli).toBeLessThan(CFG.flueSpanMilli);
    expect(flue(world).emberDir).toBe(-1);
  });

  it("starts the fight there when it is the first", () => {
    const world = install([RIGHT]);
    expect(flue(world).emberMilli).toBe(CFG.flueSpanMilli);
  });

  it("is met on its lead, and a wide shot beams it back to the right end", () => {
    const met = install([RIGHT, AFTER]);
    toLit(met);
    expect(shoot(met).has("flueHit")).toBe(true);
    const wide = install([RIGHT, AFTER]);
    toLit(wide);
    shoot(wide, { offMilli: 2000 });
    expect(flue(wide).shots).toBe(CFG.flueShots - 1);
    expect(flue(wide).emberMilli).toBe(CFG.flueSpanMilli);
  });
});

describe("a level met twice", () => {
  it("beams the ember home on the first meeting, spends no shot, and clears on the second", () => {
    const world = install([TWICE, AFTER]);
    toLit(world);
    shoot(world);
    const once = world.events.find((e) => e.type === "flueHit");
    expect(once).toMatchObject({ hits: 0, left: 1 });
    expect(flue(world)).toMatchObject({ met: 1, hits: 0, cursor: 0, phase: "lit" });
    expect(flue(world).shots).toBe(CFG.flueShots);
    expect(flue(world).emberMilli).toBe(-CFG.flueSpanMilli);
    shoot(world);
    expect(flue(world)).toMatchObject({ hits: 1, cursor: 1, phase: "rest" });
  });

  it("keeps a meeting through a shot spent, and starts the next level at nought", () => {
    const world = install([TWICE, AFTER]);
    toLit(world);
    shoot(world);
    shoot(world, { offMilli: 2000 });
    expect(flue(world)).toMatchObject({ met: 1, shots: CFG.flueShots - 1 });
    shoot(world);
    runUntil(world, (w) => flue(w).phase === "lit");
    expect(flue(world)).toMatchObject({ met: 0, hits: 1 });
  });
});
