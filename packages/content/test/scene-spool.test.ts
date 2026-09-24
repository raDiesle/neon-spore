import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE SPOOL's rehearsal, run and watched — THE HIVE's shape
 * (`scene-hive.test.ts`). The sweep in `scenes.test.ts` fails when the *scene
 * format* changes; this fails when the spool's rule, or the rng's roll of a
 * movement's rate, changes underneath a film whose depths were written
 * against both.
 */

describe("the rehearsal for THE SPOOL", () => {
  it("slips the first movement on a shallow brake and eases a rib on a deeper one", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theSpool");
    const run = new SceneRun(sceneScript("theSpool", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let brakeAtRib = -1;
    for (let t = 0; t < SCENES.theSpool.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.boss;
      for (const e of run.world.events) {
        if (e.type === "spoolRib" && b?.kind === "spool") brakeAtRib = b.brakeMilli;
        if (e.type === "spoolRib") seen.push(`rib ${e.ribs} @${run.world.beat}`);
        else if (e.type === "spoolZone") seen.push(`zone ${e.ribs} @${run.world.beat}`);
        else if (e.type.startsWith("spool") || e.type === "breach" || e.type === "waveFailed")
          seen.push(`${e.type} @${run.world.beat}`);
      }
    }
    // Taken at the top before the first zone, which then slips — the first
    // movement's, so no rock. Let go and taken again on one tick, carried
    // down in the slip, and the second movement held its whole leg: one rib.
    // Let go in the ease, before the third zone would open.
    expect(seen).toEqual([
      "spoolGrip @1",
      "zone 4 @2",
      "spoolSlip @8",
      "spoolLet @10",
      "spoolGrip @10",
      "zone 4 @11",
      "rib 3 @19",
      "spoolLet @21",
    ]);
    expect(brakeAtRib).toBe(520);
    expect(run.world.creatures).toHaveLength(0);
  });
});
