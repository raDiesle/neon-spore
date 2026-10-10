import { describe, expect, it } from "bun:test";
import { bastionStruck } from "../src/bastion-shot.js";
import { OWN_WRONG_COLOUR, wrongColourFails } from "../src/boss-wrong-colour.js";
import { failHolds, NOT_FAILED } from "../src/wave-fail.js";
import { bastion, hashWorld, install, MID, only, shot, toLayer } from "./bastion-rig.js";

/**
 * The owner, 10 October 2026: a boss shot in the wrong colour loses the wave,
 * on the tick it is met, and says why (`boss-wrong-colour.ts`).
 */
describe("a boss shot in the wrong colour", () => {
  it("loses THE BASTION's wave on the tick the gun at the front is met", () => {
    const world = install(only("ring"));
    toLayer(world);
    world.events.length = 0;
    expect(bastionStruck(world, shot(MID, "cyan"))).toBe(true);
    expect(world.failTick).toBe(world.tick);
    expect(world.failCause).toBe("wrongColour");
    expect(world.events).toContainEqual({ type: "waveFailed", wave: 0, cause: "wrongColour" });
    expect(world.balance.colorMisses).toBe(1);
  });

  it("costs nothing on the armour, and nothing in the right colour", () => {
    const world = install(only("ring"));
    toLayer(world);
    bastionStruck(world, shot(MID + 1, "cyan"));
    bastionStruck(world, shot(MID, "red"));
    expect(failHolds(world)).toBe(false);
    expect(bastion(world).phase).not.toBe("idle");
  });

  it("is off in a film, which turns it off by config", () => {
    const world = install(only("ring"));
    world.cfg.bossWrongColourFails = false;
    toLayer(world);
    bastionStruck(world, shot(MID, "cyan"));
    expect(world.failTick).toBe(NOT_FAILED);
    expect(world.balance.colorMisses).toBe(1);
  });

  it("is not a shot at the boss once the wave is cleared", () => {
    const world = install(only("ring"));
    toLayer(world);
    world.restBeat = world.beat + 1;
    wrongColourFails(world);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("leaves the bosses whose wrong colour answers itself", () => {
    expect([...OWN_WRONG_COLOUR].sort()).toEqual(["baton", "curtain", "gorge", "hive", "taster"]);
    const world = install(only("ring"));
    toLayer(world);
    const boss = world.boss;
    if (boss === null) throw new Error("no boss");
    for (const kind of OWN_WRONG_COLOUR) {
      world.boss = { ...boss, kind } as typeof boss;
      wrongColourFails(world);
      expect(world.failTick).toBe(NOT_FAILED);
    }
  });

  it("is in the fingerprint", () => {
    const world = install(only("ring"));
    toLayer(world);
    const before = hashWorld(world);
    world.failCause = "wrongColour";
    expect(hashWorld(world)).not.toBe(before);
  });
});
