import type { SimConfig } from "./config.js";
import { otherColor } from "./kinds.js";
import type { Color } from "./types.js";

/**
 * THE STRAND's shape, as arithmetic.
 *
 * Nothing here is stored, nothing is mutated and no world is needed: how many
 * beads a thread carries, how far apart they hang, which row each is in on a
 * given beat, which beats the thread steps down on and what colour each bead
 * is are all read off a place, a beat and the config. `strand.ts` next door is
 * what reads a *world* — which beads are alive, which one is lit — and
 * `strand-round.ts` is what changes one.
 *
 * The same split `gyre-rim.ts` has from `gyre.ts`, and for its reason: render
 * and the tests ask where a bead hangs without pulling a whole world in.
 */

/**
 * Beads a thread may be authored with. Two is the shortest run that has an end
 * to choose between at all; five is as many as a field this wide holds once
 * they are spread (`STRAND_STEP`).
 */
export const STRAND_MIN = 2;
export const STRAND_MAX = 5;

/**
 * Columns between one bead and the next.
 *
 * **Two, and the empty lane between them is the point.** At one the beads
 * touched: the thread joining them was hidden behind their own contours on
 * both screens, and a pair counting "third from the left" was counting a run
 * of bodies rather than reading a chain. At two there is a lane of field
 * between every pair, so the line is visible along its whole length and the
 * cannon has somewhere to be that is not already under a bead.
 *
 * It is also what makes the pilot travel. A thread of five now spans nine
 * columns of eleven, so the column the navigator calls is a real journey
 * rather than a nudge — which is the sentence this creature exists to make
 * them say.
 */
export const STRAND_STEP = 2;

/**
 * The **row** a bead hangs at, below the thread's own: none or one, alternating
 * along the thread — **and alternating again on every beat**, so the whole
 * chain undulates as it comes down.
 *
 * A straight horizontal line of bodies reads as a row of arrivals that happen
 * to be level, which is what the pair already sees every wave. The zigzag makes
 * the thread a chain: the eye follows it from end to end without being told to.
 * And the zigzag *inverting* every beat — every bead trading places with the
 * rank it is not in, high going low and low going high — makes it a chain that
 * is alive, which is what the owner asked for. It is a wave in one axis only:
 * nothing ever changes column.
 *
 * **It costs nothing that has to be believed**, because the offset is a real
 * row. A bead hanging low is shot in the tile it is drawn in and breaks the
 * hull where it lands, and a bead that has just risen has genuinely bought
 * itself a beat.
 *
 * Read off the shared beat and the bead's place, with nothing stored: two
 * devices derive one wave, and a thread that has been on the field for eleven
 * beats is in exactly the shape a thread that has been there for one is.
 */
export function beadDrop(place: number, beat: number): number {
  return (place + beat) % 2;
}

/** Whether a thread steps down on this beat. Every `strandFallBeats`, which is
 * the whole of "slower than everything else": on the beats in between it waves
 * and does not descend. */
export function strandFalls(cfg: SimConfig, beat: number): boolean {
  return beat % Math.max(1, cfg.strandFallBeats) === 0;
}

/** How many columns a thread of this many beads covers, end to end. */
export function strandSpan(count: number): number {
  return 1 + STRAND_STEP * (count - 1);
}

/**
 * How many beads this arrival actually gets: what the wave asked for, or
 * `strandBeads` when it asked for nothing, held inside the two bounds above
 * and inside the field's own width.
 *
 * Call this rather than reading `entry.beads` at a spawn site: the director
 * offers the range, the wave stores a number and the field decides what fits,
 * and a second spelling of the clamp is a thread hanging off the edge of a
 * screen it was never on.
 */
export function strandBeadCount(cfg: SimConfig, asked: number | undefined): number {
  // What fits once the beads are spread, which is the number the field really
  // has a say in — `strandSpan` and not `cols` alone, or a thread of five on a
  // narrow field would be clamped into a heap in the last column.
  const fits = Math.floor((cfg.cols - 1) / STRAND_STEP) + 1;
  const most = Math.max(1, Math.min(STRAND_MAX, fits));
  const wanted = Math.max(STRAND_MIN, Math.floor(asked ?? cfg.strandBeads));
  return Math.min(most, wanted);
}

/**
 * The colour of the bead at this place along the thread. Alternating, and
 * **not authored per bead**: what a wave writes is the colour of the leftmost
 * one, and the whole creature is that every neighbour is the other one.
 * `otherColor` rather than a ternary written here, because turning a colour
 * over is a rule the simulation owns (`kinds.ts`).
 */
export function beadColor(left: Color, place: number): Color {
  return place % 2 === 0 ? left : otherColor(left);
}
