import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent, ticksPerBeat } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE LIMPET's film, watched: the body lands on the shield, the shield walks
 * a column a beat and holds, and it is lost only after the thumb stops.
 *
 * A move a beat late would lose the round under the page that says to keep
 * moving, and a field left with nothing to spawn would rest instead of fail.
 * Neither shows as wrong until the wrong page is up, so the order is held.
 */
describe("the rehearsal for THE LIMPET", () => {
  it("holds while the shield walks, and fails a beat and a half after it parks", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLimpet");
    const run = new SceneRun(sceneScript("theLimpet", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theLimpet.ticks - 1; t++) {
      const events: SimEvent[] = [];
      run.advance(events);
      for (const e of events) {
        if (e.type === "clingGrip" || e.type === "waveFailed" || e.type === "needWave") {
          seen.push(`${e.type} @${run.tick}`);
        }
      }
    }
    const lastMove = SCENES.theLimpet.acts.at(-1)?.tick ?? 0;
    const lostPage = SCENES.theLimpet.steps.at(-1)?.tick ?? 0;
    expect(seen.map((s) => s.split(" @")[0])).toEqual(["clingGrip", "waveFailed"]);
    const lost = Number(seen[1]?.split(" @")[1]);
    expect(lost).toBeGreaterThan(lostPage);
    expect(lost - lastMove).toBeLessThanOrEqual(
      DEFAULT_CONFIG.harpoonStillBeats * ticksPerBeat(run.world.cfg) + 1,
    );
  });
});
