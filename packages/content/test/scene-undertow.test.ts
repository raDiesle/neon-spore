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
  it("scars one lobe left alone, takes three with the maw, and plates the far one of a pair", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theUndertow");
    const run = new SceneRun(sceneScript("theUndertow", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theUndertow.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "undertowTaken" || e.type === "undertowScar") {
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        }
      }
    }
    // The first lobe is nobody's: its breach widens to `undertowWideMilli` on
    // the fourth beat and puts a second lobe up next door, and both withdraw
    // and scar — the film's first lesson is the spread and not one column. The
    // next two are taken the beat they stand, the cannon slid under each by
    // `atBoss`; of the pair the maw takes the near one and the plated far one
    // withdraws.
    expect(seen).toEqual([
      "undertowScar 9 @11",
      "undertowScar 10 @15",
      "undertowTaken 7 @21",
      "undertowTaken 5 @27",
      "undertowTaken 3 @33",
      "undertowScar 7 @38",
    ]);
    expect(run.world.shieldCol).toBe(7);
    expect(run.world.cannonCol).toBe(3);
  });
});
