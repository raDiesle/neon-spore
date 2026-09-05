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
  /**
   * How far across its own column the shot has been carried, in thousandths of
   * a tile, signed and never past half a tile either way — a shot that reaches
   * the edge changes column instead (`steerShot` in `lock.ts`).
   *
   * Zero for the whole of an ordinary shot's flight. It is only ever anything
   * else because player 1 has a hand on a body and the bolt is steering into
   * it, and it **stays** where it got to when that hand lifts: a shot that
   * snapped back to a column centre the instant the lock ended would be the one
   * moment in this game where something on the field teleports.
   */
  driftMilli: number;
  /**
   * Which way it is going: thousandths of a column crossed per tile climbed,
   * signed. Zero for a shot travelling straight up, which is every shot that
   * is not steering.
   *
   * It is on the shot rather than worked out again by whoever needs it because
   * the one thing that needs it is the tail behind the head, and render/ has no
   * business re-deriving where a bolt was a tile ago from a lock it would have
   * to read the simulation's rules to understand.
   */
  aimMilli: number;
}
