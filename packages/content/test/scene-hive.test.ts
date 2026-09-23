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
 * be before 20 September 2026 (`bosses.md` §11.14): five sites sealed, and
 * the only breach still open at the end is the twin the film says it is
 * leaving.
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
describe("the rehearsal for THE HIVE", () => {
  it("seals five breaches, one of them wrung, spends a bolt on each spill, and leaves the twin open", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theHive");
    const run = new SceneRun(sceneScript("theHive", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theHive.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      const w = run.world;
      for (const e of events) {
        if (e.type === "hiveOpen") seen.push(`open ${e.col} ${e.color} @${w.beat}`);
        else if (e.type === "hiveSeal") seen.push(`seal ${e.col} left ${e.left} @${w.beat}`);
        else if (e.type === "hiveSpill") seen.push(`spill ${e.col} @${w.beat}`);
        else if (e.type === "hiveWrong") seen.push(`wrong @${w.beat}`);
        else if (e.type === "hiveSkin") seen.push(`skin @${w.beat}`);
        else if (e.type === "hiveClench") seen.push(`clench @${w.beat}`);
        else if (e.type === "hiveHaul") seen.push(`haul @${w.beat}`);
        else if (e.type === "hiveWrung") seen.push(`wrung ${e.col} @${w.beat}`);
        else if (e.type === "breach" || e.type === "waveFailed") seen.push(`${e.type} @${w.beat}`);
      }
    }
    // Seed 6's order is `3c 6r 5c 1r 2r 7r 8c 4c 9r`. Column 3 is sealed by
    // one bolt because it is sealed before its first spill; 6 takes two,
    // because it spills on the beat it opens; 5 and 2 are sealed by a bolt
    // already in the air when the breach opened; 1 is answered in cyan, which
    // hurries its spill by a beat and costs the pair of shots after it. 2 is
    // **wrung** — the navigator's thumb on its swell for three beats — so it
    // opens with no colour, a cyan bolt seals a red site, and the hand costs
    // what a wrong bolt costs: a spill on the spot, and one more red shot. No
    // `skin` — the cannon is never fired at a column with nothing open in it —
    // and no `breach` or `waveFailed`: the film takes no hit.
    //
    // **It clenches twice**, on the third seal and on the sixth, which is the
    // underside's own answer to being sealed (`bosses.md` §11.14, 21 September
    // 2026), and the pair are the lesson: the first costs the film nothing —
    // every site is shut by the time it is up, so there is no spill for it to
    // hold back — and the second would have cost it everything. Column 8 is
    // open and spilling at beat 47, and the spill it owes at 48 is inside a
    // clench that outlasts the scene, so the film's last beats would teach
    // the pair that a breach left open goes harmless.
    //
    // **So the pilot hauls the second one down**, inside the beat it went up
    // — which is what the `haul` below is, and why the spill at 48 is back.
    // The window is the beat: the cadence rides along with the mass while it
    // is up (`hive-step.ts`), so a haul finished before beat 48's step leaves
    // `spillBeat` at 45 and the spill falls on 48 as it always would have.
    // The wring moved the twins' spills from 44 to 45, and with them every
    // shot and the haul after it (`scenes/the-hive.ts`).
    expect(seen).toEqual([
      "open 3 cyan @4",
      "seal 3 left 8 @5",
      "open 6 red @12",
      "spill 6 @12",
      "seal 6 left 7 @14",
      "open 5 cyan @20",
      "seal 5 left 6 @20",
      "clench @20",
      "open 1 red @28",
      "wrong @28",
      "spill 1 @29",
      "seal 1 left 5 @31",
      "open 2 red @36",
      "wrung 2 @36",
      "spill 2 @36",
      "seal 2 left 4 @36",
      "open 7 red @44",
      "open 8 cyan @44",
      "spill 7 @45",
      "spill 8 @45",
      "seal 7 left 3 @47",
      "clench @47",
      "haul @47",
      "spill 8 @48",
    ]);
  });
});
