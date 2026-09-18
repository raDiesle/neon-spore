/**
 * **What SNAKE's two hands on the body do that neither screen already says**,
 * as three events (`snake-controls.ts`).
 *
 * Its own file on `events-vane.ts`' terms: one round, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * The round had no events of its own until 18 September 2026 — everything in
 * it was a tile one screen or the other was already drawing.
 *
 * All three cross the split, which is why they are sounds. The prise is
 * player 1 hauling the jaws apart, and player 2 has to hear it because the
 * mouth is the one thing on the head she cannot read the state of while she is
 * steering. The lift and the drop are her thumb going onto the tail and off
 * it, and he has to hear them because the tiles that change are the ones most
 * likely to end the attempt and they are behind the part of the body he is
 * shown.
 */
export type SnakeEvent =
  /** Player 1 prised the stuck jaws apart, at the head's tile. */
  | { type: "snakePrise"; col: number; row: number }
  /** Player 2's thumb landed on the tail: its last tiles are off the arena. */
  | { type: "snakeLift"; col: number; row: number }
  /** And came off it: the tail is back down and in the way again. */
  | { type: "snakeDrop"; col: number; row: number };
