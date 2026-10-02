/**
 * THE MIMIC's tuning: the beats around its signs, how long a wrong sign is
 * worn, when a changing sign changes, and how many reaches strike the hull
 * (`docs/spec/bosses-choreographed.md` §42).
 *
 * What is **not** here is the script — which seat reads, which signs change,
 * how long each window is and which colour the core wants: that is the
 * wave's, authored on its entry.
 */
export interface MimicConfig {
  /** Beats the flattened mimic takes to slap into its round shape. */
  mimicEnterBeats: number;
  /** Beats the skin wears a wrong sign, or the mottle, before an arm reaches. */
  mimicMimicBeats: number;
  /** Beats it flinches from a peel before the next step. */
  mimicPeelBeats: number;
  /** Beats into a changing sign's window that it sinks and another rises. */
  mimicChangeBeats: number;
  /** Reaches in one movement that strike the hull. */
  mimicReaches: number;
  /** Beats it clenches from a hit on the core before the next step. */
  mimicClenchBeats: number;
  /** Beats the spent mimic falls before the wave may end. */
  mimicSpentBeats: number;
}

export const MIMIC_DEFAULTS: MimicConfig = {
  mimicEnterBeats: 4,
  mimicMimicBeats: 2,
  mimicPeelBeats: 1,
  mimicChangeBeats: 3,
  mimicReaches: 3,
  mimicClenchBeats: 1,
  mimicSpentBeats: 3,
};
