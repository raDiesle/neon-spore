import { describe, expect, test } from "bun:test";
import { chargeMilli, laying, step } from "@neon-spore/sim";
import { VARIANTS } from "../../versus/candidates/index.js";
import { slots } from "../../versus/variant.js";
import { poseForSlot } from "../src/versus-pose.js";

/**
 * Every open slot gets a pose that actually reaches the state it patches —
 * the fix for the second half of the owner's guess in `docs/queue.md`: the
 * sheet used to open every slot on one fixed pose regardless of which one
 * was showing, so a `cannon:shot` or `shield:ward` candidate sat beside its
 * shipped look with nothing on screen to tell them apart. `poseForSlot`
 * throws on a name `poses.ts` no longer carries, and `pose.build()` throws if
 * the pose it names never reaches its own state (`pose-kit.ts`'s `until`) —
 * together they mean a slot that regresses to the wrong pose fails here
 * rather than showing a silent nothing on the real page.
 */
describe("poseForSlot", () => {
  test("every open slot resolves to a real pose that reaches its own state", () => {
    for (const slot of slots(VARIANTS)) {
      const pose = poseForSlot(slot.slot);
      const world = pose.build();
      expect(world.tick, `${slot.slot} · ${pose.name}`).toBeGreaterThan(0);
    }
  });

  test("cannon:shot and shield:ward each get the pose that puts their own body on screen", () => {
    expect(poseForSlot("cannon:shot").name).toBe("SHOT · BEING LAID");
    expect(poseForSlot("cannon:mouth").name).toBe("SHOT · BEING LAID");
    expect(poseForSlot("shield:ward").name).toBe("WARD · DEFLECTED");
  });

  test("a cannon slot is handed a world with the shot still in the muzzle", () => {
    // The defect this replaces: `SHOT · IN FLIGHT` is held thirty ticks after
    // the press, so every part of firing a shot had already happened inside
    // `build` and the page showed only a bolt in transit. A candidate for how
    // a shot *leaves* had nothing to be compared against.
    const world = poseForSlot("cannon:shot").build();
    expect(laying(world)).toBe(true);
    expect(world.bullets).toHaveLength(0);
    expect(chargeMilli(world)).toBeLessThan(1000);
  });

  test("and keeps firing on its own, with nobody pressing anything", () => {
    // What `versus-pair.ts` does: step, and rebuild when the world asks for a
    // wave. Nothing else. If the loop stops, the sheet goes quiet after one
    // shot and the difference between two candidates is gone with it.
    const pose = poseForSlot("cannon:shot");
    let world = pose.build();
    let departures = 0;
    let inTheMuzzle = 0;
    const TICKS = 900;
    for (let i = 0; i < TICKS; i++) {
      step(world, []);
      departures += world.events.filter((e) => e.type === "fire").length;
      if (laying(world)) inTheMuzzle++;
      if (world.events.some((e) => e.type === "needWave")) world = pose.build();
    }
    // Roughly one every 148 ticks, and every one of them seen live rather
    // than spent inside `build`.
    expect(departures).toBeGreaterThan(4);
    // And a quarter of the time there is something in the mouth to look at.
    expect(inTheMuzzle).toBeGreaterThan(TICKS / 6);
  });

  test("a slot with no dedicated pose still gets a real one", () => {
    const pose = poseForSlot("some:unmapped-slot");
    expect(pose.build().tick).toBeGreaterThan(0);
  });
});
