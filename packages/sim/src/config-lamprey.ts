/**
 * THE LAMPREY's tuning: the worm's crawl, the beats around its stays, the
 * tiles it lands on, and how far a thumb pulls the head and the tail to free it
 * (`docs/spec/bosses-choreographed.md` §41).
 *
 * What is **not** here is the script — what each stay asks, which seat holds
 * the tail, how far each leap goes and how long each stay waits: that is the
 * wave's, authored on its entry.
 */
export interface LampreyConfig {
  /** How far off the field's side it crawls in from, in columns. */
  lampreyOutCols: number;
  /** The row its head waits for a morsel of its meal on, where the morsel says none. */
  lampreyFeedRow: number;
  /** The rows a crawl crosses the field along: out on the high one, back on the low one. */
  lampreyHighRow: number;
  lampreyLowRow: number;
  /** Tiles its head crawls a beat each way, and while it goes for food. */
  lampreyCrawlTiles: number;
  lampreyLungeTiles: number;
  /** How far ahead of its head a crawl's food falls, in columns. */
  lampreyFoodCols: number;
  /** Columns it never bites in at either side, so the whole mouth and its teeth are on the screen. */
  lampreyEdgeCols: number;
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
  /** How far the tail has to be pulled away from the head in an `apart` or a `tow`, thousandths of a tile. */
  lampreyTailPullMilli: number;
  /** The row a `tow` comes down to from the middle of the field: the head nearly on the hull. */
  lampreyTowRow: number;
  /** The row in the middle of the field it sets off down from. */
  lampreyTowFromRow: number;
  /** How far along its curve the head has to be pulled back off the hull, thousandths of a tile. */
  lampreyTowMilli: number;
  /** How far along the curve the eel loses its temper and lunges back at the hull, once a tow. */
  lampreyTowAngerMilli: number;
  /** Where along the curve the lunge throws the head back to, and the knob waits. */
  lampreyTowBackMilli: number;
  /** How far out of the panel a `plug` has its button as it bites, thousandths of the button's travel. */
  lampreyPlugStartMilli: number;
  /** How far a `plug` pulls its button out each beat. */
  lampreyPlugCreepMilli: number;
  /** How far one press of the bitten button pushes it back in. */
  lampreyPlugPushMilli: number;
  /** How far out the button may be and still count as in: the tail pulled full then frees the eel. */
  lampreyPlugFlushMilli: number;
  /** How far the button jerks out when the tail is pulled full while it is not in. */
  lampreyPlugYankMilli: number;
}

export const LAMPREY_DEFAULTS: LampreyConfig = {
  lampreyOutCols: 3,
  lampreyFeedRow: 3,
  lampreyHighRow: 4,
  lampreyLowRow: 8,
  lampreyCrawlTiles: 1,
  lampreyLungeTiles: 2,
  lampreyFoodCols: 3,
  lampreyEdgeCols: 1,
  lampreyLeapBeats: 1,
  lampreyRecoilBeats: 1,
  lampreySpentBeats: 2,
  lampreyRowTop: 3,
  lampreyRowBottom: 9,
  lampreyTailTiles: 3,
  lampreyHeadPullMilli: 1500,
  lampreyTailPullMilli: 1200,
  lampreyTowRow: 11,
  lampreyTowFromRow: 6,
  lampreyTowMilli: 4500,
  lampreyTowAngerMilli: 3000,
  lampreyTowBackMilli: 1500,
  lampreyPlugStartMilli: 400,
  lampreyPlugCreepMilli: 150,
  lampreyPlugPushMilli: 300,
  lampreyPlugFlushMilli: 200,
  lampreyPlugYankMilli: 350,
};
