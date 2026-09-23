import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE THROB's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

/**
 * THE THROB's film says its rule twice — a shot wasted and a shot landing —
 * and neither half is staged: both bolts arrive at the same half of a turning
 * body, and what separates them is which trigger was pressed.
 *
 * The scene's two act ticks are chosen against `throbSpinBeats`, and that
 * choice is written in the file as a comment doing arithmetic (beats 9.75 to
 * 11.25). A comment is not a mechanism. Change the turn or the window and one
 * of these two shots stops meaning what the page over it says, silently, in a
 * film nobody re-watches once it is written.
 */
describe("the rehearsal for THE THROB", () => {
  it("wastes one shot on the trigger that turned away and lands the next", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theThrob");
    const run = new SceneRun(sceneScript("theThrob", wave, DEFAULT_CONFIG));
    const seen: SimEvent[] = [];
    const spent: SimEvent[] = [];
    for (let t = 0; t < SCENES.theThrob.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      seen.push(...spent);
    }
    const rejected = seen.findIndex((e) => e.type === "reject");
    const destroyed = seen.findIndex((e) => e.type === "destroy");
    expect(
      rejected,
      "the first bolt is not refused — the half it arrives at still takes red",
    ).toBeGreaterThan(-1);
    expect(destroyed, "the second bolt does not land — cyan is not the half round").toBeGreaterThan(
      -1,
    );
    expect(rejected, "the film lands its shot before it loses one").toBeLessThan(destroyed);
    expect(run.world.creatures).toHaveLength(0);
  });
});
