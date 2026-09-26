import { describe, expect, it } from "bun:test";
import { codexSwapped, DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE CODEX's film, watched: red refused by a red body, then cyan taking it,
 * both fired while the key is turned over.
 *
 * The key is a function of the wave's beat (`codexSwapped`), so a press moved
 * a beat either way can land in a clear hold instead, where red simply kills
 * red and the film shows an ordinary shot under a caption about a lie. Nothing
 * in the picture would say so; this does.
 */
describe("the rehearsal for THE CODEX", () => {
  it("refuses red and takes cyan, each shot leaving in a swapped hold", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theCodex");
    const run = new SceneRun(sceneScript("theCodex", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theCodex.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      for (const e of events) {
        if (e.type === "fire")
          seen.push(`fire ${e.color} ${codexSwapped(run.world) ? "swapped" : "clear"}`);
        if (e.type === "reject" || e.type === "destroy") seen.push(e.type);
      }
    }
    expect(seen).toEqual(["fire red swapped", "reject", "fire cyan swapped", "destroy"]);
  });
});
