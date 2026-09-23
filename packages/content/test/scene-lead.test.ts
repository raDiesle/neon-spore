import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE LEAD's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE LEAD", () => {
  it("misses where it is, hits four times where it will be, wards the run's litter, and stands the beam in the pass", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLead");
    const run = new SceneRun(sceneScript("theLead", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theLead.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "fire")
          seen.push(`fire ${e.col}${e.lance ? " beam" : ""} @${run.world.beat}`);
        else if (e.type === "leadMiss" || e.type === "leadTorch" || e.type === "leadRock")
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "leadReverse") seen.push(`reverse ${e.dir} @${run.world.beat}`);
        else if (e.type === "leadHit") seen.push(`hit ${e.col} ${e.segments} @${run.world.beat}`);
        else if (e.type === "deflect") seen.push(`deflect ${e.kind} ${e.col} @${run.world.beat}`);
        else if (
          e.type === "leadStill" ||
          e.type === "leadPass" ||
          e.type === "leadDown" ||
          e.type === "leadOut"
        )
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "leadWall" || e.type === "breach" || e.type === "waveFailed")
          seen.push(e.type);
      }
    }
    // Column 7 is where it stands on beat 2 and column 9 where it is judged:
    // a miss, and it turns. Then four `atBoss` shots, each two beats ahead —
    // 6 at the walk, 0, 8 and 10 at the run — with the run's two torches
    // warded where they land and its first rock's column never shot through.
    // Still at the right wall, the beam standing in 8 as the pass comes
    // through, and the rock at 2 warded after it is down. No wall, no hull.
    expect(seen).toEqual([
      "fire 7 @2",
      "leadMiss 7 @4",
      "reverse -1 @4",
      "fire 6 @5",
      "hit 6 4 @7",
      "leadRock 2 @8",
      "fire 0 @8",
      "leadTorch 4 @9",
      "hit 0 3 @10",
      "deflect torch 4.5 @10",
      "leadTorch 2 @12",
      "leadRock 6 @12",
      "fire 8 @12",
      "deflect torch 2.5 @13",
      "fire 10 @13",
      "hit 8 2 @14",
      "hit 10 1 @15",
      "leadStill 10 @15",
      "fire 8 beam @19",
      "leadPass 10 @20",
      "leadDown 7 @20",
      "deflect meteor 2 @21",
      "leadOut 7 @23",
    ]);
  });
});
