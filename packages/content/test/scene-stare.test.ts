import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent, stareBoss } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE STARE's film, watched: which seat each look is on, and what the thumb
 * that lands under the second one costs.
 *
 * The seat is the rng's (`sim/stare-step.ts`), so the film's seed is the
 * one thing about it that is chosen rather than authored, and the pages are
 * written in the order it rolls — the pilot first, the navigator second. A
 * change to the stream under it (an arrival that rolls, a boss that rolls
 * earlier) would swap the looks under the captions and nothing in the
 * picture would say so; this does.
 */
describe("the rehearsal for THE STARE", () => {
  it("looks at the pilot, then the navigator, and is touched once under the second look", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theStare");
    const run = new SceneRun(sceneScript("theStare", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let last = "";
    for (let t = 0; t < SCENES.theStare.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      const stare = stareBoss(run.world);
      if (stare === null) throw new Error(`no eye at tick ${run.world.tick}`);
      const now = `${stare.phase} ${stare.watching}`;
      if (now !== last) seen.push(`${now} @${run.world.beat}`);
      last = now;
      for (const e of events) {
        if (e.type === "stareCaught")
          seen.push(`caught ${e.player} ${e.command.kind} @${run.world.beat}`);
        else if (e.type === "breach" || e.type === "waveFailed")
          seen.push(`${e.type} @${run.world.beat}`);
        else if (e.type === "destroy" || e.type === "deflect")
          seen.push(`${e.type} @${run.world.beat}`);
      }
    }
    // Two bodies shot in the window; the first look on the pilot, with the
    // navigator's bolt landing inside it; one body in the second window; the
    // second look on the navigator, with the pilot's dome taking the rock
    // inside it; then the trigger under the eye, and the hull.
    expect(seen).toEqual([
      "away 0 @0",
      "destroy @5",
      "destroy @8",
      "turning 1 @12",
      "looking 1 @19",
      "destroy @23",
      "back 0 @25",
      "away 0 @27",
      "destroy @32",
      "turning 2 @39",
      "looking 2 @46",
      "deflect @48",
      "caught 2 prime @52",
      "waveFailed @52",
      "breach @52",
    ]);
  });
});
