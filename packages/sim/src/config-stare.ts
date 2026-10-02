/**
 * THE STARE's numbers — the lead-in, how many turns a level lasts, how long
 * the charge gives the lashes, and the climb and the end (`stare.ts`,
 * `docs/spec/bosses.md`).
 *
 * Its own file for the reason `config-claw.ts` and `config-scout.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.stareTurns`.
 *
 * The rhythm itself is not here. It is authored, one pattern a level, on the
 * wave (`StareEntry.levels`), because the owner asked for levels a pair learns
 * — and a pattern is a thing you learn, where a number is a thing you tune.
 */
export interface StareConfig {
  /**
   * Beats of shut, harmless eye before a pattern begins — at the top of the
   * fight, between a vent and the next turn, and after the eye rises to a new
   * level. 2 is one breath: *here it comes*.
   */
  stareRestBeats: number;
  /**
   * Turns — a live pass and its charge — a level lasts before the eye rises
   * to the next. The owner, 2 October 2026: *eye rotates 5 times before it
   * goes to next level*.
   */
  stareTurns: number;
  /**
   * Beats every charge runs before the beam falls, under THE SLOW, before
   * `stareLashBeatsMilli` adds the lashes' share.
   */
  stareChargeBeats: number;
  /**
   * Thousandths of a beat the charge gains for every lash it asks for,
   * rounded up: 300 is five beats for the first level's four lashes and
   * thirteen for the last level's thirty-two — a lash about every half
   * second for each of two thumbs, under THE SLOW.
   */
  stareLashBeatsMilli: number;
  /**
   * Lashes the first level's charge asks for; each level after asks twice as
   * many. The owner, 2 October 2026: *first level 4 and every level more
   * doubling it.*
   */
  stareLashesFirst: number;
  /**
   * How far up a thumb has to come to pull one lash, in thousandths of a
   * tile. 350 is a flick: short enough to pull lash after lash in a charge.
   */
  stareLashPullMilli: number;
  /** Beats the eye takes to rise to its next level, angrier, before the lead-in. */
  stareRiseBeats: number;
  /** Beats the last level's eye takes to close for good, before the wave is won. */
  stareCalmBeats: number;
}

/**
 * What the game ships with. The first charge was sized against the latency
 * page's spoken exchange (2.1–3.6 s): five beats is 3.1 s at 96 bpm before
 * THE SLOW stretches it, so a pair that says *pull* on the first beat has the
 * four lashes up with room to spare.
 */
export const STARE_DEFAULTS: StareConfig = {
  stareRestBeats: 2,
  stareTurns: 5,
  stareChargeBeats: 3,
  stareLashBeatsMilli: 300,
  stareLashesFirst: 4,
  stareLashPullMilli: 350,
  stareRiseBeats: 3,
  stareCalmBeats: 4,
};
