import { describe, expect, it } from "bun:test";
import { countdownMarks, DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE COUNT's film, watched: the shot on sight refused, and the shot on zero
 * taken.
 *
 * The count's phase is rolled off the seed on the beat the body enters
 * (`countdownOnSpawn`), so the film's two presses are written against what
 * seed 1 rolls. A change to the stream under it would move the zeros under the
 * captions — the first shot landing open, the second landing shut — and
 * nothing in the picture would say so; this does.
 */
describe("the rehearsal for THE COUNT", () => {
  it("refuses the shot with marks up, and takes the one on zero", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theCount");
    const run = new SceneRun(sceneScript("theCount", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theCount.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      const body = run.world.creatures[0];
      for (const e of events) {
        if (e.type !== "reject" && e.type !== "destroy") continue;
        const marks = body ? countdownMarks(run.world.cfg, run.world.beat, body) : 0;
        seen.push(`${e.type} marks ${marks} @${run.world.beat}`);
      }
    }
    // The first bolt lands on the beat after a zero, with every blade back up,
    // and shuts it grey for three beats: the price the second page names. The
    // second waits for the next zero, the last before the body reaches the
    // hull.
    expect(seen).toEqual(["reject marks 4 @9", "destroy marks 0 @14"]);
  });
});
