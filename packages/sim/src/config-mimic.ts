/**
 * THE MIMIC's tuning: the beats around its pictures, how long the skin stays
 * mottled after a window runs out, when a changing picture changes, how many
 * reaches strike the hull, and where on the board the pictures and the core
 * stand (`docs/spec/bosses-choreographed.md` §42).
 *
 * What is **not** here is the script — which seat reads, which pictures change,
 * how long each window is and which colour the core wants: that is the
 * wave's, authored on its entry.
 */
export interface MimicConfig {
  /** Beats the flattened mimic takes to slap into its round shape. */
  mimicEnterBeats: number;
  /** Beats the skin stays mottled after a window runs out, before an arm reaches. */
  mimicMimicBeats: number;
  /** Beats it flinches from a peel before the next step. */
  mimicPeelBeats: number;
  /** Beats into a changing picture's window that another takes its place. */
  mimicChangeBeats: number;
  /** Reaches in one movement that strike the hull. */
  mimicReaches: number;
  /** Beats it clenches from a hit on the core before the next step. */
  mimicClenchBeats: number;
  /** Beats the spent mimic falls before the wave may end. */
  mimicSpentBeats: number;
  /** The highest row a picture may stand on: the rows above it are the HUD's. */
  mimicBoardTop: number;
  /** The row the bare core is on, in the middle column; a tap on it or the eight round it is a tap on the core. */
  mimicCoreRow: number;
}

export const MIMIC_DEFAULTS: MimicConfig = {
  mimicEnterBeats: 4,
  mimicMimicBeats: 2,
  mimicPeelBeats: 1,
  mimicChangeBeats: 6,
  mimicReaches: 3,
  mimicClenchBeats: 1,
  mimicSpentBeats: 3,
  mimicBoardTop: 1,
  mimicCoreRow: 3,
};
