import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE HIVE's film, watched: which bolt sealed which breach, and which one was
 * spent on the body the breach had just dropped.
 *
 * The whole of this film is the pairing of a shot with what is standing in
 * its column, and nothing in the picture says which of the two a bolt did —
 * a seal and a kill look alike from outside the column. A spill arriving one
 * beat earlier, or a cannon a beat later, would turn a seal into a wasted
 * bolt and the film would go on looking right, so the sequence is held here.
 * It is also the receipt that the fight can be won at all, which it could not
 * be before 20 September 2026 (`bosses.md` §11.14): seven sites sealed, the
 * last of them up a wall where only the pilot's held thumb reaches it, and
 * nothing open or falling at the end.
 *
 * **`DEFAULT_CONFIG` here, and the film still plays on the game's shot grid**,
 * because it carries `chargeBeats: 0.5` itself and `sceneScript` lays that
 * over whatever the host hands it (`scene-types.ts`). That is the point of the
 * field: `apps/game` runs at 0.5 and the default ships zero, so before it, a
 * film was proved on one grid and played on the other — this one's bolts left
 * fifteen ticks early under the default, the third killed nothing, and the
 * wave was breached at beat 36 while this test was green. The expectation
 * below is therefore the same twenty-four events in the browser, and
 * `scene-grid.test.ts` asks the same question of every other film.
 */
/** A site by its column, and a wall's cocoon by its column and row. */
function at(e: { col: number; row?: number }): string {
  return e.row === undefined ? `${e.col}` : `${e.col}:${e.row}`;
}

describe("the rehearsal for THE HIVE", () => {
  it("seals five breaches, one of them wrung, spends a bolt on each spill, and holds the high one", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theHive");
    const run = new SceneRun(sceneScript("theHive", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theHive.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      const w = run.world;
      for (const e of events) {
        if (e.type === "hiveOpen") seen.push(`open ${at(e)} ${e.color} @${w.beat}`);
        else if (e.type === "hiveSeal") seen.push(`seal ${at(e)} left ${e.left} @${w.beat}`);
        else if (e.type === "hiveSpill") seen.push(`spill ${at(e)} @${w.beat}`);
        else if (e.type === "hiveWrong") seen.push(`wrong @${w.beat}`);
        else if (e.type === "hiveSkin") seen.push(`skin @${w.beat}`);
        else if (e.type === "hiveClench") seen.push(`clench @${w.beat}`);
        else if (e.type === "hiveHaul") seen.push(`haul @${w.beat}`);
        else if (e.type === "hiveWrung") seen.push(`wrung ${e.col} @${w.beat}`);
        else if (e.type === "breach" || e.type === "waveFailed") seen.push(`${e.type} @${w.beat}`);
      }
    }
    // Seed 853589's underside opens `3c 4r 5c 2r 8r` as 675740's did, and
    // its twins are `6c` and the left wall's top cocoon, red (`scenes/the-hive.ts`).
    // Column 3 is sealed by
    // one bolt because it is sealed before its first spill; 4 takes two,
    // because it spills on the beat it opens; 5 and 8 are sealed by a bolt
    // already in the air when the breach opened; 2 is answered in cyan, which
    // hurries its spill by a beat and costs the pair of shots after it. 8 is
    // **wrung** — the navigator's thumb on its swell for three beats — so it
    // opens with no colour, a cyan bolt seals a red site, and the hand costs
    // what a wrong bolt costs: a spill on the spot, and one more red shot. No
    // `skin` — the cannon is never fired at a column with nothing open in it —
    // and no `breach` or `waveFailed`: the film takes no hit.
    //
    // **It clenches twice**, on the third seal and on the sixth, which is the
    // underside's own answer to being sealed (`bosses.md` §11.14, 21 September
    // 2026). The first costs the film nothing — every site is shut by the time
    // it is up. The second goes up on column 6's seal with the wall's cocoon
    // still open, and the pilot hauls it down inside the beat, so the hold
    // after it has something to steer into and the spill it owes at 45 is not
    // carried along.
    //
    // **The hold is the seal at `0:3`.** Row 3 is the top cocoon of the left
    // wall, behind two shut ones under it, and the cannon is in column 6: a
    // straight bolt cannot meet it from anywhere. It is met only because the
    // pilot's thumb is on it, and the red bolt climbs its own column and turns
    // the corner into it (`sim/hive-wall.ts`). The wall's spill at 45 is the
    // body a bolt fired straight up column 1 takes after, which is why there
    // is no `breach`.
    expect(seen).toEqual([
      "open 3 cyan @4",
      "seal 3 left 12 @5",
      "open 4 red @12",
      "spill 4 @12",
      "seal 4 left 11 @14",
      "open 5 cyan @20",
      "seal 5 left 10 @20",
      "clench @20",
      "open 2 red @28",
      "wrong @28",
      "spill 2 @29",
      "seal 2 left 9 @31",
      "open 8 red @36",
      "wrung 8 @36",
      "spill 8 @36",
      "seal 8 left 8 @36",
      "open 6 cyan @44",
      "open 0:3 red @44",
      "seal 6 left 7 @44",
      "clench @44",
      "haul @44",
      "spill 0:3 @45",
      "seal 0:3 left 6 @47",
    ]);
  });
});
