/**
 * THE LEAD's numbers — how many segments the stalk has, how far ahead of the
 * body a shot has to be put, how fast it paces in each movement, how long it
 * stands still before the last pass, what it drops behind itself and ahead,
 * and how many beams the last movement takes (`lead.ts`,
 * `docs/spec/bosses-choreographed.md` §11).
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
  /** Beats a thumb may keep the stalk standing before it tears out from under her and passes anyway. */
  leadHoldBeats: number;
  /** Beams the last movement takes: every one short of this stops the body dead where it met the pass, a whole new still. */
  leadStillFills: number;
  /** Every this many beats, running, a torch is dropped in the column it just left. `0` drops none. */
  leadTorchEveryBeats: number;
  /** Every this many beats, running, a rock is dropped in the column a shot would have to be put in. `0` drops none. */
  leadRockEveryBeats: number;
  /** Beats the body stands with its stalk gone before the wave may end. */
  leadOutBeats: number;
}

/**
 * Five segments, and the arithmetic of the design's own steps: at a walk the
 * lead is two, at a run it is four, and on the last pass — three a beat, with
 * the beam standing rather than a shot flying — it is where it will be next
 * beat. The torch and the rock are on a cadence rather than one each pace,
 * so the field under a run is a hazard and not a wall.
 *
 * The hold is **twice the still**, and that is the whole of its arithmetic:
 * a pair who spent the still saying the column have no room left to fill in,
 * and twice gives them exactly one more run at it and no third — long enough
 * to be a second chance, short enough that holding on is never the answer.
 *
 * **Doubled on the owner's rule, 24 September 2026**
 * (`docs/spec/choreographed-windows.md`): the still was the design's four
 * beats and is eight, the hold follows it to sixteen, and the last movement
 * takes two beams where it took one. THE SLOW is the ask — the still and the
 * pass after it — rather than the beat a shot is judged.
 */
export const LEAD_DEFAULTS: LeadConfig = {
  leadSegments: 5,
  leadFlightBeats: 1,
  leadPaceCols: 1,
  leadFastCols: 2,
  leadPassCols: 3,
  leadFastSegments: 4,
  leadForecastSegments: 2,
  leadStillBeats: 8,
  leadHoldBeats: 16,
  leadStillFills: 2,
  leadTorchEveryBeats: 3,
  leadRockEveryBeats: 4,
  leadOutBeats: 3,
};
