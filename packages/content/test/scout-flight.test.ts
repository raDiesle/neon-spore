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

  it("gives every level the same clock, eight times the longest flight", () => {
    // The owner, 29 September 2026: *increase time much more until to collect
    // all*; and 2 October 2026: *the same time for every level, not
    // different*, and a lot of it. The round is flown on what the other seat
    // says, a heading at a time, and a rig says nothing.
    expect(new Set(SCOUT_ARENAS.map((a) => a.beats))).toEqual(new Set([Math.max(...FLOWN) * 8]));
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
