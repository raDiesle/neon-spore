/**
 * THE COIL's numbers: how far it crosses the field each beat, how far it sinks
 * at a wall, how long the charge takes to reach the next one, what opening a
 * dome is worth and what a whole one costs the hull (`coil.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-carom.ts` and `config-recoil.ts` already give: every call site still
 * reads `cfg.coilJumpBeats`, and the split is only about how much of one file
 * a reader has to hold at once.
 *
 * **Its own file rather than five more rows in `config-creatures.ts`**, which
 * has been over its limit since THE LID. The line THE RECOIL's file draws is
 * three numbers that have to be *argued together*, and the first three here
 * are one decision taken three times: the stride, the drop and the flight of
 * the charge together say how long a pair has between the moment they open one
 * dome and the moment the last rock it freed is on the ship. Move any one of
 * them and the other two have to be read again.
 */
export interface CoilConfig {
  /**
   * Columns it crosses each beat. **One**, and this is the one number here
   * that is not a matter of taste.
   *
   * It was two, which read better — the whole field in five beats, far enough
   * that chasing it with the dome was hopeless, so the pair had to agree on a
   * column and stand in it. What that actually bought was a body that could
   * only ever be in *half* the field: a stride of two started at a wall of an
   * eleven-wide field lands on 10, 8, 6, 4, 2, 0 and then turns, so the odd
   * columns are never occupied at all — and the middle column, where the plate
   * rests and where THE TWITCH's fault leaves it, is one of them. The creature
   * was unanswerable from half the lanes, silently, by arithmetic.
   *
   * Every stride above one has that hole somewhere; only one visits every
   * column. So the pace is bought back with `coilDropRows` below rather than
   * here, and what the pair say to each other is the same sentence either way
   * — a column, and then the wait for it to arrive.
   */
  coilCols: number;
  /**
   * Rows it sinks each time it reaches a side wall and turns. Five, so an
   * arrival at the top touches three walls before it is on the ship — about
   * thirty beats, or nineteen seconds at 96 BPM.
   *
   * A big step rather than a drift, and it is the whole of this creature's
   * clock now that the crossing is a lane a beat (`coilCols` above). Two rows
   * a wall at that stride would be seven laps and seventy beats, which is not
   * a body threatening a ship — it is furniture. Five keeps the run down to
   * roughly a wave, and a sink an eye can actually see happen is worth more
   * than a sink it has to infer.
   */
  coilDropRows: number;
  /**
   * Beats the charge is in the air between one dome and the next. Three — 1.9 s
   * at 96 BPM, and the rock freed at the far end of it lands one beat later.
   *
   * So a link of the chain is four beats, or two and a half seconds, which is
   * inside the 2.1–3.6 s a full spoken exchange takes (docs/spec/latency.md)
   * and above the floor a *shorthand* one needs. That is the creature stated
   * as a number: the pair cannot describe the next column, they can only name
   * it — and naming it is exactly what player 1, who is the only seat the bolt
   * is drawn on, has time to do.
   */
  coilJumpBeats: number;
  /**
   * Opening one dome with the ward. `scoreClaspBreak`'s figure exactly, and
   * that is the point rather than a coincidence: it is the same joint moment
   * on the same two controls — player 2's column, player 1's trigger — and it
   * sets up a kill rather than being one. A dome the *chain* opened pays the
   * same, because the pair earned it with the ward that started the chain.
   */
  scoreCoilBreak: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const COIL_DEFAULTS: CoilConfig = {
  coilCols: 1,
  coilDropRows: 5,
  coilJumpBeats: 3,
  scoreCoilBreak: 120,
};
