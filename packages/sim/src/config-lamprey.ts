/**
 * THE LAMPREY's tuning: the beats around its stays, the rows it lands on,
 * and how far a thumb pulls the head and the tail to free it
 * (`docs/spec/bosses-choreographed.md` §41).
 *
 * What is **not** here is the script — what each stay asks, which seat holds
 * the tail, how far each leap goes and how long each stay waits: that is the
 * wave's, authored on its entry.
 */
export interface LampreyConfig {
  /** Beats the eel swims in before its first bite. */
  lampreyEnterBeats: number;
  /** Beats a leap from one tile to the next takes. */
  lampreyLeapBeats: number;
  /** Beats it recoils from a hit before it leaps on. */
  lampreyRecoilBeats: number;
  /** Beats the spent eel falls away before the wave may end. */
  lampreySpentBeats: number;
  /** The highest row it lands on: clear of the top of the screen, where the switcher stands. */
  lampreyRowTop: number;
  /** The lowest row it lands on: its body clear of the hull and the cannon. */
  lampreyRowBottom: number;
  /** How far the tail's tip lies from the mouth, in tiles: where a thumb holds it. */
  lampreyTailTiles: number;
  /** How far up the head has to be pulled to come off the tile, thousandths of a tile. */
  lampreyHeadPullMilli: number;
  /** How far the tail has to be pulled away from the head in an `apart`, thousandths of a tile. */
  lampreyTailPullMilli: number;
}

export const LAMPREY_DEFAULTS: LampreyConfig = {
  lampreyEnterBeats: 4,
  lampreyLeapBeats: 1,
  lampreyRecoilBeats: 1,
  lampreySpentBeats: 2,
  lampreyRowTop: 3,
  lampreyRowBottom: 9,
  lampreyTailTiles: 3,
  lampreyHeadPullMilli: 1500,
  lampreyTailPullMilli: 1200,
};
