/**
 * THE TASTER's numbers — how many blades the fan holds, how deep the window it
 * tastes over is and what it shortens to, how long a blade takes to grow, how
 * thick the majority colour can make one, when the fan starts growing three at
 * a time and when it starts re-edging, how many blades are left when it closes
 * over its own body, how many cuts open the crest for good, what each of the
 * three hands on the picture costs, and how long it
 * stands after the beam (`taster.ts`,
 * `docs/spec/bosses-choreographed.md` §4).
 *
 * Its own file for `config-gorge.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.tasterWindowBeats`.
 *
 * **The two windows are the only numbers here the pair ever says out loud**,
 * and they are the fight: thirty beats is long enough that a habit shows in it
 * and short enough that eight beats of the other colour can turn it over, which
 * is the trade the design asks player 1 to call. Twelve is the same sentence
 * with no time to say it in.
 */
export interface TasterConfig {
  /** Blades the fan holds, one per column. Clamped to the field. */
  tasterBlades: number;
  /** Beats of the pair's own spending a blade's colour is read off. */
  tasterWindowBeats: number;
  /** What that window shortens to once the fan is hurrying. */
  tasterFastWindowBeats: number;
  /** Beats a blade grows out of the crest before its colour sets. */
  tasterGrowBeats: number;
  /** Shots of its own colour a blade's edge can be thickened by. */
  tasterThickMax: number;
  /** Blades shorn after which the fan grows several at a time. */
  tasterFanShorn: number;
  /** Blades growing at once from then on. */
  tasterFanBlades: number;
  /** Blades shorn after which the window shortens and the fan re-edges. */
  tasterHurryShorn: number;
  /** Beats between one re-edge of every standing blade and the next. */
  tasterEdgeBeats: number;
  /** Blades left standing when the fan closes over its own body. */
  tasterClosedBlades: number;
  /** Shots into the soft crest that open it for good, and stop the re-edging. */
  tasterCrestCuts: number;
  /** Beats the pilot's thumb may hold a growing blade out of its decision. */
  tasterPinBeats: number;
  /** Thousandths of a tile the navigator carries a thumb across a soft column to cut it. */
  tasterWipeMilli: number;
  /** Thousandths of a tile the pilot carries the interlock to prise it apart. */
  tasterPryMilli: number;
  /** Beats the prised interlock stands open, which is the beam's whole window. */
  tasterPryBeats: number;
  /** Beams in the weak colour the interlock takes inside one pry before it opens. */
  tasterPryFills: number;
  /** Beats the fan stands unlocked after the beam, before the wave may end. */
  tasterOutBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: eleven blades, each grown over four beats in whichever
 * colour the last thirty carried, each struck off by one shot of the colour it
 * is not — two shots if the pair fed it its own colour first. Three blades at a
 * time from the second gap, a twelve-beat window and a re-edge every eight from
 * the sixth, four shots into the gaps to cut the crest and stop that, and at
 * nine gone the last two close over the body for the beam.
 *
 * **The three hands are priced against clocks the pair already has.** Three
 * beats of pin is most of a four-beat growth and never all of it, so a pinned
 * blade still decides and the pilot has bought a conversation rather than a
 * reprieve. The two carries are a tile apart on purpose — a wipe is a thumb
 * skimming an open gap and a pry is a thumb hauling two locked edges off each
 * other — because the hands have to feel different from one another under a
 * thumb that cannot look. And `tasterPryBeats` is twice `lancePrimeBeats`: the
 * interlock stands open six beats, the beam takes three to fill, and the three
 * left over are the pair's whole margin — the margin THE CANDLE's smoke gives,
 * read off the same number (`config-candle.ts`).
 *
 * **Doubled on the owner's rule, 24 September 2026**
 * (`docs/spec/choreographed-windows.md`): the interlock takes
 * `tasterPryFills` beams now, and stands open twelve beats — two fills are
 * six, and the six left over are the same margin twice. THE SLOW that used to
 * mark a blade's colour setting moved to the pry, and spans it exactly
 * (`taster-hand.ts`).
 */
export const TASTER_DEFAULTS: TasterConfig = {
  tasterBlades: 11,
  tasterWindowBeats: 30,
  tasterFastWindowBeats: 12,
  tasterGrowBeats: 4,
  tasterThickMax: 2,
  tasterFanShorn: 2,
  tasterFanBlades: 3,
  tasterHurryShorn: 6,
  tasterEdgeBeats: 8,
  tasterClosedBlades: 2,
  tasterCrestCuts: 4,
  tasterPinBeats: 3,
  tasterWipeMilli: 900,
  tasterPryMilli: 1900,
  tasterPryBeats: 12,
  tasterPryFills: 2,
  tasterOutBeats: 2,
};
