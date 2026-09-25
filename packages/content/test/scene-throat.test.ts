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
  it("clears one body, chokes a ring with a gum, then heals it off a rock", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theThroat");
    const run = new SceneRun(sceneScript("theThroat", wave, DEFAULT_CONFIG));
    const flungAt: number[] = [];
    let slackAt = -1;
    for (let t = 0; t < SCENES.theThroat.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) if (e.type === "gumFlung") flungAt.push(run.world.beat);
      const b = run.world.boss;
      if (slackAt < 0 && b?.kind === "throat" && b.slack > 0) slackAt = run.world.beat;
    }
    const boss = run.world.boss;
    if (boss?.kind !== "throat") throw new Error("no throat");
    // The gum flies for one beat and chokes on the next, which sets the mouth
    // sliding.
    expect(flungAt).toEqual([18]);
    expect(slackAt).toBe(19);
    expect(boss.phase).toBe("slide");
    // The red creature is shot before the inhale at beat 12, so the only body
    // ever swallowed is the rock, on the inhale at 31 — and the ring the gum
    // choked is tight again. That is the film's last page, and the answer to
    // *should we let it be sucked in*.
    expect(boss.fedBeat).toBe(31);
    expect(boss.slack).toBe(0);
  });
});
