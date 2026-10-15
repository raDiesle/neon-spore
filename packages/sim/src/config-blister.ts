/**
 * THE BLISTER's numbers: how long it stays up, how long it is under, how much
 * nearer each surfacing comes, and how many blows it takes when a wave leaves
 * the count out (`blister.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-crystal.ts`' reason:
 * every call site still reads `cfg.blisterUpBeats`, and the split is only about
 * how much of one file a reader has to hold at once. `config-creatures.ts` was
 * at its limit when this creature arrived.
 */
export interface BlisterConfig {
  /**
   * Beats a blister stays up once it has surfaced — the only beats a blow
   * counts on. Two in the draft (`docs/spec/blister.md`): one is too short for
   * a hand that was told *now* to arrive, and three lets the hand that waited
   * to see it arrive in time, which is the mistake the creature exists for.
   */
  blisterUpBeats: number;
  /**
   * Beats it is under between two surfacings, the last of which is the beat
   * the pore swells on the partner's screen. Two, so there is one beat with
   * nothing to see and one with the bulge — the beat the partner says *now*.
   */
  blisterDownBeats: number;
  /**
   * Rows lower each surfacing is than the last. Three in the draft: from the
   * top of the band that is four surfacings before the hull row, a little under
   * ten seconds at the shipped tempo, which keeps the four seconds a spoken
   * answer needs on every one of them.
   */
  blisterSinkRows: number;
  /**
   * Blows it takes when the wave named no `count` — the director's own default
   * for the setting (`docs/spec/blister.md`, *The director's settings*).
   */
  blisterBlows: number;
  /**
   * How far a SWIPE has to carry along its way before its lift is a blow, in
   * thousandths of a tile: two tiles — the owner, 15 October 2026, found one
   * too short to read as a pull (*make sure the path length to pull is big
   * enough*). Still a stroke a thumb lands inside the two beats it is up, and
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
   * carry fits inside the two beats it is up. */
  blisterLeverBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const BLISTER_DEFAULTS: BlisterConfig = {
  blisterUpBeats: 2,
  blisterDownBeats: 2,
  blisterSinkRows: 3,
  blisterBlows: 3,
  blisterSwipeMilli: 2000,
  blisterLeverMilli: 1500,
  blisterLeverFromMilli: 600,
  blisterLeverToMilli: 1050,
  blisterLeverBeats: 1,
};
