import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE GIMBAL's rehearsal, run and watched — THE SPOOL's shape
 * (`scene-spool.test.ts`). It fails when the ring's turn, its mirror or the
 * drift under it changes beneath a film whose ticks were written against all
 * three: a navigator's thumb that turned her ring the wrong way would leave
 * the pair never true, and the film silently a film of nothing happening.
 */
describe("the rehearsal for THE GIMBAL", () => {
  it("turns both rings true, holds them, and shears a tooth off each", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theGimbal");
    const run = new SceneRun(sceneScript("theGimbal", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let held = "";
    for (let t = 0; t < SCENES.theGimbal.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type.startsWith("gimbal")) seen.push(`${e.type} @${run.world.beat}`);
      }
      const b = run.world.boss;
      if (b?.kind === "gimbal" && run.tick === 500) held = b.atMilli.join(",");
    }
    expect(seen).toEqual(["gimbalMarks @2", "gimbalTrue @8", "gimbalShear @9", "gimbalMarks @12"]);
    // The same quarter on the true wheel for both — hers written the other
    // way round on her own face.
    expect(held).toBe("250,250");
  });
});
