/**
 * THE CURTAIN's numbers — the row the fabric hangs at, how much of it must
 * stay on the field, how often the soft lobes are redrawn and how many, how
 * many lobes off make it light, how often the core fires and how often once
 * it is naked, how long the fabric waits before it rolls back, how long a hit
 * jams the rail and how far the hem is lifted while it is jammed, how many
 * hits end the core, and how long the fight stands after (`curtain.ts`,
 * `docs/spec/bosses-choreographed.md` §6).
 *
 * Its own file for `config-gorge.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.curtainFireBeats`.
 *
 * **Every count here is one the pair says aloud.** Which lobes are soft is
 * on player 1's screen and where the core's shadow stands on player 2's, so
 * a shove is a side and a number said across the table, and the roll-back
 * is the clock that makes them say it before it is stale.
 */
export interface CurtainConfig {
  /** The row the fabric hangs at: where a bolt meets it, and where a rock it fires starts. */
  curtainRow: number;
  /** Columns of fabric that must stay on the field: the rest may hang off either wall. */
  curtainKeepCols: number;
  /** Beats a set of soft lobes stays soft before another set is drawn. */
  curtainSoftBeats: number;
  /** Lobes soft at once — the ones a shot into the hem takes off. */
  curtainSoftCount: number;
  /** Lobes off after which a shove carries the fabric two columns instead of one. */
  curtainLightLobes: number;
  /** Beats between the core's rocks while it is uncovered and the fabric still hangs. */
  curtainFireBeats: number;
  /** Beats between the core's rocks once the fabric is torn off and it hangs naked. */
  curtainNakedFireBeats: number;
  /** Beats with no hand on the fabric before it rolls one column back over the core. */
  curtainRerollBeats: number;
  /** Beats a hit jams the rail: no shove moves the fabric, and the hem is the way through. */
  curtainPinBeats: number;
  /** Thousandths of a tile the hem is carried up before the gap over the core is open. */
  curtainLiftMilli: number;
  /** Hits in its own colour that end the core. */
  curtainCoreHits: number;
  /** Beats the fight stands after the core goes, before the wave may end. */
  curtainOutBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: seven lobes, three soft at a time for twelve beats; the core
 * fires every four beats once it is bare and every second beat once it is
 * naked; four beats of nobody holding the fabric and it rolls a column back;
 * three hits end it. Each hit drops a lobe, so the hem is bare by the third
 * shove cycle at the latest and the last one tears it off.
 *
 * A hit also jams the rail for twelve beats — one shove cycle's worth, so the
 * pair is never waiting on it with nothing to do — and the hem is lifted two
 * tiles and a half in that time, short of a whole column's pull because it
 * is carried against a rail rather than down a column and wants to read as
 * heavier per millimetre, not longer.
 *
 * **Doubled on the owner's rule, 24 September 2026** (`docs/spec/
 * choreographed-windows.md`): both windows twice as long — the soft set and
 * the jam — and the need beside each raised, a third lobe soft at once and
 * the hem carried twice as far, so a longer window is not a step that lands
 * itself. The jam is THE SLOW (`curtain-shot.ts`).
 */
export const CURTAIN_DEFAULTS: CurtainConfig = {
  curtainRow: 1,
  curtainKeepCols: 2,
  curtainSoftBeats: 12,
  curtainSoftCount: 3,
  curtainLightLobes: 4,
  curtainFireBeats: 4,
  curtainNakedFireBeats: 2,
  curtainRerollBeats: 4,
  curtainPinBeats: 12,
  curtainLiftMilli: 2500,
  curtainCoreHits: 3,
  curtainOutBeats: 2,
};
