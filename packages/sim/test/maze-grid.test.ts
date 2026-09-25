import { describe, expect, it } from "bun:test";
import { startWave } from "../src/beat.js";
import { step } from "../src/index.js";
import { createWorld, type SimEvent } from "../src/world.js";
import { CFG, fireInto, mazeOf, TPB, untilReading, WHEELS } from "./maze-fixture.js";

/**
 * **One trigger into the drum is one shot, on the game's shot grid too.**
 *
 * The game lays a press on a half-beat grid (`shotChargeBeats: 0.5`), so the
 * press makes a charge and no bullet, and the bullet the drum used to drop was
 * not there yet to be dropped. It came out half a beat later as an ordinary
 * bolt, up the column and off the top of the field, while the drum walked the
 * shot it had taken — the two shots for one trigger `mazeHeard` was written to
 * stop, back on every phone. `test/maze-*.test.ts` never saw it: the rig
 * builds on `DEFAULT_CONFIG`, which has no grid. THE MAZE's film did, the day
 * a shot out of the top began to say so (`content/test/scene-grid.test.ts`).
 */
describe("a shot the drum takes on a shot grid", () => {
  it("still flashes the muzzle when the charge goes, and leaves no bolt on the field", () => {
    const world = createWorld({ ...CFG, shotChargeBeats: 0.5 }, 0);
    startWave(world, 0, [], [], { kind: "maze", rounds: WHEELS });
    untilReading(world);
    const seen: SimEvent[] = fireInto(world, 0);
    expect(mazeOf(world).phase).toBe("travel");
    for (let t = 0; t < 3 * TPB; t++) {
      step(world, []);
      seen.push(...world.events);
      expect(world.bullets).toHaveLength(0);
    }
    expect(seen.filter((e) => e.type === "fire")).toHaveLength(1);
    expect(seen.some((e) => e.type === "shotOut")).toBe(false);
  });
});
