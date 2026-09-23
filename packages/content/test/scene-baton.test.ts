import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE BATON's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE BATON", () => {
  it("launches once unanswered, then passes the bead three sockets down", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theBaton");
    const run = new SceneRun(sceneScript("theBaton", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theBaton.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "batonLaunch" || e.type === "batonRelit" || e.type === "batonLanded") {
          seen.push(`${e.type} ${e.socket}`);
        }
      }
    }
    // The first launch comes back to the socket it left; the three after it
    // each land one lower, and the film ends with the last still in the air.
    expect(seen).toEqual([
      "batonLaunch 0",
      "batonRelit 0",
      "batonLaunch 0",
      "batonLanded 1",
      "batonLaunch 1",
      "batonLanded 2",
      "batonLaunch 2",
    ]);
    const boss = run.world.boss;
    expect(boss?.kind === "baton" && boss.beads.length === 1 && boss.beads[0]?.struck).toBe(true);
  });
});
