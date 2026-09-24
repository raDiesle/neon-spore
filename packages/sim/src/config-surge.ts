/**
 * THE SURGE's numbers — how many notches the seam has, how fast a hand
 * charges the bulb and how fast it leaks, where the notches sit on the
 * gauge and how wide the band round each is, from how many open the bulb
 * holds its charge and feeds on the field, what a burst throws and costs,
 * from how many it spits a rock at the ship and how often, where the bulb
 * hangs, and how long the eversion takes (`surge.ts`,
 * `docs/spec/bosses-choreographed.md` §9).
 *
 * Its own file for `config-sinew.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.surgeBurstMilli`.
 *
 * **Every number here is on one gauge**, and the gauge is read by one seat
 * and marked for the other. THE SINEW asked the pair how hard; this asks
 * them *when to stop* — the charge climbs by itself under two thumbs, and
 * the only gesture that counts is the two thumbs coming off the glass
 * inside the same beat, with the pressure at a notch. So the rates below
 * are chosen so that a band is always at least a beat wide at every rate
 * the bulb charges at: a notch the pressure could step clean over between
 * two beats would be a window nobody could ever lift on.
 */
export interface SurgeConfig {
  /** Notches on the seam. Each vent opens one; all open is the eversion. */
  surgeNotches: number;
  /** Pressure one hand adds per beat, in thousandths of the gauge. Two hands add twice. */
  surgeChargeMilli: number;
  /** Pressure the bulb leaks per beat with no hand on it, before it learns to hold. */
  surgeDecayMilli: number;
  /** The top of the gauge: pressure here or over is a burst, on the beat or on a lift. */
  surgeBurstMilli: number;
  /** Where the first notch sits on the gauge, in thousandths. */
  surgeNotchMilli: number;
  /** How much further up the gauge each notch after the first sits. */
  surgeNotchStepMilli: number;
  /** Half the width of the band round a notch: a lift inside it vents, over it bursts, under it is lost. */
  surgeWindowMilli: number;
  /** Notches open from which the bulb holds its charge with no hand on and feeds on what reaches it. */
  surgeHoldNotches: number;
  /** Notches open from which a hand charges it at double. */
  surgeDoubleNotches: number;
  /** Notches open from which a burst closes one again. */
  surgeCloseNotches: number;
  /** Pressure one body absorbed into the bulb is worth, in thousandths. */
  surgeAbsorbMilli: number;
  /** Gums a burst throws down the bulb's own columns. */
  surgeBurstGums: number;
  /** Beats after a burst in which no hand can take hold: the bulb is re-sealing. */
  surgeBurstBeats: number;
  /** Notches open from which the bulb spits a rock at the ship while both thumbs are on it. */
  surgeRockNotches: number;
  /** Beats between one spat rock and the next. */
  surgeRockBeats: number;
  /** Row the bulb hangs at with the seam shut. A notch open is a row lower. */
  surgeBulbRow: number;
  /** Columns the bulb spans, centred on `midCol`: what it absorbs, and where its gums come from. */
  surgeBulbCols: number;
  /** Beats the pressure's arrival in a notch's band is watched at the slow rate (THE SLOW). */
  surgeNearSlowBeats: number;
  /** Beats the eversion takes once the last notch is open. */
  surgeEvertBeats: number;
  /** Beats the boss stands everted before the wave may end. */
  surgeOutBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: five notches on a gauge of three thousand, the first
 * at 900 and each one 450 higher, with a band 500 wide round each. Two
 * hands charge 200 a beat, 400 from the third notch, and either step is
 * narrower than a band. The last notch's band ends one under the burst,
 * which is the design's *no margin at all*: at the doubled rate it is one
 * beat wide, and the beat after it is the burst. From the second notch open
 * the bulb keeps what it has and eats what reaches it, 450 a body — a whole
 * notch's step — and a burst throws three gums and, from the third notch,
 * closes one. The bulb starts on row 3 and is on row 7 by the last notch.
 *
 * **The rock is the one number here that is not on the gauge.** From the
 * first notch open, six beats of two thumbs on the bulb buys a rock down at
 * the ship, and the only hand that can turn it is the pilot's — which is on
 * the bulb. Six beats because two thumbs climb a band's width in about five:
 * a rock that came faster would be the fight, and one that came slower would
 * never land inside a charge.
 */
export const SURGE_DEFAULTS: SurgeConfig = {
  surgeNotches: 5,
  surgeChargeMilli: 100,
  surgeDecayMilli: 150,
  surgeBurstMilli: 3000,
  surgeNotchMilli: 900,
  surgeNotchStepMilli: 450,
  surgeWindowMilli: 250,
  surgeHoldNotches: 2,
  surgeDoubleNotches: 3,
  surgeCloseNotches: 3,
  surgeAbsorbMilli: 450,
  surgeBurstGums: 3,
  surgeBurstBeats: 2,
  surgeRockNotches: 1,
  surgeRockBeats: 6,
  surgeBulbRow: 3,
  surgeBulbCols: 3,
  surgeNearSlowBeats: 2,
  surgeEvertBeats: 5,
  surgeOutBeats: 2,
};
