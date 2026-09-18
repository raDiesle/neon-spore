import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, flipSeat, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE FLIP's film, watched: when the pilot's screen turns, and which of the
 * three bolts land.
 *
 * The fault changes no column the world holds, so what the film teaches is
 * entirely in where the cannon is *sent* — to the column the navigator said,
 * to the middle, and last to the column the pilot's eyes gave them. The first
 * two land and the third is fired at an empty column, which is the hit the
 * retries page points at. A change to the fall under it, or a fold that
 * started on another beat, would move a kill onto the wrong page and the
 * picture would not say so; this does.
 */
describe("the rehearsal for THE FLIP", () => {
  it("turns the pilot's screen on the seventh beat, lands the called and the middle, and misses the seen", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theFlip");
    const run = new SceneRun(sceneScript("theFlip", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let flipped: 1 | 2 | null = null;
    for (let t = 0; t < SCENES.theFlip.ticks - 1; t++) {
      const events: SimEvent[] = [];
      // The columns before the tick, because the hit clears the field.
      const cols = run.world.creatures.map((c) => c.col).join(",");
      run.advance(events);
      const w = run.world;
      const now = flipSeat(w);
      if (now !== flipped) seen.push(`turned ${now} @${w.beat}`);
      flipped = now;
      for (const e of events) {
        if (e.type === "fire") seen.push(`fire at ${w.cannonCol} @${w.beat}`);
        else if (e.type === "destroy") seen.push(`destroy @${w.beat}`);
        else if (e.type === "breach") seen.push(`breach by ${cols} @${w.beat}`);
        else if (e.type === "waveFailed") seen.push(`waveFailed @${w.beat}`);
      }
    }
    // Authored columns 1, 3 and 5 are the shipped field's 2, 5 and 8
    // (`scene-script.ts`, `mapCol`): the called one, the middle, the seen one.
    // The body the eyes were trusted on is still in the sixth column, where
    // it was drawn in the second, and it is the one that reaches the hull.
    expect(seen).toEqual([
      "turned 1 @7",
      "fire at 2 @14",
      "destroy @14",
      "fire at 5 @19",
      "destroy @19",
      "fire at 2 @23",
      "waveFailed @36",
      "breach by 8 @36",
    ]);
  });
});
