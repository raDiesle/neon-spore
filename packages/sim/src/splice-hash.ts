import type { SpliceState } from "./splice.js";

/**
 * What THE SPLICE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `snake-hash.ts` and `maze-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time and every rule in here is
 * about what two devices could come to disagree about rather than about a
 * straw.
 *
 * And this boss needs it more than most. Its board is not authored — the
 * tangle is drawn from the seeded rng at the moment a round opens
 * (`splice-tangle.ts`) — so the four arrays below are the *only* record that
 * the two devices drew the same one. THE FLEET's placement being in the hash
 * catches a content build that disagrees; these catch an rng that has been
 * stepped a different number of times, which is the failure a boss that rolls
 * its own board can have and an authored one cannot.
 */

/** Everything about THE SPLICE that goes into `hashWorld`, in a fixed order. */
export function spliceHashParts(b: SpliceState): number[] {
  const parts: number[] = [];
  const push = (n: number): void => {
    parts.push(n);
  };
  push(b.round);
  push(b.roundBeat);
  // The board, laid from the rng. `topOf` is the puzzle and the three column
  // lists are the picture of it — and the picture is in here for the reason
  // SNAKE's bump tile is: a device drawing a straw through a different column
  // is a device showing the navigator a different tangle, and the navigator's
  // whole job is to read one out loud.
  push(b.entranceCols.length);
  for (const col of b.entranceCols) push(col);
  for (const col of b.topCols) push(col);
  for (const col of b.midCols) push(col);
  for (const top of b.topOf) push(top);
  // The fight: what is fed, what is on its way down, whether the eater has
  // taken the round, and whether it is over.
  push(b.fed);
  push(b.flights.length);
  for (const f of b.flights) {
    push(f.straw);
    push(f.beat);
  }
  push(b.passBeat);
  push(b.eatBeat);
  push(b.eatCol);
  push(b.verdict);
  push(b.verdictBeat);
  push(b.verdictStraw);
  // The authored rounds, for THE MIRROR's reason: two phones on two builds of
  // `content` would be counting down different clocks three rounds in, and
  // nothing else in here would say a word about it.
  push(b.rounds.length);
  for (const round of b.rounds) push(round.beats);
  return parts;
}
