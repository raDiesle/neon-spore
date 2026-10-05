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
  it("carries six organs home with the seats swapping, goes still, and bursts on their own ship", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theAntiphon");
    const run = new SceneRun(sceneScript("theAntiphon", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theAntiphon.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.beat;
      for (const e of run.world.events) {
        if (e.type === "antiphonGrow") seen.push(`grow ${e.shape} b${b}`);
        else if (e.type === "antiphonPit") seen.push(`pit ${e.shape} ${e.pits} b${b}`);
        else if (
          e.type === "antiphonStill" ||
          e.type === "antiphonShip" ||
          e.type === "antiphonBurst" ||
          e.type === "antiphonOut"
        )
          seen.push(`${e.type.slice(8).toLowerCase()} b${b}`);
        else if (
          e.type === "antiphonHarden" ||
          e.type === "antiphonSink" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // Every organ a pit, nothing hardened, nothing sunk, nothing lost.
    expect(seen).toEqual([
      "grow 10 b2",
      "pit 10 1 b6",
      "grow 12 b8",
      "pit 12 2 b12",
      "grow 1 b14",
      "pit 1 3 b18",
      "grow 14 b20",
      "pit 14 4 b24",
      "grow 5 b26",
      "pit 5 5 b30",
      "grow 5 b32",
      "pit 5 6 b36",
      "still b38",
      "ship b42",
      "burst b46",
      "out b49",
    ]);
  });
});
