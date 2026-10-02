/**
 * THE GORGE's numbers — where the bubbles hang, how big the ring is, how
 * long a turn and the pause between levels last, how many taps open a
 * bubble, and how long it stands after the last level (`gorge.ts`,
 * `docs/spec/bosses-choreographed.md` §3). What each level *is* is content,
 * not config (`GORGE_LEVELS`).
 *
 * Its own file for `config-stare.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.gorgeRow`, and the split is
 * about how much of one file a reader has to hold at once.
 *
 * **Every count here is one the pair says aloud.** The shots each bubble
 * wants and which goes first are on player 1's screen and the colour on
 * player 2's, so the fill is a call per shot.
 *
 * **The turn is the doubled window of the owner's rule of 22 September
 * 2026** (`docs/spec/choreographed-windows.md`): a bubble stays at the bottom
 * of the ring for eight beats, and THE SLOW spans exactly that while it is
 * the one to fill (`gorge-step.ts`).
 */
export interface GorgeConfig {
  /** The row the bubbles hang on, from the top of the field: the middle of it, so the fight is centred. */
  gorgeRow: number;
  /** Rows below `gorgeRow` the bottom of the ring hangs, where the one bubble that can be shot sits. */
  gorgeRingRows: number;
  /** Beats it stands sated between one level and the next. */
  gorgeLevelGapBeats: number;
  /** Beats between two turns of the ring. */
  gorgeTurnBeats: number;
  /** Player 1's taps that open the bubble at the bottom of the ring. */
  gorgeOpenTaps: number;
  /** Beats it stands after the last level, before the wave may end. */
  gorgeOutBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: the bubbles on row five of fifteen, the ring's bottom
 * two rows under it; four beats between levels; a turn every eight beats,
 * three taps to open, and two beats after the last.
 */
export const GORGE_DEFAULTS: GorgeConfig = {
  gorgeRow: 5,
  gorgeRingRows: 2,
  gorgeLevelGapBeats: 4,
  gorgeTurnBeats: 5,
  gorgeOpenTaps: 3,
  gorgeOutBeats: 2,
};
