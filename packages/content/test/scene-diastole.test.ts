import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE DIASTOLE's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

/**
 * THE DIASTOLE's film is a count against the boss's own clock: two red shots
 * on the left's contractions, then a beam held to land on the fifteenth beat
 * of the count that starts when the right wakes. Every one of those ticks is
 * arithmetic written in the file as a comment, and a comment is not a
 * mechanism — a bolt that got slower or a fill that got longer would leave
 * the pages saying things the picture no longer does, silently.
 */
describe("the rehearsal for THE DIASTOLE", () => {
  it("takes the left twice on its own count, then both at once off the bridge", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theDiastole");
    const run = new SceneRun(sceneScript("theDiastole", wave, DEFAULT_CONFIG));
    const phases: string[] = [];
    for (let t = 0; t < SCENES.theDiastole.ticks - 1; t++) {
      run.advance([]);
      const boss = run.world.boss;
      if (boss === null || boss.kind !== "diastole") throw new Error("no twin lobe");
      const now = `${boss.phase} ${boss.leftHits}/${boss.rightHits}`;
      if (phases[phases.length - 1] !== now) phases.push(now);
    }
    // The phase turns on the beat after the hit that earns it, both times.
    expect(phases).toEqual(["one 3/3", "one 2/3", "one 1/3", "two 1/3", "two 0/2", "alone 0/2"]);
  });
});
