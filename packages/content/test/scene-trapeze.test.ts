import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE TRAPEZE's rehearsal, run and watched (`scenes/the-trapeze.ts`): every
 * swipe in it is a push, each from the seat whose side it is, and the alien
 * kicks the gong inside the last page. This fails when the swing's rule
 * changes underneath the film written against it.
 */

describe("the rehearsal for THE TRAPEZE", () => {
  it("pushes left, left, right, left, and kicks the gong on the last page", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theTrapeze");
    const run = new SceneRun(sceneScript("theTrapeze", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let gong = -1;
    for (let t = 0; t < SCENES.theTrapeze.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "trapezePush") seen.push(`${e.seat === 0 ? "P1" : "P2"} ${e.zone}`);
        if (["trapezeBrake", "trapezeWhiff", "trapezeMiss"].includes(e.type)) seen.push(e.type);
        if (e.type === "trapezeGong") gong = t;
      }
    }
    expect(seen).toEqual(["P1 -1", "P1 -1", "P2 1", "P1 -1"]);
    const last = SCENES.theTrapeze.steps.at(-1)?.tick ?? 0;
    expect(gong).toBeGreaterThan(last + 90);
  });
});
