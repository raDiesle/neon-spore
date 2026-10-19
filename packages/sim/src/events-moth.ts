/**
 * **Everything THE MOTH does that neither screen already says**, as events.
 *
 * Its own file on `events-gorge.ts`' terms. Where it hangs, which spots are
 * lit and how far it has sunk are read off `MothState` every frame
 * (`moth.ts`); what is *not* in the world a frame later is the moment it
 * moved, sank, tore or landed, so each of these is one such edge, and each
 * names the column it happened in, because a column is what player 1 hears.
 */
export type MothEvent =
  /** It is fluttering in over the middle column. */
  | { type: "mothEnter"; col: number }
  /** A step began: its spots lit, or its belly open to a dive, over `col`. */
  | { type: "mothStep"; col: number; step: number }
  /** It flew `by` columns to hang over `col`: a drift to the light, or a hop away. */
  | { type: "mothFlit"; col: number; by: number }
  /** It began to sink over the cannon in `col`: it lands unless the cannon moves. */
  | { type: "mothSettle"; col: number }
  /** A red bolt hit the spot over `col`: that wing is torn, `left` lobes are left. */
  | { type: "mothTear"; col: number; left: number }
  /** A red bolt hit its belly over `col` as it sank: it reels up, `left` are left. */
  | { type: "mothBelly"; col: number; left: number }
  /** A bolt met its body or a wing over `col` where nothing is lit: nothing. */
  | { type: "mothHide"; col: number }
  /** A bolt of another colour met a lit part over `col`: the wave is lost. */
  | { type: "mothSpoil"; col: number }
  /** It shook a slick off its wing over `col`, which falls like any other. */
  | { type: "mothDust"; col: number }
  /** It sank all the way and landed on the cannon in `col`: the hull is hit. */
  | { type: "mothLand"; col: number }
  /** The last part is hit: it is beaten. */
  | { type: "mothSpent"; col: number }
  /** It is gone, and the wave may end. */
  | { type: "mothOut"; col: number };
