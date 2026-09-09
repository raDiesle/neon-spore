import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { heldFor, heldWaveIds } from "../held.js";
import { BOSS_SONG_FRACTION, PEAK_SEARCH_STEP, peakTick } from "../sweep-timing.js";

/**
 * The two holes a sweep used to have, as arithmetic and as a table — the parts
 * of both that can be held without a browser in the room.
 *
 * A boss round has no creatures, so the search for the tick a wave carries the
 * most bodies never improved on tick 0 and every round in the baseline was
 * photographed during its count-in: THE PULSE's row was 0.70 ms, which is a
 * hull, a title and none of the round. And the sweep sends no commands at all,
 * so THE LANCE's beam, ribbon and wash — three draw paths added on 7 September
 * 2026 — were drawn zero times in the row that was supposed to measure them.
 */

describe("peakTick", () => {
  test("an ordinary wave is measured where its bodies peaked", () => {
    expect(peakTick({ tick: 615, bodies: 19, round: false, ran: 1200 })).toBe(615);
  });

  test("a wave with no bodies at all is still measured at its own peak of none", () => {
    // Not a round: whatever the search found is the honest answer, and 0 with
    // no round on the field means the wave really is empty there.
    expect(peakTick({ tick: 0, bodies: 0, round: false, ran: 900 })).toBe(0);
  });

  test("a round that puts nothing on the field is measured inside its song", () => {
    const at = peakTick({ tick: 0, bodies: 0, round: true, ran: 1200 });
    expect(at).toBe(600);
    expect(at % PEAK_SEARCH_STEP).toBe(0);
    // The whole point: not the count-in.
    expect(at).toBeGreaterThan(0);
  });

  test("a round that does deal bodies keeps the count it found", () => {
    // A count is the better measure wherever there is one to take, so the
    // fraction is the fallback and never the rule.
    expect(peakTick({ tick: 450, bodies: 6, round: true, ran: 1200 })).toBe(450);
  });

  test("the fraction lands somewhere inside every round, however short", () => {
    // Past the count-in and never past the end — the two things that have to
    // hold for a round of any length. The shortest possible round is one
    // search step long, where rounding to a whole step is the whole answer.
    for (const ran of [PEAK_SEARCH_STEP, 120, 435, 2_400]) {
      const at = peakTick({ tick: 0, bodies: 0, round: true, ran });
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThanOrEqual(ran);
      expect(Math.abs(at - ran * BOSS_SONG_FRACTION)).toBeLessThanOrEqual(PEAK_SEARCH_STEP);
    }
  });
});

describe("held controls", () => {
  test("every wave the table names is a wave the game ships", () => {
    const ids = new Set(WAVES.map((w) => (w as { id?: string }).id));
    for (const id of heldWaveIds()) expect(ids.has(id)).toBe(true);
  });

  test("THE LANCE is measured with a colour held, which is the whole wave", () => {
    const held = heldFor("theLance");
    // Player two's thumb on a colour and never lifted: `prime` on its own is
    // the trigger, and held long enough the lobe fills and fires by itself.
    expect(held.some((h) => h.player === 2 && h.command.kind === "prime")).toBe(true);
    // And the cannon parked under the column those bodies come down, because a
    // beam up an empty column is a beam that burns nothing.
    expect(held.some((h) => h.player === 1 && h.command.kind === "cannonCol")).toBe(true);
  });

  test("a wave the table does not name sends nothing, so its row is unchanged", () => {
    expect(heldFor("firstStep")).toEqual([]);
    expect(heldFor("nothingCalledThis")).toEqual([]);
  });
});
