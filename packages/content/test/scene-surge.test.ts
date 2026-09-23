import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE SURGE's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE SURGE", () => {
  it("vents two notches with both thumbs off together, loses the charge between them to a thumb off alone, and shields the rocks the seam spits meanwhile", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theSurge");
    const run = new SceneRun(sceneScript("theSurge", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theSurge.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "surgeGrip" || e.type === "surgeRelease")
          seen.push(`${e.type} ${e.player} @${run.world.beat}`);
        else if (e.type === "surgeVent")
          seen.push(`vent ${e.notches} row ${e.row} @${run.world.beat}`);
        else if (e.type === "surgeNear" || e.type === "surgeLost")
          seen.push(`${e.type} @${run.world.beat}`);
        else if (e.type === "surgeRock") seen.push(`rock ${e.col} @${run.world.beat}`);
        else if (e.type === "deflect") seen.push(`deflect ${e.col} @${run.world.beat}`);
        else if (
          e.type === "surgeBurst" ||
          e.type === "surgeGum" ||
          e.type === "surgeAbsorb" ||
          e.type === "surgeEvert" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // The pilot's thumb, then the navigator's; the pressure enters the first
    // band at 700 and the field slows; both off eight ticks apart at 1100,
    // the first notch. The second hold the pilot leaves alone at 800, the
    // navigator two beats later — lost. The third is the first again at the
    // second notch, 1400. No burst, no gum, no eversion, no hull.
    //
    // From the first notch the seam spits a rock every six beats it is held,
    // so the second hold spits one and the third two, and each is warded a
    // beat off the hull by the pilot's other thumb — his first one is on the
    // bulb throughout. The last is still falling when the stack runs out, and
    // nothing is absorbed: a bulb does not eat what it threw at the ship.
    expect(seen).toEqual([
      "surgeGrip 1 @2",
      "surgeGrip 2 @3",
      "surgeNear @6",
      "surgeRelease 1 @8",
      "surgeRelease 2 @8",
      "vent 1 row 4 @8",
      "surgeGrip 1 @12",
      "surgeGrip 2 @12",
      "rock 5 @13",
      "surgeRelease 1 @16",
      "surgeRelease 2 @18",
      "surgeLost @18",
      "surgeGrip 1 @19",
      "surgeGrip 2 @19",
      "rock 5 @20",
      "deflect 5 @23",
      "surgeNear @25",
      "rock 4 @26",
      "surgeRelease 1 @26",
      "surgeRelease 2 @26",
      "vent 2 row 5 @26",
      "deflect 5 @30",
    ]);
  });
});
