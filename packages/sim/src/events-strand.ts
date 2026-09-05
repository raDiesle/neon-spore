import type { Color } from "./types.js";

/**
 * THE STRAND's three: a bead shrivelling, a raisin swelling back, and the
 * thread itself parting.
 *
 * Its own file rather than three more arms of `events-creature.ts`, for the
 * reason `events-carom.ts` and `events-volley.ts` are next door to that one:
 * it is at its 250-line limit. What is here is one arrival taken apart, and it
 * joins `CreatureEvent` next door as a single arm.
 *
 * **The two directions are two events and not one with a flag on it.** They
 * are the same number moving by one either way, which was the argument for
 * folding them together — and it is the wrong argument, because what the ear
 * has to be able to tell apart is not the size of the change but *who caused
 * it*. One is the pair getting a sentence right under a voice delay; the other
 * is a shot that undid the last one. `packages/audio` binds one cue per event
 * type, so a flag would have meant one sound for both.
 */
export type StrandEvent =
  /**
   * A bead took the matching colour and shrivelled. It does **not** leave the
   * field — a raisin on the thread is the only readout either seat has of how
   * far along they are — so this rides where an ordinary body would get a
   * `destroy`, and it is deliberately not one: the column is not closed.
   *
   * `left` is how many beads are still alive after it, which is the number the
   * pair is counting down. `color` is the bead's own, so the burst is thrown
   * in it. And `id` is the body, for `rindShed`'s reason: the bead is still
   * falling, so the picture of it shrivelling has to be redrawn around
   * wherever it is this frame rather than frozen on the tile the shot met it
   * on. A column and a row name a place; only an id names the thing that moved.
   */
  | { type: "strandBead"; id: number; col: number; row: number; color: Color; left: number }
  /**
   * A shot landed on a live bead that was **not** the next one, and the last
   * raisin has swollen back into a bead. The thread is longer than it was.
   *
   * It carries the colour of the bead that came back, which is the one moment
   * player 2 is shown a colour on this creature at all — deliberately, and not
   * a leak: they have just spent a shot proving what it was, and a mistake
   * that told them nothing would be a mistake they could make twice.
   */
  | { type: "strandSwell"; id: number; col: number; row: number; color: Color; left: number }
  /**
   * The thread parting, a beat after its last bead was shrivelled
   * (`breakSpentStrands`). `col` and `row` are the middle of what was hanging
   * there rather than the tile of the last shot: what goes is the whole
   * arrival, and the pair has held one order across every beat of it.
   */
  | { type: "strandBroke"; col: number; row: number };
