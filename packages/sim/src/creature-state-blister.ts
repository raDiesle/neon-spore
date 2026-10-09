/**
 * Whose hand may knock a blister down: player 1, player 2, or either, whose
 * blows then go on the one count (`docs/spec/blister.md`, *BY*).
 */
export type BlisterBy = 1 | 2 | "both";

/**
 * The gesture a blister is knocked down by (`docs/spec/blister.md`, *The
 * gestures*): a tap for each blow, a press kept down a beat for each, a
 * stroke across it the way its arrow points, or a full turn round it the way
 * its channel runs. One body for all of them — only the help drawn round it
 * says which.
 */
export type BlisterGesture = "tap" | "hold" | "swipe" | "turn";

/** Which way a SWIPE goes, as a screen reads it: `down` is towards the hull. */
export type BlisterSwipeWay = "left" | "right" | "up" | "down";

/** Which way a TURN goes, as a screen reads it: clockwise or anticlockwise. */
export type BlisterTurnWay = "cw" | "ccw";

/** Which way a gesture goes, for the two that go one. */
export type BlisterWay = BlisterSwipeWay | BlisterTurnWay;

/**
 * **What an arrival says about a blister**, absent on every other kind. One
 * shape for the simulation's `SpawnEntry` and content's `WaveEntry`, which
 * both extend it, so a field added for the next gesture is written once.
 */
export interface BlisterSpawn {
  /** Whose hand knocks it down — 1, 2 or both; absent means 2
   * (`blisterOnSpawn`). The wave's, for `sees`' reason: the other seat is the
   * one shown the pore, so this turns the exchange round. */
  by?: BlisterBy;
  /** How many blows it takes, kept across its surfacings; absent means
   * `blisterBlows`, the director's default of three. */
  count?: number;
  /** The gesture it is knocked down by; absent a tap. */
  gesture?: BlisterGesture;
  /** Which way a SWIPE or a TURN goes; absent `right` or `cw`, and dropped
   * at the spawn on a gesture it is not a way of. */
  way?: BlisterWay;
}

/**
 * **THE BLISTER's four fields**: whose blow counts, how many are still owed,
 * whether it is up, and how long it stays where it is.
 *
 * Its own file for `creature-state-mine.ts`' reason — `creature-state.ts` is
 * at its limit — and along the same seam: none of these is written while a
 * body falls, because a blister never does. `CreatureState extends
 * BlisterState`, so every call site reads `c.blisterLeft`.
 */
export interface BlisterState {
  /**
   * The seat whose blow counts, and absent on every other kind. The wave
   * chooses it (`SpawnEntry.by`), as it chooses a mine's seat, and the
   * other seat is the one shown the pore swelling — so turning it over turns
   * the whole exchange round.
   */
  blisterBy?: BlisterBy;
  /**
   * Blows still owed. **Kept across surfacings**, and that is the mole: a tap
   * that lands while it is up is one off, nothing grows back while it is
   * under, and at nought it is gone.
   */
  blisterLeft?: number;
  /** Whether it is up now — the only beats a blow counts on, and the only
   * beats a bolt meets it. */
  blisterUp?: boolean;
  /**
   * Beats left in the phase it is in, up or under. A countdown on the body
   * rather than a beat read off `world.beat`, for `mineFuse`'s reason: two
   * blisters on one field surface on their own clocks.
   */
  blisterClock?: number;
  /** The gesture it wants, absent a tap. The wave's (`SpawnEntry.gesture`). */
  blisterGesture?: BlisterGesture;
  /**
   * HOLD's beat in progress: ticks a hand that counts has been on it since the
   * last blow, every hand on it adding its own. A whole beat is a blow and
   * starts it again; a release or a sink loses it (`blister-hold.ts`).
   */
  blisterHeldTicks?: number;
  /** Which way a SWIPE or a TURN counts, absent `right` or `cw`
   * (`blister-swipe.ts`, `blister-turn.ts`). */
  blisterWay?: BlisterWay;
  /**
   * SWIPE's strokes in progress, a bit a seat: 1 and 2 for a stroke open on
   * a body that is up, 4 and 8 for one the sink voided — the thumb is still
   * down, and its lift counts nothing (`blister-swipe.ts`).
   */
  blisterStrokes?: number;
  /** How far along its way the furthest open stroke has come, in thousandths
   * of a tile and no further than a stroke needs — what the bar fills to. */
  blisterAlongMilli?: number;
  /**
   * TURN's hands, a field a seat: absent with no hand on it, `NO_BEARING`
   * for a hand on with no bearing yet, the last bearing it reported in
   * thousandths of a turn, or `BLISTER_TURN_DEAD` for a hand the sink left
   * on it — whose turning counts nothing until it lifts (`blister-turn.ts`).
   */
  blisterTurnAt1?: number;
  blisterTurnAt2?: number;
  /** How far round the turn in progress has come, in thousandths of a turn:
   * a whole one is a blow, and a sink loses what is short of it. */
  blisterTurnedMilli?: number;
}
