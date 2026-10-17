/**
 * THE BROOD's numbers — where its buds hang, how wide the sac is, and how
 * long it comes down, rests, regrows a dropped bud and stands spent
 * (`brood.ts`). How long each bud ripens, and where and in what colour, is
 * content, not config (`BROOD_SCRIPT`).
 *
 * Its own file for `config-gorge.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.broodBudRow`.
 */
export interface BroodConfig {
  /** The row a bud hangs on, from the top of the field; a dropped bud falls from it. */
  broodBudRow: number;
  /** Columns either side of the middle the sac covers, for what a bolt meets. */
  broodSpan: number;
  /** Beats it takes to come down before the first buds grow. */
  broodEnterBeats: number;
  /** Beats it rests between one step and the next. */
  broodRestBeats: number;
  /** Beats a lobe takes to grow a dropped bud again. */
  broodRegrowBeats: number;
  /** Beats it stands beaten before it goes, so the wave cannot end on the same beat. */
  broodSpentBeats: number;
  /** Beats a body is seen growing inside the sac before it is laid. */
  broodLayLeadBeats: number;
  /** Beats it shudders before a lurch. */
  broodShudderBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: buds on row three of the field — a row higher since 17
 * October 2026, so a dropped bud or a laid body falls a tile further — under
 * a sac nine columns wide; four beats to come down, three between steps, two to regrow a bud
 * and three after the last; a body seen inside it three beats before it is
 * laid, and two beats of shudder before every lurch.
 */
export const BROOD_DEFAULTS: BroodConfig = {
  broodBudRow: 3,
  broodSpan: 4,
  broodEnterBeats: 4,
  broodRestBeats: 3,
  broodRegrowBeats: 2,
  broodSpentBeats: 3,
  broodLayLeadBeats: 3,
  broodShudderBeats: 2,
};
