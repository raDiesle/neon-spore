/**
 * Whose hand may knock a blister down: player 1, player 2, or either, the
 * first hand to finish its gesture knocking it out (`docs/spec/blister.md`, *BY*).
 */
export type BlisterBy = 1 | 2 | "both";

/**
 * The gesture a blister is knocked down by (`docs/spec/blister.md`, *The
 * gestures*): a tap for each blow, a press kept down a beat for each, a
 * stroke across it the way its arrow points, a full turn round it the way
 * its channel runs, a scrub back and forth over it, a blow a reversal, a
 * COMBO — a press, then a pull in its place, the two a blow — or a LEVER, its
 * knob carried down a groove into a band and held there. One body for all of
 * them — only the help drawn round it says which.
 */
export type BlisterGesture = "tap" | "hold" | "swipe" | "turn" | "rub" | "combo" | "lever";

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
  /** The gesture it is knocked down by; absent a tap. */
  gesture?: BlisterGesture;
  /** Which way a SWIPE or a TURN goes; absent `right` or `cw`, and dropped
   * at the spawn on a gesture it is not a way of. */
  way?: BlisterWay;
}

/**
 * **THE BLISTER's three fields**: whose blow counts, whether it is up, and how
 * long it stays as it is.
 *
 * Its own file for `creature-state-mine.ts`' reason — `creature-state.ts` is
 * at its limit — and along the same seam: none of these is written while a
 * body falls, because a blister never does. `CreatureState extends
 * BlisterState`, so every call site reads `c.blisterUp`.
 */
export interface BlisterState {
  /**
   * The seat whose blow counts, and absent on every other kind. The wave
   * chooses it (`SpawnEntry.by`), as it chooses a mine's seat, and the
   * other seat is the one shown the pore swelling — so turning it over turns
   * the whole exchange round.
   */
  blisterBy?: BlisterBy;
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
   * starts it again; a release loses it (`blister-hold.ts`). A
   * LEVER's hold in its band, the same way (`blister-lever.ts`).
   */
  blisterHeldTicks?: number;
  /** Which way a SWIPE or a TURN counts, absent `right` or `cw`
   * (`blister-swipe.ts`, `blister-turn.ts`). */
  blisterWay?: BlisterWay;
  /**
   * SWIPE's strokes in progress, a bit a seat: 1 and 2 for a stroke open on
   * a body that is up (`blister-swipe.ts`). A LEVER's hands on its knob, the
   * same way (`blister-lever.ts`).
   */
  blisterStrokes?: number;
  /** How far along its way the furthest open stroke has come, in thousandths
   * of a tile and no further than a stroke needs — what the bar fills to. A
   * LEVER's knob, how far down its groove it stands now. */
  blisterAlongMilli?: number;
  /**
   * TURN's hands, a field a seat: absent with no hand on it, `NO_BEARING`
   * for a hand on with no bearing yet, the last bearing it reported in
   * thousandths of a turn (`blister-turn.ts`).
   */
  blisterTurnAt1?: number;
  blisterTurnAt2?: number;
  /** How far round the turn in progress has come, in thousandths of a turn:
   * a whole one is the blow. */
  blisterTurnedMilli?: number;
  /**
   * RUB's hands, a field a seat: absent with no hand on it, the reversal
   * count the hand last sent (`blister-rub.ts`).
   */
  blisterRubAt1?: number;
  blisterRubAt2?: number;
  /**
   * COMBO's press, done: the tap counted and gone, and the pull it brings now
   * the hand it wants. Absent until the press; the pull's blow is the body
   * gone with it (`blister-swipe.ts`).
   */
  blisterPressed?: boolean;
}
