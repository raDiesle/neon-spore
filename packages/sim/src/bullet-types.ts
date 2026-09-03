import type { Color } from "./types.js";

/**
 * What a shot in flight is made of.
 *
 * Split out of `types.ts` when THE LID's own field took that file past its
 * 250-line limit, along the seam `pod-types.ts` and `hull-types.ts` were both
 * cut on: `types.ts` is the shapes a world is made of, and it grows in exactly
 * one place — the creature, which has gained a field for nearly every kind
 * added to the bestiary since THE DART. A bullet has gained one in that whole
 * time (`pierced`, with THE LANCE) and is scrolled past every time somebody
 * opens the file to add another creature field, which makes it the right half
 * to move.
 *
 * Re-exported from `types.ts`, so nothing that already reaches for a `Bullet`
 * through that file had to move.
 */
export interface Bullet {
  id: number;
  col: number;
  /** Tile row, counted from the hull upwards. Bullets sit on tile centres. */
  row: number;
  /** Progress towards the next tile, 0..999. Interpolation only. */
  subMilli: number;
  color: Color;
  /**
   * True for a shot that left a full lobe — THE LANCE. It travels at
   * `lanceTilesPerBeat` instead of `bulletTilesPerBeat` and passes through
   * bodies of its own colour rather than stopping at the first one. Decided
   * once, when the shot leaves: a charge that fills while the shot is in the
   * air arms the *next* one (`lance.ts`).
   */
  lance: boolean;
  /** Bodies this shot has already gone through. 0 for everything but a lance. */
  pierced: number;
}
