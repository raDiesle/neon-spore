import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE ANTIPHON's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE ANTIPHON", () => {
  it("hardens on the wrong candidate first, pits six organs where they stand with what was rejected shot as it falls, and bursts on their own ship", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theAntiphon");
    const run = new SceneRun(sceneScript("theAntiphon", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theAntiphon.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.beat;
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.col} ${e.color} @${b}`);
        else if (e.type === "antiphonGrow") seen.push(`grow ${e.shape} @${e.col} b${b}`);
        else if (e.type === "antiphonPit") seen.push(`pit ${e.shape} ${e.pits} @${e.col} b${b}`);
        else if (e.type === "antiphonHarden") seen.push(`harden rail ${e.rail} @${e.col} b${b}`);
        else if (e.type === "antiphonSpill") seen.push(`spill ${e.color} @${e.col} b${b}`);
        else if (e.type === "destroy") seen.push(`destroy ${e.kind} ${e.col} @${b}`);
        else if (
          e.type === "antiphonStill" ||
          e.type === "antiphonShip" ||
          e.type === "antiphonBurst" ||
          e.type === "antiphonOut"
        )
          seen.push(`${e.type.slice(8).toLowerCase()} @${e.col} b${b}`);
        else if (
          e.type === "antiphonSink" ||
          e.type === "reject" ||
          e.type === "hole" ||
          e.type === "breach" ||
          e.type === "deflect" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // Every organ a pit, every rejected candidate destroyed where it fell,
    // nothing sunk, nothing rejected by a body, nothing through the hull.
    expect(seen).toEqual([
      "grow 10 @9 b2",
      "fire 8 red @6",
      "harden rail 4 @8 b7",
      "grow 4 @9 b9",
      "fire 9 cyan @13",
      "pit 4 1 @9 b14",
      "grow 7 @3 b16",
      "fire 3 cyan @20",
      "pit 7 2 @3 b21",
      "grow 14 @9 b23",
      "fire 9 cyan @27",
      "pit 14 3 @9 b28",
      "spill red @3 b28",
      "spill cyan @7 b28",
      "spill red @10 b28",
      "fire 3 red @29",
      "grow 11 @0 b30",
      "destroy slick 3 @30",
      "fire 7 cyan @31",
      "destroy bulb 7 @32",
      "fire 10 red @33",
      "destroy slick 10 @34",
      "fire 0 cyan @34",
      "pit 11 4 @0 b35",
      "spill cyan @7 b35",
      "spill cyan @5 b35",
      "spill red @1 b35",
      "fire 7 cyan @36",
      "grow 15 @3 b37",
      "grow 12 @5 b37",
      "destroy bulb 7 @37",
      "fire 5 cyan @38",
      "destroy bulb 5 @39",
      "fire 1 red @40",
      "destroy slick 1 @41",
      "fire 3 red @41",
      "pit 15 5 @3 b42",
      "fire 5 cyan @42",
      "pit 12 6 @5 b44",
      "spill cyan @0 b44",
      "spill red @8 b44",
      "spill cyan @10 b44",
      "spill red @9 b44",
      "fire 0 cyan @45",
      "still @5 b46",
      "destroy bulb 0 @46",
      "fire 8 red @47",
      "destroy slick 8 @48",
      "fire 10 cyan @49",
      "ship @6 b50",
      "destroy bulb 10 @50",
      "fire 9 red @51",
      "destroy slick 9 @51",
      "fire 6 red @54",
      "burst @6 b55",
      "out @5 b58",
    ]);
  });
});
