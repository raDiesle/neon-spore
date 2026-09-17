/**
 * THE LEAD's numbers — how many segments the stalk has, how far ahead of the
 * body a shot has to be put, how fast it paces in each movement, how long it
 * stands still before the last pass, what it drops behind itself and ahead,
 * and how long the field is watched at a third rate while a shot is judged
 * (`lead.ts`, `docs/spec/bosses-choreographed.md` §11).
 *
 * Its own file for `config-sinew.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.leadFlightBeats`.
 *
 * **Every number here is a term in one sum**, and the sum is the fight: the
 * column the navigator is shown, plus the direction the pilot is shown times
 * the pace times the flight. The paces are whole columns a beat and the
 * flight is whole beats, so the lead is always an integer the pair can say —
 * a boss that paced in thousandths would be one they could only guess at.
 */
export interface LeadConfig {
  /** Segments on the stalk. Each hit takes one; the last is the beam's alone. */
  leadSegments: number;
  /** Beats a shot spends above the top of the field before it is judged against the body. With the climb up the field, which is about a beat at `bulletTilesPerBeat`, the pair's lead is one more than this. */
  leadFlightBeats: number;
  /** Columns a beat while every segment stands: the walk. */
  leadPaceCols: number;
  /** Columns a beat once the stalk is down to `leadFastSegments`: the run. */
  leadFastCols: number;
  /** Columns a beat on the last pass. */
  leadPassCols: number;
  /** Segments left from which it runs rather than walks. */
  leadFastSegments: number;
  /** Segments left from which the stalk leans where it will go *next* beat rather than where it is going. */
  leadForecastSegments: number;
  /** Beats it stands dead still, stalk upright and unhittable, before a pass. */
  leadStillBeats: number;
  /** Every this many beats, running, a torch is dropped in the column it just left. `0` drops none. */
  leadTorchEveryBeats: number;
  /** Every this many beats, running, a rock is dropped in the column a shot would have to be put in. `0` drops none. */
  leadRockEveryBeats: number;
  /** Beats the field runs at a third rate from the beat a shot is judged (THE SLOW). */
  leadSlowBeats: number;
  /** Beats the body stands with its stalk gone before the wave may end. */
  leadOutBeats: number;
}

/**
 * Five segments, and the arithmetic of the design's own steps: at a walk the
 * lead is two, at a run it is four, and on the last pass — three a beat, with
 * the beam standing rather than a shot flying — it is where it will be next
 * beat. The still is four beats, the design's; the torch and the rock are on
 * a cadence rather than one each pace, so the field under a run is a hazard
 * and not a wall.
 */
export const LEAD_DEFAULTS: LeadConfig = {
  leadSegments: 5,
  leadFlightBeats: 1,
  leadPaceCols: 1,
  leadFastCols: 2,
  leadPassCols: 3,
  leadFastSegments: 4,
  leadForecastSegments: 2,
  leadStillBeats: 4,
  leadTorchEveryBeats: 3,
  leadRockEveryBeats: 4,
  leadSlowBeats: 1,
  leadOutBeats: 3,
};
