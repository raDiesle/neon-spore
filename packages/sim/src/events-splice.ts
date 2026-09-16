/**
 * **Everything THE SPLICE does that neither screen already says**, as events.
 *
 * Its own file on `events-gum.ts`' terms — one fight taken apart rather than
 * incidents that share a body — and one arm of `SimEvent`, so every consumer
 * still switches over the whole list. It is a file rather than four more lines
 * in `events.ts` because that file was one boss from its 250-line limit.
 *
 * Every one carries the entrance's `col` and `row` — the mouth the maw was
 * over — rather than anything about the top end or the straw's path. That is
 * where the picture of the moment is (a burst on a mouth, `effects-spark.ts`),
 * and it is the half of the fight the seat holding the controls can see.
 *
 * Four, and they are the four moments the pair has to hear: a number leaving
 * its top end, the same number going into the maw, one that should not have,
 * and the last tangle coming apart. The *leaving* is a separate event from the
 * *arriving* for the reason THE FLEET's `fleetSalvo` is separate from its
 * splash — the press and the answer are two beats apart on purpose, and a
 * control that answered with a second of silence would be the one thing a
 * control may never do.
 */
export type SpliceEvent =
  /**
   * A suck took hold: the number at the top of this straw has been pulled into
   * its own mouth and is on its way down. `straw` is the entrance, which is
   * the thing the pilot can see, and `number` is what the navigator reads at
   * the far end of it — pushed together because the ear is the one place the
   * two halves of this fight are ever in the same sentence.
   */
  | { type: "spliceFeed"; col: number; row: number; straw: number; number: number }
  /** It arrived, and it was the one wanted. `number` of `of` are now fed. */
  | { type: "spliceFed"; col: number; row: number; number: number; of: number }
  /**
   * The ship ate something it should not have. `clock` is the other way to get
   * here — the round's beats ran out with nothing coming down — and `straw` is
   * -1 for exactly that case, because no straw was at fault.
   */
  | { type: "spliceWrong"; col: number; row: number; straw: number; clock: boolean }
  /** The last number of the last round went in. The tangle is over. */
  | { type: "spliceDown"; col: number; row: number };
