/**
 * The wave's faults, folded into the world hash.
 *
 * `hash-boss.ts`'s file, one mechanic along, and split for its reason: **a
 * fault is the part of the hash that grows every time the owner asks for a
 * kind.** `hash.ts` was at its 250-line ceiling with this block inside it, so
 * the next kind that carries a number of its own — THE FLIP is the one being
 * asked for — could not be added without doing this first, in a diff about
 * something else. Seven kinds share one number between them today and each new
 * one is a line here rather than a line in the middle of the world's own
 * fields.
 *
 * A list of numbers rather than a `push` handed in, exactly as
 * `bossHashParts` answers one: the caller folds them in its own order, and
 * this file cannot accidentally depend on where in the hash it was called.
 *
 * **Why faults are hashed at all**, which is not obvious — they are *script*,
 * handed to `startWave` the way the arrival queue is, and the queue is not
 * hashed. Because they decide, on every beat, whether a shot goes out that
 * nobody pressed. A fault that started one beat later on one device is a
 * different game from that beat on (`fault-placed.ts`).
 */

import type { PlacedFault } from "./fault-placed.js";
import { MALFUNCTION_COLORS, MALFUNCTION_KINDS } from "./malfunction.js";
import type { LitTile } from "./world-faults.js";

/**
 * Every fault on the wave, with its rows and whatever its own arm of the union
 * carries.
 *
 * All of them and not only the ones in force: a placement that has not started
 * yet is still a fact both devices have to agree about, and the beat it starts
 * on is the number they would disagree about.
 *
 * The extra fields are pushed as **index + 1** for the reason every optional
 * tag in this package is: zero is what a fault without that field contributes,
 * so the first entry of a list must not also be zero.
 */
export function faultHashParts(faults: readonly PlacedFault[], lit: readonly LitTile[]): number[] {
  const out: number[] = [faults.length];
  for (const fault of faults) {
    out.push(MALFUNCTION_KINDS.indexOf(fault.kind), fault.at, fault.beats);
    // What a runaway cannon loads: a wave whose ammunition turns over on the
    // beat is a different game from one that always fires red
    // (`malfunction.ts`). The only kind carrying a field of its own today, and
    // the reason the loop has an `if` in it at all.
    if (fault.kind === "cannon") out.push(MALFUNCTION_COLORS.indexOf(fault.color) + 1);
    // Whose screen THE FLIP turns. The second kind to carry a field of its
    // own, and the reason this file was cut out of `hash.ts` before either of
    // them existed. A seat is 1 or 2 and never 0, so it is pushed as it stands
    // — the index + 1 rule above is about a list whose first entry is zero.
    if (fault.kind === "flip") out.push(fault.seat);
  }
  // THE DARK's lit squares, which the fault leaves on the world rather than
  // on its placement. Here and not in `hash.ts` because that file is at its
  // ceiling, and because they are nothing but what one fault has left behind.
  out.push(lit.length);
  for (const t of lit) out.push(t.col, t.row, t.untilTick);
  return out;
}
