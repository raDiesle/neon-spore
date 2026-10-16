/**
 * THE GEODE's tuning: the beats around its levels.
 *
 * What is **not** here is the script — how many cracks, where each runs, the
 * colour under each and how long each level may take: that is the wave's,
 * authored on its entry.
 */
export interface GeodeConfig {
  /** Beats the stone takes to sink in over the field before the first cracks light. */
  geodeEnterBeats: number;
  /** Beats the pieces take to fly apart and turn between two levels. */
  geodeSplitBeats: number;
  /** Beats the shattered heart takes to scatter before the wave may end. */
  geodeSpentBeats: number;
}

export const GEODE_DEFAULTS: GeodeConfig = {
  geodeEnterBeats: 6,
  geodeSplitBeats: 4,
  geodeSpentBeats: 6,
};
