/**
 * **Everything THE CHOKE does**, as events: it takes the cannon, it is
 * tapped, and it lets go. Its own file on `events-gum.ts`' terms — one
 * arrival taken apart — and one arm of `CreatureEvent`, so every consumer
 * still switches over the whole list.
 *
 * There is no event for the cannon walking a column. It does so every beat
 * for as long as the choke has it, and a sound on every beat of a wave is a
 * metronome the pair already has; the picture says where the cannon is.
 */
export type ChokeEvent =
  /**
   * A choke came to rest on the ship and took the cannon. Pushed on the beat
   * it is drawn standing on the hull — the beat every other body breaks the
   * hull on — and never again for the same body. `col` is the cannon's
   * column, which is where the body now is, and `from` the lane it fell.
   */
  | { type: "chokeGrip"; col: number; row: number; from: number }
  /**
   * Player 1 landed a fresh press on the dead strip. `taps` is how many so
   * far and `of` how many it takes, so the ear can climb as the grip loosens
   * — the pair has to hear that tapping *repeats*, and that it is getting
   * somewhere. Once per press, never per message: a thumb held down is one.
   */
  | { type: "chokeTap"; col: number; taps: number; of: number }
  /**
   * Tapped off, and gone. `col` is where the cannon stands as it comes back
   * to the strip.
   */
  | { type: "chokeFreed"; col: number; row: number };
