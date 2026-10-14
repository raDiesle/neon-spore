import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * BULB QUEEN's rehearsal, run and watched. Its three acts slid the cannon and
 * fired at her second bloom, which on the ten-beat clock opens at beat 14 —
 * two beats after the torch reaches the hull at beat 12 and holds the wave. So
 * the film moved the cannon and then stood still, and nothing said so. This
 * holds the two things the film is: a petal comes off her, and the torch still
 * pays the hull after it.
 */
describe("the rehearsal for BULB QUEEN", () => {
  it("takes a petal before the torch pays the hull", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "bulbQueen");
    const run = new SceneRun(sceneScript("bulbQueen", wave, DEFAULT_CONFIG));
    const spent: SimEvent[] = [];
    let petalTick = -1;
    let breachTick = -1;
    for (let t = 0; t < SCENES.bulbQueen.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      if (petalTick === -1 && spent.some((e) => e.type === "petal")) petalTick = run.world.tick;
      if (breachTick === -1 && spent.some((e) => e.type === "breach")) breachTick = run.world.tick;
    }
    expect(petalTick, "no petal came off her — the shot missed or was never fired").toBeGreaterThan(
      0,
    );
    expect(breachTick, "the torch never reached the hull").toBeGreaterThan(0);
    expect(petalTick, "the shot landed after the wave was held").toBeLessThan(breachTick);
    // Under the page about the marks, which is where the petal belongs.
    const marks = SCENES.bulbQueen.steps.find((s) => s.text === "ONE MARK IS REAL")!;
    const next = SCENES.bulbQueen.steps.find((s) => s.tick > marks.tick)!;
    expect(petalTick).toBeLessThan(next.tick);
  });
});
