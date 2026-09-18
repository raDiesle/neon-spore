import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  repriseEchoing,
  repriseLeft,
  SceneRun,
  type SimEvent,
} from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE REPRISE's film, watched: the stretch falls seen and is taken; the echo
 * opens with the count the tear shows and two of its three are taken unseen;
 * the third, which nobody said, reaches the hull after the tear has shut.
 *
 * The film's whole content is which bodies were on the screen when they were
 * shot, and a page cannot say so — a kill is drawn whole either way
 * (`render/unseen.ts`). So this is the receipt that the two kills after the
 * dark are of bodies nothing drew, and that the one that lands is too.
 */
describe("the rehearsal for THE REPRISE", () => {
  it("takes the stretch seen, two of its echo blind, and the third unsaid on the hull", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theReprise");
    const run = new SceneRun(sceneScript("theReprise", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let last = "";
    for (let t = 0; t < SCENES.theReprise.ticks - 1; t++) {
      const unseenCols = new Set(run.world.creatures.filter((c) => c.unseen).map((c) => c.col));
      const events: SimEvent[] = [];
      run.advance(events);
      const now = repriseEchoing(run.world) ? `echo ${repriseLeft(run.world)}` : "seen";
      if (now !== last) seen.push(`${now} @${run.world.beat}`);
      last = now;
      for (const e of events) {
        if (e.type === "destroy")
          seen.push(
            `${unseenCols.has(e.col) ? "unseen" : "seen"} ${e.kind} taken @${run.world.beat}`,
          );
        else if (e.type === "breach" || e.type === "waveFailed")
          seen.push(`${e.type} @${run.world.beat}`);
      }
      if (events.some((e) => e.type === "breach")) break;
    }
    expect(seen).toEqual([
      "seen @0",
      "seen slick taken @5",
      "seen bulb taken @8",
      "seen slick taken @11",
      "echo 2 @12",
      "echo 1 @15",
      "unseen slick taken @16",
      "seen @18",
      "unseen bulb taken @20",
      "waveFailed @33",
      "breach @33",
    ]);
    // The body that lands is the echo's own, still unseen with the tear shut.
    expect(run.world.creatures.every((c) => c.unseen)).toBe(true);
  });
});
