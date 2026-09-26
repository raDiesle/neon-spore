import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE CHOKE's film, watched: the cannon out to the right wall and back, and
 * the one bolt leaving on the beat it is under the body again.
 *
 * Nothing on the screen says whether the bolt left from the body's column or
 * the one beside it until it misses, and a press half a beat late does exactly
 * that — the cannon steps on the beat and the shot grid lays the press on the
 * half. So the walk and the kill are held here.
 */
describe("the rehearsal for THE CHOKE", () => {
  it("walks to the wall, turns, and is under the body when the bolt leaves", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theChoke");
    const run = new SceneRun(sceneScript("theChoke", wave, DEFAULT_CONFIG));
    const walk: number[] = [];
    const seen: string[] = [];
    let beat = -1;
    for (let t = 0; t < SCENES.theChoke.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      const w = run.world;
      if (w.beat !== beat) {
        beat = w.beat;
        walk.push(w.cannonCol);
      }
      for (const e of events) {
        if (e.type === "fire") seen.push(`fire from ${w.cannonCol} @${w.beat}`);
        if (e.type === "destroy" || e.type === "breach") seen.push(`${e.type} ${e.col} @${w.beat}`);
      }
    }
    expect(walk.slice(0, 11)).toEqual([5, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6]);
    expect(seen).toEqual(["fire from 8 @8", "destroy 8 @8"]);
  });
});
