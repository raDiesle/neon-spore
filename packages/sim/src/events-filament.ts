/**
 * What THE FILAMENT says as it happens, one line per thing the picture and
 * the sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to and the frame to find: a filament's is the column its free end
 * hangs in, a thumb's is the tile the thumb reached. The draw and the follow
 * carry `row` too, because a line is drawn a tile at a time and the look
 * lights the one tile and no other.
 *
 * **Four ways a filament fails** and each has its own word, because
 * each is a different pair's mistake: `filamentSnap` is his hand too fast,
 * `filamentRecoil` is hers on his, `filamentDark` is the two of them too far
 * apart — and a fourth, `filamentLate`, is a thumb that never moved. A sound
 * that said *again* for all four would say nothing. Each is a strike on the
 * hull, so each is the wave; the strike's own events are the hull's.
 */

interface FilamentColEvent {
  /** The column it happened over. */
  col: number;
}

export type FilamentEvent =
  /** The body is in over the field with its filaments hanging; none is armed yet. */
  | ({ type: "filamentEnter" } & FilamentColEvent)
  /** Filament `index` is lit at its free end and the thumbs may take it. */
  | ({ type: "filamentArm"; index: number } & FilamentColEvent)
  /** The pilot's thumb lit the next tile, at `row`. */
  | ({ type: "filamentDrawn"; row: number } & FilamentColEvent)
  /** The navigator's thumb reached the next lit tile, at `row`. */
  | ({ type: "filamentFollowed"; row: number } & FilamentColEvent)
  /** The pilot carried faster than a tile a beat: the filament snaps back to its free end. */
  | ({ type: "filamentSnap" } & FilamentColEvent)
  /** The navigator's thumb reached the pilot's: the thumbs collide and the filament recoils. */
  | ({ type: "filamentRecoil" } & FilamentColEvent)
  /** The gap passed `filamentGapTiles`: the filament goes dark, back to its free end. */
  | ({ type: "filamentDark" } & FilamentColEvent)
  /** The line stood still past its clock: `seat` is the thumb it was waiting
   * on — the pilot's when his move was open, else the navigator's. */
  | ({ type: "filamentLate"; seat: 1 | 2 } & FilamentColEvent)
  /** Filament `index` was traced end to end: it is pulled out and the body narrows. */
  | ({ type: "filamentPulled"; index: number } & FilamentColEvent)
  /** The last filament is out: the body is beaten and hangs. */
  | ({ type: "filamentDown" } & FilamentColEvent)
  /** The body is out, `filamentOutBeats` after the last filament; the wave may end. */
  | ({ type: "filamentOut" } & FilamentColEvent);
