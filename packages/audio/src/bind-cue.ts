/**
 * **What one sound-to-be is**: an id out of the catalogue, where it sits in
 * the stereo field, what it is pitched by, and the two exceptions — the seat
 * it belongs to, and the beats it is held back by.
 *
 * Cut out of `bind.ts` when THE COIL's two events took that file past its
 * 250-line limit, and along the seam it has already been cut twice:
 * `bind-place.ts` took the arithmetic of *where* a sound is and
 * `bind-lookups.ts` took the two id-to-id tables, both because everything left
 * next door is an argument about which sound a moment deserves. A shape is the
 * third thing that is not an argument.
 *
 * `bind.ts` re-exports it, so the seven `bind-*.ts` files that build one — and
 * `mixer.ts`, which plays one — did not have to move.
 */
export interface Cue {
  id: string;
  /** -1..1 across the field, or undefined for something with no column. */
  pan?: number;
  /** Multiplies every frequency — how a row becomes a pitch. */
  pitch?: number;
  gain?: number;
  /**
   * The one seat this cue belongs to, or absent for the overwhelming majority
   * that belong to both. Both players hear everything (`docs/spec/systems.md`
   * 5.3) and that is still the rule — this is the exception THE LURE forced,
   * and it exists because the two of them are in one room: a sound made on
   * both phones is a sound the player who is not supposed to have it hears
   * anyway. `Mixer` drops a seated cue unless it has been told which seat it
   * is, so a device that was never told stays silent rather than leaking.
   */
  seat?: 1 | 2;
  /**
   * Beats to hold this cue back by, or absent for the overwhelming majority
   * that sound the moment they are bound.
   *
   * THE FLEET is the only thing that uses it, and it uses it because its shot
   * is no longer resolved where it is heard: the salvo is decided on the tick
   * the thumb lands, and the shell is drawn arcing over the water for
   * `FLEET_SHELL_BEATS` before it reaches the square. A splash that sounded on
   * the press would close the water over a shell still climbing. In beats
   * rather than seconds because the tempo is the game's clock and only the
   * mixer knows it (`Mixer.frame`).
   */
  delayBeats?: number;
}
