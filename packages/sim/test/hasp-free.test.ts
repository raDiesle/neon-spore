import { describe, expect, it } from "bun:test";
import { beat, door, grip, install, lit, rim, runTo, TPB, wind } from "./hasp-rig.js";

/**
 * **`haspFree` is the wheel answering her hand again, and nothing else**
 * (`sim/hasp-step.ts` `sayGate`), because it is the green on her wheel
 * (`render/hasp-fx.ts`): her hand off a seized rim ends the seize without
 * saying the wheel came free, since there is no hand left for it to answer.
 * That his grip frees a wheel she is turning is `hasp.test.ts`'.
 */

describe("the wheel coming free", () => {
  it("is not said when she lifts her hand off a seized wheel", () => {
    const world = install();
    lit(world);
    wind(world, 3);
    beat(world, 1);
    expect(door(world).seized).toBe(true);
    const t = world.tick;
    const said = runTo(world, t + TPB + 1, [rim(t, 0, false)]);
    expect(said.has("haspFree")).toBe(false);
    expect(door(world).seized).toBe(false);
  });

  it("is said once his thumb is down, with hers still on the rim", () => {
    const world = install();
    lit(world);
    wind(world, 3);
    beat(world, 1);
    grip(world);
    expect(beat(world, 1).has("haspFree")).toBe(true);
  });
});
