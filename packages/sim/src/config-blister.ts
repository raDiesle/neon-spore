/**
 * THE BLISTER's numbers: how long it stays up, how many blows it takes and how
 * long one blow is, **gesture by gesture**, how long it is under before it
 * comes up, and the LEVER's groove (`blister.ts`, `blister-numbers.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-crystal.ts`' reason:
 * every call site still reads `cfg.blisterTapUpBeats`, and the split is only
 * about how much of one file a reader has to hold at once. `config-creatures.ts`
 * was at its limit when this creature arrived.
 *
 * **One row a gesture since 16 October 2026.** The owner: *let me able to
 * configure the timings/length/number of action required for each control.*
 * Each is the game's default for that gesture, and a wave may set any of the
 * three on one blister (`BlisterSpawn.upBeats`, `blows`, `lengthMilli`).
 * Read them through `blister-numbers.ts`, never off `cfg` by gesture by hand.
 */
export interface BlisterConfig {
  /**
   * Beats a blister stays up once it has surfaced — the only beats its blows
   * count on, and the whole of the time the pair has: a blister still up when
   * they run out breaks the hull (`stepBlister`). TAP and HOLD six, the rest
   * eight: three and four from the owner on 15 October 2026 (*slightly
   * increase the time players have before lost, especially for tapping*),
   * doubled on 16 October 2026 when the strip and the wall mark stopped
   * announcing it (*increase for all "controls" brushes the time players have
   * to succeed it, at least double*). The five that are not a press stand
   * longer for the stroke or the turn a thumb has to make once it is there.
   */
  blisterTapUpBeats: number;
  blisterHoldUpBeats: number;
  blisterSwipeUpBeats: number;
  blisterTurnUpBeats: number;
  blisterRubUpBeats: number;
  blisterComboUpBeats: number;
  blisterLeverUpBeats: number;
  /**
   * Blows it takes before it is gone, every one inside its up beats: a tap, a
   * hold, a stroke, a turn, a reversal, a press-then-pull, a hold in the band.
   * One each, the owner's *once player executed correct, it should not appear
   * again* (15 October 2026); more is a wave's to ask for.
   */
  blisterTapBlows: number;
  blisterHoldBlows: number;
  blisterSwipeBlows: number;
  blisterTurnBlows: number;
  blisterRubBlows: number;
  blisterComboBlows: number;
  blisterLeverBlows: number;
  /** How long a HOLD's one blow is held, in thousandths of a beat: one beat. */
  blisterHoldMilli: number;
  /**
   * How far a SWIPE has to carry along its way before its lift is a blow, in
   * thousandths of a tile: two tiles — the owner, 15 October 2026, found one
   * too short to read as a pull (*make sure the path length to pull is big
   * enough*). From FIVE BLISTERS' column 2 a stroke left ends on the field's
   * first column.
   */
  blisterSwipeMilli: number;
  /** A COMBO's pull, the same and as long: SWIPE's two tiles. */
  blisterComboMilli: number;
  /** How far round a TURN's one blow goes, in thousandths of a turn: one turn. */
  blisterTurnMilli: number;
  /** How long a LEVER's knob stands in the band for one blow, in thousandths
   * of a beat: one beat, which with the carry fits inside the up beats. */
  blisterLeverHoldMilli: number;
  /**
   * Beats it is under before it surfaces, the last of which is the beat the
   * pore swells on the partner's screen. Two, so there is one beat with
   * nothing to see and one with the bulge — the beat the partner says *now*.
   */
  blisterDownBeats: number;
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
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const BLISTER_DEFAULTS: BlisterConfig = {
  blisterTapUpBeats: 6,
  blisterHoldUpBeats: 6,
  blisterSwipeUpBeats: 8,
  blisterTurnUpBeats: 8,
  blisterRubUpBeats: 8,
  blisterComboUpBeats: 8,
  blisterLeverUpBeats: 8,
  blisterTapBlows: 1,
  blisterHoldBlows: 1,
  blisterSwipeBlows: 1,
  blisterTurnBlows: 1,
  blisterRubBlows: 1,
  blisterComboBlows: 1,
  blisterLeverBlows: 1,
  blisterHoldMilli: 1000,
  blisterSwipeMilli: 2000,
  blisterComboMilli: 2000,
  blisterTurnMilli: 1000,
  blisterLeverHoldMilli: 1000,
  blisterDownBeats: 2,
  blisterLeverMilli: 1500,
  blisterLeverFromMilli: 600,
  blisterLeverToMilli: 1050,
};
