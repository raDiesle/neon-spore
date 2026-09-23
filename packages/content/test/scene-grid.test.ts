import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES, type SceneId } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * **Every film tells the same story on both shot grids, or says which one it
 * was written on.**
 *
 * `apps/game` lays a press on a half-beat grid (`shotChargeBeats: 0.5`) and
 * `DEFAULT_CONFIG`, which every film test builds on, has none. A film's bolts
 * therefore leave up to half a beat later in the game than in its test, and
 * for most films that is the same kill a row lower. For six it was not, swept
 * on 23 September 2026: THE THIRD SHOT and THE ORRERY breached the hull, THE
 * JAM's presses were refused, THE CANDLE never dimmed, THE TASTER thickened
 * twice and THE ANTIPHON sank two organs and never burst — all green in their
 * tests, all playing wrong on a phone. Each now names the grid it was proved
 * on (`chargeBeats`, `scene-types.ts`), as THE HIVE names the one it was
 * written for.
 *
 * The story is the count of each kind of event, not their ticks or rows: a
 * later bolt meets its body lower, and that is the grid working. `beat` is
 * left out, since a film whose last bolt lands later ends a beat later. A film
 * with no `chargeBeats` whose counts disagree is one nobody has decided about
 * yet: trace it, and write the grid its acts were timed against.
 */

/** How many of each kind of event the film fires, on a host with this grid. */
function story(id: SceneId, charge: number): Record<string, number> {
  const wave = Math.max(
    0,
    WAVES.findIndex((w) => w.guide?.scene === id),
  );
  const run = new SceneRun(sceneScript(id, wave, { ...DEFAULT_CONFIG, shotChargeBeats: charge }));
  const counts: Record<string, number> = {};
  const events: SimEvent[] = [];
  for (let t = 0; t < SCENES[id].ticks - 1; t++) {
    events.length = 0;
    run.advance(events);
    for (const e of events) {
      if (e.type !== "beat") counts[e.type] = (counts[e.type] ?? 0) + 1;
    }
  }
  return counts;
}

describe("a film on the game's shot grid", () => {
  const undecided = (Object.keys(SCENES) as SceneId[]).filter(
    (id) => SCENES[id].chargeBeats === undefined,
  );

  it.each(undecided)("%s fires the same events with and without the grid", (id) => {
    expect(story(id, 0.5)).toEqual(story(id, 0));
  });
});
