/**
 * THE HYDRA's tuning: the beats around its levels, how far a cut goes, the
 * coil's rim and how an eye blinks.
 *
 * What is **not** here is the script — which heads, in what order, how many a
 * side, which way each neck is cut, how many laps a coil needs, where the maws
 * open and in what colour, and how long each level may take: that is the
 * wave's, authored on its entry.
 */
export interface HydraConfig {
  /** Beats the hydra takes to come in over the field before the first heads come. */
  hydraEnterBeats: number;
  /** Beats the body rears back between two levels, growing the next heads. */
  hydraRearBeats: number;
  /** Beats the beaten hydra takes to sink away before the wave may end. */
  hydraSpentBeats: number;
  /** How far a swipe goes across a neck to cut it, thousandths of a tile. */
  hydraCutMilli: number;
  /** The radius of the ring a coil's lever runs round, thousandths of a tile. */
  hydraCoilRimMilli: number;
  /** Beats an eye stays open before it blinks shut. */
  hydraStareBeats: number;
  /** Beats an eye stays shut before it opens again. */
  hydraBlinkBeats: number;
}

export const HYDRA_DEFAULTS: HydraConfig = {
  hydraEnterBeats: 6,
  hydraRearBeats: 4,
  hydraSpentBeats: 6,
  hydraCutMilli: 1600,
  hydraCoilRimMilli: 900,
  hydraStareBeats: 4,
  hydraBlinkBeats: 2,
};
