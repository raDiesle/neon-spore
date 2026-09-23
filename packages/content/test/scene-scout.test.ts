import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE SCOUT's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE SCOUT", () => {
  it("flies arena one whole and the first trip of arena two, and touches nothing that moves", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theScout");
    const run = new SceneRun(sceneScript("theScout", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let last = "";
    for (let t = 0; t < SCENES.theScout.ticks - 1; t++) {
      run.advance([]);
      const boss = run.world.boss?.kind === "scout" ? run.world.boss : null;
      if (boss === null) throw new Error(`no scout at tick ${run.world.tick}`);
      const now = `arena ${boss.arena} ${boss.phase} carrying ${boss.carrying.join(",")} banked ${boss.banked.join(",")}`;
      if (now !== last) seen.push(`${now} @${run.world.beat}`);
      last = now;
      for (const e of run.world.events)
        if (e.type === "breach" || e.type === "waveFailed") seen.push(e.type);
    }
    // Four motes picked in a loop and banked together on beat 16, and the
    // second arena opens the same beat; three of its column come home on 24.
    // Nothing moving is touched: no breach, no wave failed.
    expect(seen).toEqual([
      "arena 0 lead carrying  banked  @0",
      "arena 0 play carrying  banked  @4",
      "arena 0 play carrying 2 banked  @6",
      "arena 0 play carrying 2,0 banked  @9",
      "arena 0 play carrying 2,0,1 banked  @12",
      "arena 0 play carrying 2,0,1,3 banked  @14",
      "arena 0 play carrying  banked 2,0,1,3 @16",
      "arena 1 play carrying  banked  @16",
      "arena 1 play carrying 0 banked  @18",
      "arena 1 play carrying 0,1 banked  @21",
      "arena 1 play carrying 0,1,2 banked  @21",
      "arena 1 play carrying  banked 0,1,2 @24",
    ]);
  });
});
