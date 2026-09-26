import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE RATCHET's rehearsal, run and watched — THE HASP's shape
 * (`scene-hasp.test.ts`). It fails when the catch's depth, the pawl's edge or
 * the spent catch after a click changes beneath a film whose ticks were
 * written against all three: a press with nothing set that climbed clean
 * would make the middle page a lie with nothing on the screen to say so.
 */
describe("the rehearsal for THE RATCHET", () => {
  it("climbs a clean tooth under the catch, and burns the next one pressed with nothing set", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theRatchet");
    const run = new SceneRun(sceneScript("theRatchet", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theRatchet.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type.startsWith("ratchet")) seen.push(`${e.type} @${run.world.beat}`);
      }
    }
    expect(seen).toEqual([
      "ratchetLit @2",
      "ratchetSet @3",
      "ratchetClick @6",
      "ratchetLit @8",
      "ratchetBurn @10",
      "ratchetLit @12",
      "ratchetSet @13",
    ]);
  });
});
