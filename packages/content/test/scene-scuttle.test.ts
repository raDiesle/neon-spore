import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE SCUTTLE's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE SCUTTLE", () => {
  it("lets one part go, strikes nineteen where they hang with the twins shot at the top, and holds the last under the beam", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theScuttle");
    const run = new SceneRun(sceneScript("theScuttle", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theScuttle.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.beat;
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.col} ${e.color}${e.lance ? " beam" : ""} @${b}`);
        else if (e.type === "scuttleLoose")
          seen.push(`loose ${e.col}${e.live ? " live" : ""} @${b}`);
        else if (e.type === "scuttleThrow") seen.push(`thrown ${e.col} ${e.left} @${b}`);
        else if (e.type === "scuttleStruck") seen.push(`struck ${e.col} ${e.left} @${b}`);
        else if (e.type === "destroy" || e.type === "deflect")
          seen.push(`${e.type} ${e.kind} ${e.col} @${b}`);
        else if (
          e.type === "scuttleRebuff" ||
          e.type === "scuttleWind" ||
          e.type === "scuttleDown" ||
          e.type === "scuttleOut"
        )
          seen.push(`${e.type} ${e.col} @${b}`);
        else if (
          e.type === "scuttleSlack" ||
          e.type === "reject" ||
          e.type === "hole" ||
          e.type === "podLoose" ||
          e.type === "podLost" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // The rock over 5 hangs three beats and is thrown, and is warded on beat
    // 21; the part loose over it on beat 20 is struck once the rock is out of
    // its column, and every other part the beat after it comes loose, in the
    // column the strip found and the colour the navigator sees — cyan on the
    // red body over 8 first, for the rebuff. From twelve left a twin hangs
    // beside the live one and is thrown at the cadence, each shot at the top
    // of its column in the gap; both pods are struck where they hang, at
    // eleven and two left. The beam stands under the wind-up on beat 42, a
    // beat before the throw, and the frame is out three beats on. No pod is
    // freed, nothing is rejected, no strike is blocked, no hull. (Everything
    // from beat 21 on is a beat later since 18 October 2026: the hull went a
    // row lower, `rows` 15 to 16, and the rock with it.)
    expect(seen).toEqual([
      "loose 5 live @4",
      "thrown 5 20 @7",
      "loose 7 live @7",
      "fire 7 cyan @7",
      "struck 7 19 @8",
      "loose 8 live @9",
      "fire 8 cyan @9",
      "fire 8 red @10",
      "scuttleRebuff 8 @10",
      "struck 8 18 @11",
      "loose 3 live @12",
      "fire 3 cyan @12",
      "struck 3 17 @13",
      "loose 3 live @14",
      "fire 3 red @14",
      "struck 3 16 @15",
      "loose 8 live @16",
      "fire 8 cyan @16",
      "struck 8 15 @17",
      "loose 6 live @18",
      "fire 6 red @18",
      "struck 6 14 @19",
      "loose 5 live @20",
      "deflect meteor 5 @21",
      "fire 5 red @21",
      "struck 5 13 @22",
      "loose 2 live @23",
      "fire 2 cyan @23",
      "struck 2 12 @24",
      "loose 3 live @25",
      "loose 7 @25",
      "fire 3 cyan @25",
      "struck 3 11 @26",
      "thrown 7 10 @28",
      "loose 5 live @28",
      "loose 4 @28",
      "fire 5 red @28",
      "fire 7 cyan @29",
      "struck 5 9 @29",
      "destroy bulb 7 @30",
      "thrown 4 8 @31",
      "loose 2 live @31",
      "loose 7 @31",
      "fire 2 red @31",
      "fire 4 cyan @32",
      "struck 2 7 @32",
      "thrown 7 6 @33",
      "loose 8 live @33",
      "loose 6 @33",
      "fire 8 cyan @33",
      "destroy bulb 4 @33",
      "fire 7 cyan @34",
      "struck 8 5 @34",
      "thrown 6 4 @35",
      "loose 2 live @35",
      "loose 6 @35",
      "fire 2 cyan @35",
      "destroy bulb 7 @35",
      "fire 6 cyan @36",
      "struck 2 3 @36",
      "thrown 6 2 @37",
      "loose 4 live @37",
      "fire 4 cyan @37",
      "destroy bulb 6 @37",
      "fire 6 red @38",
      "struck 4 1 @38",
      "scuttleWind 4 @39",
      "destroy slick 6 @39",
      "fire 4 cyan beam @42",
      "scuttleDown 4 @42",
      "scuttleOut 2 @45",
    ]);
  });
});
