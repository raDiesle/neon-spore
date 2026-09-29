import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE MAZE's film, watched: the one long pull ends with the way in clicked onto
 * the middle column, before the shot is fired down it.
 *
 * The pull's length is the one number in that film that is measured rather
 * than reasoned about (`scenes/the-maze.ts`), and it is measured against the
 * lever's gearing — so when the gearing went 1:1 (27 September 2026) the film
 * stopped a quarter of the way round, clicked nothing, and no test said so.
 */
describe("the rehearsal for THE MAZE", () => {
  it("clicks the way in onto the middle column before the shot", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theMaze");
    const run = new SceneRun(sceneScript("theMaze", wave, DEFAULT_CONFIG));
    const commits: string[] = [];
    for (let t = 0; t < SCENES.theMaze.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      for (const e of events) if (e.type === "mazeCommit") commits.push(`col ${e.col} @${t}`);
    }
    expect(commits.length).toBe(1);
    const [col, at] = (commits[0] ?? "").replace("col ", "").split(" @").map(Number);
    expect(col).toBe(Math.floor(DEFAULT_CONFIG.cols / 2));
    // Before the red shot the film fires at 700, and inside the pull's own carry.
    expect(at).toBeLessThan(700);
  });
});
