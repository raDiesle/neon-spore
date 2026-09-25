/**
 * THE FILAMENT's tuning: the window between the thumbs, and the clocks
 * around a filament rather than along it.
 *
 * What is *not* here is the pace of the draw — one tile a beat — because it
 * is not a figure, it is the rule: a filament is drawn at the tempo the pair
 * can hear, and *faster than a tile a beat* is the snap (`filament-hand.ts`).
 * A figure for it would be a second tempo under the first, which
 * `docs/decisions.md` #33 already refused for THE SLOW. Nor is the shape of
 * any filament here: the seven are the wave's, authored as words
 * (`packages/content/src/filament-script.ts`), and two waves may hang
 * different ones.
 */
export interface FilamentConfig {
  /** Tiles the navigator may be behind the pilot; one more and the filament goes dark. */
  filamentGapTiles: number;
  /** Beats a filament hangs lit at its free end before the thumbs count. */
  filamentArmBeats: number;
  /** Beats the pilot has to light the first tile before the line strikes the hull. */
  filamentStartBeats: number;
  /** Beats the line may stand still after that, either thumb's move restarting them. */
  filamentStallBeats: number;
  /** Beats a pulled filament takes to come out before the next is armed. */
  filamentPullBeats: number;
  /** Beats the field runs at the slow rate from a filament coming out (THE SLOW). */
  filamentSlowBeats: number;
  /** Beats the beaten body hangs before the wave may end. */
  filamentOutBeats: number;
}

export const FILAMENT_DEFAULTS: FilamentConfig = {
  filamentGapTiles: 3,
  filamentArmBeats: 2,
  filamentStartBeats: 12,
  filamentStallBeats: 6,
  filamentPullBeats: 3,
  filamentSlowBeats: 2,
  filamentOutBeats: 3,
};
