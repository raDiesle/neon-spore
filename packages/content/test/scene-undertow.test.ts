import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE UNDERTOW's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE UNDERTOW", () => {
  // The four lessons of the rework of 1 October 2026, in the order the pages
  // say them: the shield takes the cyan lobe, SUCK the yellow one, a tap puts
  // a tall one back, and the one nobody taps the second time bursts.
  it("takes a lobe each way, taps one down and lets it burst", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theUndertow");
    const run = new SceneRun(sceneScript("theUndertow", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theUndertow.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "undertowLobe") seen.push(`lobe ${e.answer} @${run.world.beat}`);
        if (
          e.type === "undertowTaken" ||
          e.type === "undertowGrow" ||
          e.type === "undertowTapped"
        ) {
          seen.push(`${e.type.slice(8).toLowerCase()} @${run.world.beat}`);
        }
        if (e.type === "undertowBurst") seen.push(`burst @${run.world.beat}`);
      }
    }
    expect(seen).toEqual([
      "lobe shield @6",
      "taken @6",
      "lobe maw @11",
      "taken @14",
      "lobe maw @19",
      "grow @27",
      "tapped @28",
      "grow @36",
      "burst @44",
    ]);
  });
});
