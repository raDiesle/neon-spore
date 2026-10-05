/**
 * THE FLUE's tuning: the beats around its levels, how far the ember runs,
 * the row it runs on, how near the cannon's column a shot must meet it, and
 * how many shots a level allows (`docs/spec/bosses.md` §11.57).
 *
 * What is **not** here is the levels — which weapon, which colour, how fast
 * the ember runs and how slow THE SLOW plays: those are the wave's, authored
 * on its entry, so the pair can be shown each level's whole combination.
 */
export interface FlueConfig {
  /** Beats the flue stands before the first level lights. */
  flueSlackBeats: number;
  /** Beats the flue rests after a level is cleared before the next lights. */
  fluePauseBeats: number;
  /** Beats the spent flue stands before the wave may end. */
  flueSpentBeats: number;
  /** How far either side of the middle column the ember runs, thousandths of a column. */
  flueSpanMilli: number;
  /** The row, from the top, the ember runs along and a shot meets it on. */
  flueRow: number;
  /** How far off the cannon's column the ember may be and still be met, thousandths of a column. */
  flueHitMilli: number;
  /** Shots a level allows; the last one missed is the wave. */
  flueShots: number;
}

export const FLUE_DEFAULTS: FlueConfig = {
  flueSlackBeats: 2,
  fluePauseBeats: 2,
  flueSpentBeats: 2,
  flueSpanMilli: 4500,
  flueRow: 2,
  flueHitMilli: 450,
  flueShots: 3,
};
