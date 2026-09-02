/**
 * What one *creature* costs and how long its own clock runs: the lure's price
 * and the row it leaves on, the throb's cycle, the shell's chipping, the
 * clasp's break, the veil's morph and its armour,
 * and the wisp's dwell.
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
  /**
   * Beats THE WISP stands on one tile before it is somewhere else.
   *
   * Beats and not milliseconds, for `veilMorphBeats`' reason and rather more
   * of it: the seat that has to answer a wisp cannot see one, so the count is
   * the only thing either of them shares about it. Two is what the owner
   * asked for — 1.25 s at 96 BPM, which is *under* the 2.1–3.6 s a full
   * spoken exchange takes (docs/spec/latency.md), and deliberately so: the
   * pair is not meant to complete a sentence per tile. What they are meant to
   * build is the shorthand two letters and a number make possible, and a
   * dwell long enough for a whole sentence would never force one.
   */
  wispDwellBeats: number;
  /** What a wisp is worth. The highest single body in the game: it is only
   * ever killed by a call that crossed the room and landed inside a beat and
   * a quarter. */
  scoreWispKill: number;
  /**
   * What a ghost is worth. The veil's figure exactly, and that is the point
   * rather than a coincidence: both are a body the pair can only reach by
   * saying one thing out loud in time, and a pair that learned one of them
   * priced above the other would be learning that one sentence is worth more
   * than the other. The sentence is the same size — a colour and a number.
   */
  scoreGhostKill: number;
  /**
   * The row a crossing ghost prowls along. Three: far enough down that it is
   * drawn at a size player 2 can actually read a column off, far enough up
   * that the dive at the end of its temper is a fall the pair watches rather
   * than an arrival.
   */
  ghostCrossRow: number;
  /**
   * Columns a crossing ghost takes each beat.
   *
   * Two, and the number is set by the *length of the crossing* rather than by
   * how fast the body should look. The field is thirteen columns wide, so at
   * one a crossing is twelve beats and three of them are twenty-two seconds —
   * a whole wave spent on one arrival. At two it is six beats out and one
   * standing at the wall, which is about a spoken exchange, and three of them
   * fit inside a wave that has other things in it.
   *
   * It also makes the call expire properly: two lanes a beat is more than a
   * cannon slides comfortably in one, so the column player 2 says has to be
   * where it is *going*, which is the sentence this path exists to demand.
   */
  ghostCrossCols: number;
  /**
   * Walls a crossing ghost turns at before it gives up and dives. Three,
   * because it is a number the pair counts out loud while doing something
   * else, and two is over before the counting has started.
   */
  ghostChargeLaps: number;
  /** Tiles a charging ghost falls each beat. `meteorFast`'s three: fast enough
   * to read as a decision and slow enough to still be shot on the way down. */
  ghostDiveTiles: number;
  /**
   * What a charging ghost costs the hull. Above `damageCreature` and below
   * `damageMeteor`: it is the one arrival that *aimed* at the ship, so it is
   * worse than a body that merely arrived — and it was answerable for three
   * whole crossings, which a rock never is.
   */
  damageGhostDive: number;
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
  wispDwellBeats: 2,
  scoreWispKill: 300,
  scoreGhostKill: 250,
  ghostCrossRow: 3,
  ghostCrossCols: 2,
  ghostChargeLaps: 3,
  ghostDiveTiles: 3,
  damageGhostDive: 18,
};
