/**
 * THE BLISTER's numbers: how long it stays up, how long it is under before it
 * comes up, and the reach of the gestures that go somewhere (`blister.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-crystal.ts`' reason:
 * every call site still reads `cfg.blisterUpBeats`, and the split is only about
 * how much of one file a reader has to hold at once. `config-creatures.ts` was
 * at its limit when this creature arrived.
 */
export interface BlisterConfig {
  /**
   * Beats a TAP or a HOLD blister stays up once it has surfaced — the only
   * beats its one blow counts on, and the whole of the time the pair has: a
   * blister still up when they run out breaks the hull (`stepBlister`). Three,
   * the owner, 15 October 2026 (*slightly increase the time players have
   * before lost, especially for tapping*): two left a hand told *now* and
   * then *where* no time to arrive.
   */
  blisterUpBeats: number;
  /**
   * The same for every gesture that takes longer than a press — SWIPE, TURN,
   * RUB, COMBO and LEVER: four, a beat more than a tap, for the stroke or the
   * turn the thumb has to make once it is there.
   */
  blisterUpBeatsLong: number;
  /**
   * Beats it is under before it surfaces, the last of which is the beat the
   * pore swells on the partner's screen. Two, so there is one beat with
   * nothing to see and one with the bulge — the beat the partner says *now*.
   */
  blisterDownBeats: number;
  /**
   * How far a SWIPE has to carry along its way before its lift is a blow, in
   * thousandths of a tile: two tiles — the owner, 15 October 2026, found one
   * too short to read as a pull (*make sure the path length to pull is big
   * enough*). Still a stroke a thumb lands inside the four beats it is up, and
   * from FIVE BLISTERS' column 2 a stroke left ends on the field's first column.
   */
  blisterSwipeMilli: number;
  /**
   * A LEVER's groove, down from the body's centre, in thousandths of a tile:
   * a tile and a half, so the band can stand clear of the body below it
   * (`blister-lever.ts`).
   */
  blisterLeverMilli: number;
  /**
   * The band on that groove the knob is held in, in thousandths of a tile
   * down it: THE LEVER LAB's IN A BAND, four to seven tenths of the reach.
   */
  blisterLeverFromMilli: number;
  blisterLeverToMilli: number;
  /** Beats the knob has to stand in the band for a blow: one, which with the
   * carry fits inside the four beats it is up. */
  blisterLeverBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const BLISTER_DEFAULTS: BlisterConfig = {
  blisterUpBeats: 3,
  blisterUpBeatsLong: 4,
  blisterDownBeats: 2,
  blisterSwipeMilli: 2000,
  blisterLeverMilli: 1500,
  blisterLeverFromMilli: 600,
  blisterLeverToMilli: 1050,
  blisterLeverBeats: 1,
};
