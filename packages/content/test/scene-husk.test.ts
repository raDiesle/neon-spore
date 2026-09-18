import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, mawOpen, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE HUSK's film, watched: which pod each bolt cuts loose, and what the maw
 * was doing when each one arrived.
 *
 * The film's lesson is entirely in the pairing of a shot with the maw under
 * it — open for the real one, shut for the framed one, open again for the
 * one nobody named — and a pod that sank a beat faster, or an intake pressed
 * a beat late, would swap a refusal for a loss and nothing in the picture
 * would say so; this does. The maw is read at the moment each pod arrives,
 * because that is the moment the wave judges it (`sim/husk.ts`).
 */
describe("the rehearsal for THE HUSK", () => {
  it("takes the real one at an open maw, refuses the framed one at a shut one, and swallows the unnamed one", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theHusk");
    const run = new SceneRun(sceneScript("theHusk", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theHusk.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      const w = run.world;
      const maw = mawOpen(w) ? "open" : "shut";
      for (const e of events) {
        if (e.type === "fire") seen.push(`fire at ${w.cannonCol} @${w.beat}`);
        else if (e.type === "podLoose") seen.push(`loose ${e.col} @${w.beat}`);
        else if (e.type === "podTaken") seen.push(`taken ${e.kind} ${maw} @${w.beat}`);
        else if (e.type === "huskRefused") seen.push(`refused ${e.kind} ${maw} @${w.beat}`);
        else if (e.type === "huskSwallowed") seen.push(`swallowed ${e.kind} ${maw} @${w.beat}`);
        else if (e.type === "podLost" || e.type === "waveFailed") seen.push(`${e.type} @${w.beat}`);
      }
    }
    // Authored columns 5, 3 and 1 are the shipped field's 8, 5 and 2
    // (`scene-script.ts`, `mapCol`): the real one, the framed one, the one
    // nobody named. Nothing is lost at a shut maw — the only pod that costs
    // the wave is the husk the maw was opened for.
    expect(seen).toEqual([
      "fire at 8 @10",
      "loose 8 @10",
      "taken ward open @14",
      "fire at 5 @22",
      "loose 5 @22",
      "refused purge shut @26",
      "fire at 2 @34",
      "loose 2 @34",
      "waveFailed @37",
      "swallowed ward open @37",
    ]);
  });
});
