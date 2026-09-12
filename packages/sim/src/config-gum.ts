/**
 * THE GUM's numbers: how far a swipe has to carry it, how much a swipe the
 * wrong way spreads it, and what flinging one is worth (`gum.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-crystal.ts`'
 * reason next door: every call site still reads `cfg.gumSwipeMilli`, and the
 * split is only about how much of one file a reader has to hold at once.
 */
export interface GumConfig {
  /**
   * How far player 2's hand has to carry a stuck gum, in thousandths of a
   * tile, before the swipe counts. One whole tile: shorter and a thumb
   * settling on it would fling it, longer and the gesture stops being a
   * flick and starts being a drag across the ship — and the drag is the
   * cannon's own gesture on the same surface.
   */
  gumSwipeMilli: number;
  /**
   * Columns a swipe the **wrong** way spreads it by. One: the wrong guess
   * costs a lane of cannon, every time, and a gum spread twice is three lanes
   * the ship cannot fire from until somebody swipes it the right way.
   */
  gumSpreadCols: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const GUM_DEFAULTS: GumConfig = {
  gumSwipeMilli: 1000,
  gumSpreadCols: 1,
};
