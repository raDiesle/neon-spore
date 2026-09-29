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
  it("flies the first two levels whole, one mote a trip, and touches nothing that moves", () => {
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
    // One mote at a time, each sucked home before the next is taken: level
    // one's single mote banked on beat 8, and level two's two on 18 and 27,
    // the third level opening as the second is swallowed. Nothing moving is
    // touched: no breach, no wave failed.
    expect(seen).toEqual([
      "arena 0 play carrying  banked  @0",
      "arena 0 play carrying 0 banked  @2",
      "arena 0 play carrying  banked 0 @8",
      "arena 1 play carrying  banked  @8",
      "arena 1 play carrying 0 banked  @13",
      "arena 1 play carrying  banked 0 @18",
      "arena 1 play carrying 1 banked 0 @22",
      "arena 1 play carrying  banked 0,1 @27",
      "arena 2 play carrying  banked  @27",
    ]);
  });
});
