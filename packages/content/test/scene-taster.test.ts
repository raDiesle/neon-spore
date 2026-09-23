import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE TASTER's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE TASTER", () => {
  it("tastes three reds, thickens on a fourth, loses a blade to two cyans and a second to one, then grows three at once in red", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theTaster");
    const run = new SceneRun(sceneScript("theTaster", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theTaster.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.col} ${e.color} @${run.world.beat}`);
        else if (e.type === "tasterSet") seen.push(`set ${e.col} ${e.color} @${run.world.beat}`);
        else if (e.type === "tasterThick")
          seen.push(`thick ${e.col} ${e.layers} @${run.world.beat}`);
        else if (e.type === "tasterPare") seen.push(`pare ${e.col} ${e.layers} @${run.world.beat}`);
        else if (e.type === "tasterShear") seen.push(`shear ${e.col} ${e.left} @${run.world.beat}`);
        else if (e.type === "tasterGrow") seen.push(`grow ${e.col} @${run.world.beat}`);
        else if (
          e.type === "tasterCrest" ||
          e.type === "tasterLift" ||
          e.type === "tasterTaste" ||
          e.type === "tasterClose" ||
          e.type === "tasterRefused" ||
          e.type === "tasterOut"
        ) {
          seen.push(e.type);
        }
      }
    }
    // Three reds are in the muzzle before the middle blade sets on beat five,
    // so it sets red; a fourth red thickens it; a cyan pares it and a second
    // takes it off. The next blade over, on column 6, set red on beat nine
    // and one cyan takes it on beat twenty-three. Two gone, the fan grows
    // three at once — and every set the film shows is red, four to three on
    // the ledger, never a dead heat and never the rng. Nothing is cut, tasted
    // again, closed, refused or out.
    expect(seen).toEqual([
      "grow 5 @1",
      "fire 5 red @1",
      "fire 5 red @3",
      "fire 5 red @3",
      "set 5 red @5",
      "grow 6 @5",
      "set 6 red @9",
      "grow 4 @9",
      "fire 5 red @10",
      "thick 5 2 @11",
      "set 4 red @13",
      "grow 7 @13",
      "fire 5 cyan @13",
      "pare 5 1 @14",
      "fire 5 cyan @16",
      "set 7 red @17",
      "grow 3 @17",
      "shear 5 3 @17",
      "set 3 red @21",
      "grow 8 @21",
      "fire 6 cyan @22",
      "shear 6 3 @23",
      "grow 2 @24",
      "grow 9 @24",
      "set 8 red @25",
      "grow 1 @25",
      "set 2 red @28",
      "set 9 red @28",
      "grow 10 @28",
      "grow 0 @28",
      "set 1 red @29",
    ]);
    expect(run.world.cannonCol).toBe(6);
    expect(run.world.creatures).toHaveLength(0);
  });
});
