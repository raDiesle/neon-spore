import { describe, expect, test } from "bun:test";
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
    expect(poseForSlot("cannon:shot").name).toBe("SHOT · IN FLIGHT");
    expect(poseForSlot("shield:ward").name).toBe("WARD · DEFLECTED");
  });

  test("a slot with no dedicated pose still gets a real one", () => {
    const pose = poseForSlot("some:unmapped-slot");
    expect(pose.build().tick).toBeGreaterThan(0);
  });
});
