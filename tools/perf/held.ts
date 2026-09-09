import type { Command } from "@neon-spore/sim";

/**
 * WHAT A MEASUREMENT PRESSES, AND ON WHICH WAVE.
 *
 * The sweep plays each wave's arrivals with **no commands at all**, so
 * anything a player has to press for is drawn zero times in it. THE LANCE
 * gained three draw paths on 7 September 2026 — a beam growing up the column
 * while a colour is held, a ribbon with three nodules for the shot itself, and
 * a full-stage wash when it leaves — and its row in `baseline.json` measured
 * none of them. The same hole covers the shield's dome, the maw, THE CLAW's
 * arm and every round's own panel.
 *
 * `tools/frames` already knew how to hold a control through a run (`--hold`,
 * `--press`); this is the same idea with nothing to write on the command line,
 * because a baseline is not a thing anybody types arguments for. A wave named
 * here has these sent once, at its busiest tick, and is then measured with
 * whatever they put on the screen. **A wave not named here is untouched**, so
 * every other row in the baseline stays comparable across this change.
 *
 * Keyed by `Wave.id` and not by name or number, for the reason
 * `REFERENCE_WAVE_IDS` gives: a wave inserted in act one shifts every number
 * after it, and a rename is a thing the owner does by eye. An id that no
 * longer exists is simply never matched — there is no wave to measure, so
 * there is nothing to fail about.
 *
 * Its own file rather than a table in `waves.ts`, which reads `waveName` out
 * of `measure.ts`: `measure.ts` is what sends these, and a table it imported
 * from a file that imports it back is a cycle.
 */

/** One command a measurement sends, from one seat. */
export interface Held {
  player: 1 | 2;
  command: Command;
}

/**
 * How long the sweep runs after sending them, before it starts timing.
 *
 * A held colour is not a picture the moment the thumb lands: the lobe fills
 * over about half a second and the beam grows up the column with it
 * (`lance.ts`), so timing from the press would measure a wave that is mostly
 * still deciding. Half a second in, the thing the wave is named after is on
 * the screen — and `timePaints` runs the world on from there, so the shot, the
 * ribbon and the wash it leaves are all inside the sample too.
 */
export const HOLD_SETTLE_TICKS = 60;

const TABLE: Record<string, readonly Held[]> = {
  // THE LANCE: the cannon parked under the column the cyan three come down,
  // and player two's thumb on cyan and never lifted. `prime` on its own is
  // the whole of the trigger — held long enough the lobe fills and fires by
  // itself, which is exactly the sequence this row was measuring none of.
  theLance: [
    { player: 1, command: { kind: "cannonCol", col: 2 } },
    { player: 2, command: { kind: "prime", on: true, color: "cyan" } },
  ],
};

/** What this wave's measurement presses, or nothing. */
export function heldFor(id: string): readonly Held[] {
  return TABLE[id] ?? [];
}

/** Every wave this table names, for a test that wants to check them against
 * the shipped waves without reaching into the table itself. */
export function heldWaveIds(): string[] {
  return Object.keys(TABLE).sort();
}
