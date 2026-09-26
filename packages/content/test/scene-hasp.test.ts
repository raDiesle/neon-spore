import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE HASP's rehearsal, run and watched — THE GIMBAL's shape
 * (`scene-gimbal.test.ts`). It fails when the latch's depth, the wheel's
 * wind or the seize under a let-go latch changes beneath a film whose ticks
 * were written against all three: a wheel that turned with nobody on the
 * latch would make the middle page a lie with nothing on the screen to say so.
 */
describe("the rehearsal for THE HASP", () => {
  it("seizes the wheel when the latch is let go, and opens a hasp once it is held again", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theHasp");
    const run = new SceneRun(sceneScript("theHasp", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theHasp.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type.startsWith("hasp")) seen.push(`${e.type} @${run.world.beat}`);
      }
    }
    expect(seen).toEqual([
      "haspLit @2",
      "haspGrip @3",
      "haspLet @8",
      "haspSeize @9",
      "haspGrip @12",
      "haspFree @13",
      "haspOpen @14",
      "haspLit @17",
    ]);
  });
});
