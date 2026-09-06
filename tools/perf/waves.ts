import { WAVES } from "@neon-spore/content";
import { waveName } from "./measure.js";

/**
 * WHICH WAVES A RUN COVERS.
 *
 * Its own file because it asks nothing of a browser: `measure.ts` is one run
 * taken off a real Chrome, and this is a line of text turned into a list of
 * indices, which is the one part of a run a test can hold without launching
 * anything. It is also what made `measure.ts` outgrow the limit the day the
 * narrow run arrived.
 *
 * The narrow run is the ordinary one — a lane that adds a creature measures the
 * waves that creature appears in, and the whole game is swept only when a
 * baseline is being taken.
 */

/**
 * Which waves a run covers, resolved from what the caller asked for.
 *
 * A name is matched the way a person would say it — case and surrounding space
 * ignored — and a number is the one the HUD prints, which is 1-based. An ask
 * that matches nothing is an error rather than an empty run: a session that
 * mistyped a wave and got a clean sweep of zero waves would read it as a pass.
 */
export function wavesAsked(asked: readonly string[]): number[] {
  if (asked.length === 0) return WAVES.map((_, i) => i);
  const out: number[] = [];
  for (const one of asked) {
    const want = one.trim();
    const number = Number(want);
    const index = Number.isInteger(number)
      ? number - 1
      : WAVES.findIndex((_, i) => waveName(i).toLowerCase() === want.toLowerCase());
    if (index < 0 || index >= WAVES.length) {
      throw new Error(
        `no wave called ${JSON.stringify(want)} — say its number or the name the HUD prints`,
      );
    }
    if (!out.includes(index)) out.push(index);
  }
  return out.sort((a, b) => a - b);
}

/**
 * The waves every narrow run carries along with the ones it was asked for.
 *
 * A verdict is a wave's share of its own run's median, which is what lets an
 * afternoon that slowed the whole machine cancel out. A run of one wave has no
 * such median — it *is* that wave — so the narrow run had to report
 * milliseconds and refuse to judge them. These five give it a median made of
 * code the lane did not touch, and the verdict comes back for about fifteen
 * seconds of extra measuring against the three and a quarter minutes a full
 * sweep costs.
 *
 * They are chosen to span the range rather than to be typical: FIRST STEP is
 * about as cheap as a wave with a field gets, THE ECHO carries nineteen bodies
 * and is among the dearest, and three sit between. THE GAUGE is deliberately
 * **not** here — its round has no field and no hull at all, a fifth of any
 * other wave, and a median of five containing it would sit somewhere no real
 * frame does.
 *
 * By **id** and not by name or number, because both of those move: a wave
 * inserted in act one shifts every number after it, and a rename is a thing the
 * owner does by eye. An id that no longer exists is an error rather than a
 * quietly shorter reference set — five waves is already the floor.
 */
export const REFERENCE_WAVE_IDS = [
  "firstStep",
  "theWall",
  "theDart",
  "theWisp",
  "theEcho",
] as const;

/** Where those five stand today, as indices. */
export function referenceWaves(): number[] {
  return REFERENCE_WAVE_IDS.map((id) => {
    const index = WAVES.findIndex((w) => (w as { id?: string }).id === id);
    if (index === -1) {
      throw new Error(
        `the reference wave ${JSON.stringify(id)} is gone — pick another in tools/perf/waves.ts, ` +
          `and say in the commit why the figures before and after are not comparable`,
      );
    }
    return index;
  });
}

/**
 * The waves a run will actually measure: the ones asked for, plus the reference
 * set when there are too few of them to carry a median.
 *
 * A run already at or over the floor is left alone — a lane touching five waves
 * has enough of its own — and so is a full sweep, which contains the references
 * already.
 */
export function withReferences(asked: readonly number[], floor: number): number[] {
  if (asked.length >= floor) return [...asked];
  const all = new Set([...asked, ...referenceWaves()]);
  return [...all].sort((a, b) => a - b);
}
