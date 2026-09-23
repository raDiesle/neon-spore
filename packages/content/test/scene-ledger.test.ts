import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE LEDGER's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE LEDGER", () => {
  it("lands two hits of the seed's colours, wards both returns in the socket, and the second whips the seam", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLedger");
    const run = new SceneRun(sceneScript("theLedger", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theLedger.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.color} ${e.col} @${run.world.beat}`);
        else if (e.type === "ledgerSeam") seen.push(`seam ${e.seam} ${e.color} @${run.world.beat}`);
        else if (e.type === "ledgerBead") seen.push(`bead ${e.col} ${e.beats} @${run.world.beat}`);
        else if (e.type === "ledgerWard" || e.type === "ledgerSocket")
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "ledgerWhip") seen.push(`whip ${e.seam} @${run.world.beat}`);
        else if (
          e.type === "ledgerBill" ||
          e.type === "ledgerRefused" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // Cyan up the seam, which the seed rolled; the return four beats later,
    // warded in the socket, walks it a column. Red, which the hit rolled, and
    // the second return three beats later is warded where the socket walked
    // to — the strip is `atBoss` — and whips the seam a third notch for no
    // bill. Nothing refused, nothing billed, no hull.
    expect(seen).toEqual([
      "fire cyan 5 @8",
      "seam 1 red @9",
      "bead 5 4 @9",
      "ledgerWard 5 @13",
      "ledgerSocket 6 @13",
      "fire red 5 @19",
      "seam 2 cyan @20",
      "bead 6 3 @20",
      "ledgerWard 6 @23",
      "whip 3 @23",
      "seam 3 red @23",
      "ledgerSocket 7 @23",
    ]);
    expect(run.world.creatures).toHaveLength(0);
    expect(run.world.boss?.kind).toBe("ledger");
  });
});
