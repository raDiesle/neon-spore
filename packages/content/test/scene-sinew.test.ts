import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE SINEW's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE SINEW", () => {
  it("parts two fibres on two authored sums, snaps on a third over the top, and the plate turns the rock", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theSinew");
    const run = new SceneRun(sceneScript("theSinew", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theSinew.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "sinewGrip" || e.type === "sinewRelease")
          seen.push(`${e.type} ${e.player} @${run.world.beat}`);
        else if (e.type === "sinewPart") seen.push(`part ${e.fibres} @${run.world.beat}`);
        else if (e.type === "sinewSnap") seen.push(`snap ${e.rocks} @${run.world.beat}`);
        else if (e.type === "sinewRock") seen.push(`rock ${e.col} @${run.world.beat}`);
        else if (e.type === "deflect" || e.type === "breach")
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "sinewEnter" || e.type === "sinewFall" || e.type === "sinewOut")
          seen.push(`${e.type} @${run.world.beat}`);
        else if (e.type === "sinewCrush" || e.type === "waveFailed") seen.push(e.type);
      }
    }
    // Both hands take hold a beat before the sum enters the zone; four beats
    // in, a fibre parts and the hands let go. Again against the rolled zone.
    // The third pull is both reaches at once, over the top of any zone the
    // band allows, and the snap throws both hands off on the beat it is read
    // and sheds one rock at the mass's right — turned by the plate carried
    // under it and the trigger, on the shield's row. No fall, no crush, no
    // hull.
    expect(seen).toEqual([
      "sinewGrip 1 @10",
      "sinewGrip 2 @10",
      "sinewEnter @11",
      "part 5 @15",
      "sinewRelease 1 @15",
      "sinewRelease 2 @15",
      "sinewGrip 1 @19",
      "sinewGrip 2 @19",
      "sinewEnter @20",
      "part 4 @24",
      "sinewRelease 1 @24",
      "sinewRelease 2 @24",
      "sinewGrip 1 @25",
      "sinewGrip 2 @25",
      "sinewRelease 1 @26",
      "sinewRelease 2 @26",
      "snap 1 @26",
      "rock 6 @26",
      "deflect 6 @32",
    ]);
    expect(run.world.creatures).toHaveLength(0);
    expect(run.world.boss?.kind).toBe("sinew");
  });
});
