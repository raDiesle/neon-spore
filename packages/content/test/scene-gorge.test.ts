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
  it("swallows a stray, fills and pierces two intakes, and spits the stray back to be broken", () => {
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
        else if (e.type === "gorgeRupture")
          seen.push(`rupture ${e.col} ${e.left} @${run.world.beat}`);
        else if (e.type === "gorgeSpit") seen.push(`spit ${e.col} ${e.color} @${run.world.beat}`);
        else if (e.type === "gorgeVent" || e.type === "gorgeMouth") seen.push(e.type);
        else if (e.type === "destroy") seen.push(`destroy ${e.kind} ${e.col} @${run.world.beat}`);
      }
    }
    // The stray red into the middle intake first; three cyan into the one
    // player 1 picked, a red taking one back out, two more cyan to full and
    // two more through it; four red into the next and two more through
    // that; then the twice-pierced sack spits the stray down the middle,
    // where its own colour breaks it. Nothing vents and the mouth never opens.
    expect(seen).toEqual([
      "swallow 5 red 1 @5",
      "swallow 3 cyan 1 @14",
      "swallow 3 cyan 2 @15",
      "swallow 3 cyan 3 @16",
      "emptied 3 2 @20",
      "swallow 3 cyan 3 @23",
      "swallow 3 cyan 4 @24",
      "full 3 @24",
      "rupture 3 6 @28",
      "swallow 7 red 1 @34",
      "swallow 7 red 2 @35",
      "swallow 7 red 3 @36",
      "swallow 7 red 4 @37",
      "full 7 @37",
      "rupture 7 5 @40",
      "spit 5 red @41",
      "destroy slick 5 @51",
    ]);
  });
});
