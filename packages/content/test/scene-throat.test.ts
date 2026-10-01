import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE THROAT's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE THROAT", () => {
  it("carries the mouth, pumps it open, refuses the wrong colour and takes the right", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theThroat");
    const run = new SceneRun(sceneScript("theThroat", wave, DEFAULT_CONFIG));
    const swallowedAt: number[] = [];
    const refused: string[] = [];
    let modeAt = -1;
    let startY = -1;
    for (let t = 0; t < SCENES.theThroat.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.boss;
      if (startY < 0 && b?.kind === "throat") startY = b.aimYMilli;
      for (const e of run.world.events) {
        if (e.type === "throatSwallow") swallowedAt.push(run.world.tick);
        if (e.type === "throatRefuse") refused.push(e.part);
        if (e.type === "throatMode") modeAt = run.world.tick;
      }
    }
    const boss = run.world.boss;
    if (boss?.kind !== "throat") throw new Error("no throat");
    // Player 2's carry took the mouth up toward what falls.
    expect(boss.aimYMilli).toBeLessThan(startY);
    // The slick goes into the red mouth; the bulb is refused in red, and is
    // taken on the tick the colour turns cyan.
    expect(swallowedAt).toHaveLength(2);
    expect(refused.length).toBeGreaterThan(0);
    expect(new Set(refused)).toEqual(new Set(["red"]));
    expect(swallowedAt[1]).toBe(modeAt);
    expect(boss.mode).toBe("cyan");
    expect(boss.slack).toBe(2);
    expect(boss.phase).toBe("sucks");
  });
});
