import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE HAUL's rehearsal, run and watched, in THE SCOUT's shape
 * (`scene-scout.test.ts`). What it adds is the two hands: the trace says when
 * the line is reeling and every `scoutPrime` the round hears, so a film that
 * stopped asking for either fails here rather than playing on without them.
 */

describe("the rehearsal for THE HAUL", () => {
  it("flies both levels in one trip each, on the line and then the prime, and touches nothing that moves", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theHaul");
    const run = new SceneRun(sceneScript("theHaul", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let last = "";
    for (let t = 0; t < SCENES.theHaul.ticks - 1; t++) {
      run.advance([]);
      const boss = run.world.boss?.kind === "scout" ? run.world.boss : null;
      if (boss === null) throw new Error(`no scout at tick ${run.world.tick}`);
      const reel = boss.reeling ? " reeling" : "";
      const now = `arena ${boss.arena} ${boss.phase} carrying ${boss.carrying.join(",")} banked ${boss.banked.join(",")}${reel}`;
      if (now !== last) seen.push(`${now} @${run.world.beat}`);
      last = now;
      for (const e of run.world.events)
        if (e.type === "breach" || e.type === "waveFailed" || e.type === "scoutPrime")
          seen.push(e.type);
    }
    // Level one: all four aboard by beat 10, the line from beat 10 to 12,
    // banked on 13. Level two: all five by beat 26, a prime held through each
    // of the four burns home, banked on 31 and the verdict after it. No breach, no wave failed.
    expect(seen).toEqual([
      "arena 0 play carrying  banked  @0",
      "arena 0 play carrying 0 banked  @3",
      "arena 0 play carrying 0,1 banked  @6",
      "arena 0 play carrying 0,1,2 banked  @9",
      "arena 0 play carrying 0,1,2,3 banked  @10",
      "arena 0 play carrying 0,1,2,3 banked  reeling @10",
      "arena 0 play carrying 0,1,2,3 banked  @12",
      "arena 0 play carrying  banked 0,1,2,3 @13",
      "arena 1 play carrying  banked  @13",
      "arena 1 play carrying 0 banked  @17",
      "arena 1 play carrying 0,1 banked  @19",
      "arena 1 play carrying 0,1,2 banked  @21",
      "arena 1 play carrying 0,1,2,3 banked  @23",
      "arena 1 play carrying 0,1,2,3,4 banked  @26",
      "scoutPrime",
      "scoutPrime",
      "scoutPrime",
      "scoutPrime",
      "arena 1 play carrying  banked 0,1,2,3,4 @31",
      "arena 1 verdict carrying  banked 0,1,2,3,4 @31",
    ]);
  });
});
