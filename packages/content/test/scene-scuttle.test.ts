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
    // 20; every other part is struck the beat after it comes loose, in the
    // column the strip found and the colour the navigator sees — cyan on the
    // red body over 8 first, for the rebuff. From twelve left a twin hangs
    // beside the live one and is thrown at the cadence, each shot at the top
    // of its column in the gap; both pods are struck where they hang, at
    // eleven and two left. The beam stands under the wind-up on beat 41, a
    // beat before the throw, and the frame is out three beats on. No pod is
    // freed, nothing is rejected, no strike is blocked, no hull.
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
      "deflect meteor 5 @20",
      "fire 5 red @20",
      "struck 5 13 @21",
      "loose 2 live @22",
      "fire 2 cyan @22",
      "struck 2 12 @23",
      "loose 3 live @24",
      "loose 7 @24",
      "fire 3 cyan @24",
      "struck 3 11 @25",
      "thrown 7 10 @27",
      "loose 5 live @27",
      "loose 4 @27",
      "fire 5 red @27",
      "fire 7 cyan @28",
      "struck 5 9 @28",
      "destroy bulb 7 @29",
      "thrown 4 8 @30",
      "loose 2 live @30",
      "loose 7 @30",
      "fire 2 red @30",
      "fire 4 cyan @31",
      "struck 2 7 @31",
      "thrown 7 6 @32",
      "loose 8 live @32",
      "loose 6 @32",
      "destroy bulb 4 @32",
      "fire 8 cyan @32",
      "fire 7 cyan @33",
      "struck 8 5 @33",
      "thrown 6 4 @34",
      "loose 2 live @34",
      "loose 6 @34",
      "destroy bulb 7 @34",
      "fire 2 cyan @34",
      "fire 6 cyan @35",
      "struck 2 3 @35",
      "thrown 6 2 @36",
      "loose 4 live @36",
      "destroy bulb 6 @36",
      "fire 4 cyan @36",
      "fire 6 red @37",
      "struck 4 1 @37",
      "scuttleWind 4 @38",
      "destroy slick 6 @38",
      "fire 4 cyan beam @41",
      "scuttleDown 4 @41",
      "scuttleOut 2 @44",
    ]);
  });
});
