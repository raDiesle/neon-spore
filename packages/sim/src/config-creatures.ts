/**
 * What one *creature* costs and how long its own clock runs: the lure's price
 * and the row it leaves on, the throb's cycle, the shell's chipping, the
 * clasp's break, the veil's morph and its armour.
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-shot.ts` and `config-boss.ts` already give: every call site still
 * reads `cfg.throbPeriodBeats`, and the split is only about how much of one
 * file a reader has to hold at once. The immediate reason is the same one
 * those two record — `config.ts` went over its size limit the day THE VEIL
 * added three fields. The better reason is that these eleven were already
 * sitting in a row and are argued about one creature at a time, while
 * everything left next door is argued about for the whole game: the beat, the
 * hull, the shield, the pod, the field.
 *
 * A creature added to the bestiary that wants a number of its own adds it
 * here, not there.
 */
export interface CreatureConfig {
  /** What a shot at a lure costs the hull. Not the score: two currencies for
   * one mistake reads as bookkeeping, and the hull is the one the pair feels.
   * Above `damageCreature` on purpose — a body that reached the hull cost a
   * shot nobody fired, and this cost one that was. */
  damageLure: number;
  /** Rows above the hull a lure stands on before it goes (`lureVanishRow`).
   * Two: close enough that player 1's eye is already on it, far enough that it
   * plainly never threatened the ship. */
  lureVanishRows: number;
  /** Score for hitting a Throb while it is open. */
  scoreThrobHit: number;
  /** What one piece of THE SHELL is worth. Smaller than a kill: chipping the
   * armour is work either colour can do, and the kill is still to come. */
  scoreShellPiece: number;
  /** Beats in one Throb swell-shrink cycle — `throbIsOpen`'s whole state
   * machine is `beat % throbPeriodBeats` against `throbOpenBeats`. */
  throbPeriodBeats: number;
  /** Beats out of every cycle a Throb can be hit at all. */
  throbOpenBeats: number;
  /**
   * Opening a clasp with the ward. Between `scoreDestroy` and `scoreDeflect`:
   * the same joint shape as a deflection, but it only sets the kill up.
   */
  scoreClaspBreak: number;
  /**
   * Beats the broken shield goes on flying apart for. Render-only — the sim
   * opens a clasp on the instant of the trigger — but a `SimConfig` field
   * because it is counted in beats, and the beat is the sim's.
   */
  claspBreakBeats: number;
  /**
   * Beats between one turn of THE VEIL's body and the next — a slick becomes a
   * bulb, and a bulb a slick. Five is 3.1 s at 96 BPM, which is one spoken
   * exchange (docs/spec/latency.md): long enough that a call arrives before it
   * expires, short enough that it does expire.
   *
   * Beats and not milliseconds, unlike `veilArmourMs` below, and the asymmetry
   * is the point. The morph is something the pair *counts* — player 1 reads
   * beats off the timer over the cloud and says them out loud — so it has to
   * land on the shared clock. The armour is a window nobody counts.
   */
  veilMorphBeats: number;
  /**
   * How long a wrong colour keeps THE VEIL shut, in milliseconds. The sibling
   * of `guardWindowMs`: a duration nobody counts out loud, so it is measured
   * in the unit a person would use to describe it. Two seconds is long enough
   * to cost the pair a morph boundary and short enough not to read as a body
   * that simply cannot be killed.
   */
  veilArmourMs: number;
  /** What a veil is worth. Above `scoreThrobHit`: the timing is only half of
   * it, and the other half is a sentence that had to be said in time. */
  scoreVeilKill: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CREATURE_DEFAULTS: CreatureConfig = {
  damageLure: 15,
  lureVanishRows: 2,
  scoreThrobHit: 200,
  scoreShellPiece: 120,
  throbPeriodBeats: 4,
  throbOpenBeats: 1,
  scoreClaspBreak: 120,
  claspBreakBeats: 2,
  veilMorphBeats: 5,
  veilArmourMs: 2000,
  scoreVeilKill: 250,
};
