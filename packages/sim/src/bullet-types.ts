import type { Color } from "./types.js";

/**
 * What a shot in flight is made of.
 *
 * Split out of `types.ts` when THE LID's own field took that file past its
 * 250-line limit, along the seam `pod-types.ts` and `hull-types.ts` were both
 * cut on: `types.ts` is the shapes a world is made of, and it grows in exactly
 * one place — the creature, which has gained a field for nearly every kind
 * added to the bestiary since THE DART. A bullet has gained one in that whole
 * time (`lance`, with THE LANCE) and is scrolled past every time somebody
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
   * Thousandths of a column crossed on the last tick, signed. Zero for a shot
   * climbing, which is every shot in the game except one that has turned the
   * corner of a lock and is running sideways into the body (`lock.ts`).
   *
   * It is on the shot rather than worked out again by whoever needs it because
   * both things that need it would otherwise have to read the lock's own rules
   * to get it: the tail render/ draws behind the head, which points at nowhere
   * if it is drawn under a bolt travelling across, and the plate under a
   * magnet, which is the question *did this arrive from the side* and nothing
   * else (`magnet.ts`).
   */
  aimMilli: number;
}
