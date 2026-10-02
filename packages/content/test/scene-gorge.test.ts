import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE GORGE's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE GORGE", () => {
  it("feeds four bubbles their colour, loses a shot to the wrong one, and clears the level", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theGorge");
    const run = new SceneRun(sceneScript("theGorge", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theGorge.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "gorgeSwallow")
          seen.push(`swallow ${e.col} ${e.color} ${e.beads} @${run.world.beat}`);
        else if (e.type === "gorgeEmptied")
          seen.push(`emptied ${e.col} ${e.beads} @${run.world.beat}`);
        else if (e.type === "gorgeFull") seen.push(`full ${e.col} @${run.world.beat}`);
        else if (e.type === "gorgeCleared") seen.push(`cleared ${e.level} @${run.world.beat}`);
        else if (e.type === "gorgeOut") seen.push(`out @${run.world.beat}`);
        else if (e.type.startsWith("gorge")) seen.push(e.type);
      }
    }
    // A red into the left bubble, which wants two; a cyan into it, which takes
    // the red back out; two reds to full; then one shot of its colour each
    // into the other three, and the level is clear. The ring and its tap are
    // later levels, never in the film.
    expect(seen).toEqual([
      "swallow 3 red 1 @14",
      "emptied 3 0 @18",
      "swallow 3 red 1 @21",
      "swallow 3 red 2 @22",
      "full 3 @22",
      "swallow 4 red 1 @27",
      "full 4 @27",
      "swallow 5 cyan 1 @31",
      "full 5 @31",
      "swallow 6 cyan 1 @35",
      "full 6 @35",
      "cleared 0 @35",
      "out @39",
    ]);
  });
});
