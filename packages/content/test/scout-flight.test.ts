import { describe, expect, it } from "bun:test";
import { SCOUT_ARENAS } from "../src/scout-arenas.js";
import { beatsToClear, CFG } from "./scout-fly-rig.js";

/** THE SCOUT's clocks, against what the rig (`scout-fly-rig.ts`) takes to fly each level. */

/** What the rig takes on each level, written down so a change to one has to say so. */
const FLOWN = [6, 14, 20, 26];

describe("THE SCOUT's arenas, flown", () => {
  for (const [index, beats] of FLOWN.entries()) {
    it(`flies level ${index + 1} in ${beats} beats on the shipped figures`, () => {
      expect(beatsToClear("theScout", index)).toBe(beats);
    });
  }

  it("gives every level much more clock than the flight", () => {
    // The owner, 29 September 2026: *increase time much more until to collect
    // all*. The round is flown on what the other seat says, a heading at a
    // time, and a rig says nothing — so a clock twice its flight was a clock
    // for a pair who never spoke. Three times is the floor now, and four the
    // ceiling, past which `ranOut` could only end a pair who had stopped
    // flying altogether.
    for (const [index, flight] of FLOWN.entries()) {
      const clock = SCOUT_ARENAS[index]?.beats ?? 0;
      expect(clock).toBeGreaterThanOrEqual(flight * 3);
      expect(clock).toBeLessThanOrEqual(flight * 4);
    }
  });

  it("puts one mote more on each level, from one", () => {
    expect(SCOUT_ARENAS.map((a) => a.motes.length)).toEqual([1, 2, 3, 4]);
  });

  it("leaves a scout at rest on any mote a third of a tile clear of every hazard", () => {
    // A hazard sweeps its whole row, wall to wall, so the room on a mote is its
    // distance from the row less the two radii a touch adds up.
    const touch = CFG.scoutRadiusMilli + CFG.scoutHazardRadiusMilli;
    for (const arena of SCOUT_ARENAS) {
      for (const hazard of arena.hazards) {
        expect(hazard.vRowMilli).toBe(0);
        for (const mote of arena.motes) {
          expect(Math.abs(mote.rowMilli - hazard.rowMilli) - touch).toBeGreaterThanOrEqual(333);
        }
      }
    }
  });
});
