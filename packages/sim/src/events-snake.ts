/**
 * **What SNAKE's two hands on the body do that neither screen already says**,
 * as two events (`snake-controls.ts`).
 *
 * Its own file on `events-vane.ts`' terms: one round, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * The round had no events of its own until 18 September 2026 — everything in
 * it was a tile one screen or the other was already drawing.
 *
 * The prise crosses the split, which is why it is a sound: it is player 1
 * hauling the jaws apart, and player 2 has to hear it because the mouth is the
 * one thing on the head she cannot read the state of while she is steering.
 * The lift and the drop of the tail went with the tail's hold, 6 October 2026.
 */
export type SnakeEvent =
  /** Player 1 prised the stuck jaws apart, at the head's tile. */
  | { type: "snakePrise"; col: number; row: number }
  /**
   * A press on the pilot's jaws from the driver's seat, refused once, at the
   * head's tile: every mark's *not yours* (`snake-controls.ts`).
   */
  | { type: "snakeRefuse"; col: number; row: number; part: "jaws"; player: 1 | 2 };
