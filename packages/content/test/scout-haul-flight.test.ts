import { describe, expect, it } from "bun:test";
import { type ScoutState, scoutLoad } from "@neon-spore/sim";
import { SCOUT_HAUL_ARENAS } from "../src/scout-haul-arenas.js";
import { beatsToClear, CFG } from "./scout-fly-rig.js";

/**
 * THE HAUL's clocks, against what the rig (`scout-fly-rig.ts`) takes to fly
 * each level, and the reason the wave exists: each level's hold reaches the
 * load it is there to teach.
 */

/** What the rig takes on each level, written down so a change to one has to say so. */
const FLOWN = [8, 9];

/** The load a ship with `n` motes aboard is in. */
const loadAt = (n: number) =>
  scoutLoad(CFG, { carrying: Array.from({ length: n }, (_, i) => i) } as ScoutState);

describe("THE HAUL's arenas, flown", () => {
  for (const [index, beats] of FLOWN.entries()) {
    it(`flies level ${index + 1} in ${beats} beats on the shipped figures`, () => {
      expect(beatsToClear("theHaul", index)).toBe(beats);
    });
  }

  it("gives every level three to four times the flight", () => {
    for (const [index, flight] of FLOWN.entries()) {
      const clock = SCOUT_HAUL_ARENAS[index]?.beats ?? 0;
      expect(clock).toBeGreaterThanOrEqual(flight * 3);
      expect(clock).toBeLessThanOrEqual(flight * 4);
    }
  });

  it("holds every mote on a level, and reaches laden on the first and heavy on the second", () => {
    for (const arena of SCOUT_HAUL_ARENAS) expect(arena.carry).toBe(arena.motes.length);
    expect(SCOUT_HAUL_ARENAS.map((a) => loadAt(a.carry ?? 1))).toEqual(["laden", "heavy"]);
  });

  it("leaves a scout at rest on any mote a third of a tile clear of every hazard", () => {
    const touch = CFG.scoutRadiusMilli + CFG.scoutHazardRadiusMilli;
    for (const arena of SCOUT_HAUL_ARENAS) {
      for (const hazard of arena.hazards) {
        expect(hazard.vRowMilli).toBe(0);
        for (const mote of arena.motes) {
          expect(Math.abs(mote.rowMilli - hazard.rowMilli) - touch).toBeGreaterThanOrEqual(333);
        }
      }
    }
  });
});
