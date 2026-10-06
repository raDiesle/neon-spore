import { describe, expect, it } from "bun:test";
import { NOT_FAILED } from "../src/wave-fail.js";
import { CFG, flue, runUntil, shoot, TPB, tick, toLevel, toLit } from "./flue-rig.js";

/**
 * THE FLUE, the shot: met over the cannon in the level's weapon and colour it
 * clears the level; wide, or in the other colour or weapon, it spends one of
 * three; the third spent is the wave, and the next level has three again.
 */

/** The `why` of every `flueMiss` the last tick raised, in order. */
function whys(world: Parameters<typeof flue>[0]): string[] {
  return world.events.flatMap((e) => (e.type === "flueMiss" ? [e.why] : []));
}

/** One shot of the level's own, sent too late to meet the ember. */
function wide(world: Parameters<typeof flue>[0]): Set<string> {
  return shoot(world, { offMilli: 2000 });
}

describe("a bolt", () => {
  it("met over the cannon in the level's colour clears the level", () => {
    const world = toLevel(0);
    const seen = shoot(world);
    expect(seen.has("flueHit")).toBe(true);
    expect(flue(world).hits).toBe(1);
    expect(flue(world).cursor).toBe(1);
  });

  it("wide of the ember spends a shot, and the ember is beamed back to the left end", () => {
    const world = toLevel(0);
    const seen = wide(world);
    expect(seen.has("flueMiss")).toBe(true);
    expect(whys(world)).toEqual(["wide"]);
    expect(flue(world).shots).toBe(CFG.flueShots - 1);
    expect(flue(world).phase).toBe("lit");
    expect(flue(world).emberMilli).toBe(-CFG.flueSpanMilli);
    runUntil(world, (w) => flue(w).emberMilli !== -CFG.flueSpanMilli);
    expect(flue(world).emberMilli).toBeGreaterThan(-CFG.flueSpanMilli);
  });

  it("holds the beamed-back ember at the left end for flueBeamBeats", () => {
    const world = toLevel(0);
    wide(world);
    for (let i = 0; i < CFG.flueBeamBeats * TPB; i += 1) tick(world);
    expect(flue(world).emberMilli).toBe(-CFG.flueSpanMilli);
  });

  it("met on its lead after a miss, still on the grid, clears the level", () => {
    const world = toLevel(0);
    wide(world);
    expect(shoot(world).has("flueHit")).toBe(true);
  });

  it("in the other colour is refused on the ember and spends a shot", () => {
    const world = toLevel(0);
    shoot(world, { color: "cyan" });
    expect(whys(world)).toEqual(["color"]);
    expect(flue(world).shots).toBe(CFG.flueShots - 1);
    expect(flue(world).hits).toBe(0);
  });

  it("on a beam level is the wrong weapon and spends a shot", () => {
    const world = toLevel(2);
    shoot(world, { weapon: "bolt" });
    expect(whys(world)).toEqual(["weapon"]);
    expect(flue(world).shots).toBe(CFG.flueShots - 1);
    expect(flue(world).hits).toBe(2);
  });
});

describe("a beam", () => {
  it("held early enough to go off with the ember over the cannon clears the level", () => {
    const world = toLevel(2);
    const seen = shoot(world);
    expect(seen.has("flueHit")).toBe(true);
    expect(flue(world).hits).toBe(3);
  });

  it("meets an ember half inside the sight, and not one outside it", () => {
    const half = toLevel(2);
    expect(shoot(half, { offMilli: CFG.flueHitMilli - 60 }).has("flueHit")).toBe(true);
    const out = toLevel(2);
    expect(shoot(out, { offMilli: CFG.flueHitMilli + 120 }).has("flueMiss")).toBe(true);
  });

  it("gone off with the ember elsewhere spends a shot", () => {
    const world = toLevel(2);
    wide(world);
    expect(flue(world).shots).toBe(CFG.flueShots - 1);
  });
});

describe("three shots", () => {
  it("the third spent is the hull, and the wave", () => {
    const world = toLevel(0);
    wide(world);
    wide(world);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = wide(world);
    expect(seen.has("breach")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("come back whole on the next level", () => {
    const world = toLevel(0);
    wide(world);
    wide(world);
    shoot(world);
    toLit(world);
    expect(flue(world).shots).toBe(CFG.flueShots);
  });

  it("are not spent by a bolt between levels", () => {
    const world = toLevel(0);
    shoot(world);
    tick(world, [{ player: 2, command: { kind: "fire", color: "red" } }]);
    runUntil(world, (w) => w.bullets.length === 0, 2);
    expect(flue(world).shots).toBe(CFG.flueShots);
    expect(world.tick).toBeGreaterThan(TPB);
  });
});
