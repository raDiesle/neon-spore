/**
 * THE GUM's numbers: how far a swipe has to carry it, and how fast it flies
 * once it has been swiped (`gum.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-crystal.ts`'
 * reason next door: every call site still reads `cfg.gumSwipeMilli`, and the
 * split is only about how much of one file a reader has to hold at once.
 */
export interface GumConfig {
  /**
   * How far a hand has to carry a falling gum, in thousandths of a tile,
   * before the swipe counts — the gum's own `gripPushMilli`. One whole tile:
   * shorter and a thumb settling on it would fling it, longer and the gesture
   * stops being a flick and starts being a drag down the field beside the
   * thing it is meant to send off it.
   */
  gumSwipeMilli: number;
  /**
   * Columns a swiped gum flies each beat, along its row, until it is off the
   * field. More than a crossing rock's stride (`rockCrossCols`): a rock is
   * walking its row and a gum has been thrown out of one, and the pair should
   * see it leave rather than watch it go.
   */
  gumFlingCols: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const GUM_DEFAULTS: GumConfig = {
  gumSwipeMilli: 1000,
  gumFlingCols: 3,
};
