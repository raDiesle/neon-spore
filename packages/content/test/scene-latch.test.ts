import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE LATCH's rehearsal, run and watched (`scenes/the-latch.ts`): each seat
 * takes its own grip, the turn passes from the left to the right, the knot
 * comes in on player 2's pull, and the yank finds both hands on — nothing
 * refused, nothing slipped. This fails when the tendril's rule changes
 * underneath the film written against it.
 */

describe("the rehearsal for THE LATCH", () => {
  it("passes the turn, pulls a knot in on the third page, and braces the yank on the last", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLatch");
    const run = new SceneRun(sceneScript("theLatch", wave, DEFAULT_CONFIG));
    const steps = SCENES.theLatch.steps;
    const page = (t: number) => steps.filter((s) => s.tick <= t).length;
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theLatch.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "latchTurn") seen.push(`turn ${e.grip} p${page(t)}`);
        if (e.type === "latchKnot") seen.push(`knot p${page(t)}`);
        if (e.type === "latchBraced") seen.push(`braced p${page(t)}`);
        if (e.type === "latchSlip" || e.type === "latchWrong") seen.push(e.type);
      }
    }
    expect(seen).toEqual(["turn 1 p2", "knot p3", "braced p4"]);
  });
});
