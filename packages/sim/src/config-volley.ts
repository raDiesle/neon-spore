/**
 * THE VOLLEY's numbers: how steeply it comes in, how far a ward throws it back
 * up the field, how many wards it takes and what one is worth (`volley.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-carom.ts` and `config-recoil.ts` already give: every call site still
 * reads `cfg.volleyRows`, and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **Its own file rather than six more rows in `config-creatures.ts`**, which
 * has been over its limit since THE LID. THE CAROM's row next door draws the
 * line at numbers argued *together*, and these are the same case one creature
 * along: the two strides, the climb and the count of plates are a single
 * decision about how long one arrival keeps the pair talking, and a reader who
 * moves one has to check the rest against that length.
 *
 * There is deliberately **no damage figure here**. A volley nobody turned
 * arrives as the rock it looks like and costs `damageMeteor`, through the same
 * `damageSpan` every other warded body goes through — a number of its own
 * would be the pair learning that leaving one alone is cheaper than the rock
 * they already know to ward, which is the opposite of the lesson.
 */
export interface VolleyConfig {
  /**
   * Plates of shell it arrives wearing, which is how many wards it takes
   * before the body inside is loose. Three, and the number is the creature:
   * one would be a rock, two is a rock said twice, and four is the pair saying
   * the same sentence past the point where saying it again teaches anything.
   *
   * It is also the readout. There is no health bar — render draws one plate
   * per one of these still on (`render/volley.ts`), so how many are left is a
   * thing both seats read off the body from where they are sitting.
   */
  volleyPlates: number;
  /**
   * Rows it drops each beat. Two, which is `meteorMedium`'s speed and
   * `caromRows` exactly, and it is chosen for the length of the whole arrival
   * rather than for how fast the body should look: seven beats to the ship and
   * eight more for every rally after that, which is about twenty seconds of
   * one body. At one it is thirteen beats a leg and the pair is bored by the
   * second ward; at three there is no time to say a column before it lands.
   */
  volleyRows: number;
  /**
   * Columns it crosses when it crosses at all, turning at the side walls the
   * way THE CAROM does. One, and deliberately far short of `caromCols`: a
   * carom is a ball nobody can be under in time, and this one has to be
   * *reachable* — the whole cost of a volley is that the lane the pair agreed
   * on has moved by the time it comes back, not that it was never reachable.
   */
  volleyCols: number;
  /**
   * Beats between one column of drift, read off the shared clock the way
   * `echoFalls` and `wispHops` read theirs. Two, so the body crosses one
   * column for every two it drops and the diagonal is a lean rather than a
   * dive.
   *
   * It was one — a column every beat against two rows — and the owner's
   * report was that it fell far too sideways, which it did: at that rate the
   * lane under it changed on the same beat it reached the ship, so the column
   * the pair had put the shield in was never the column it landed in. Halving
   * the drift is the half of that fix that is about the *picture*;
   * `stepVolley` holding the body still on the ship's own row is the half that
   * is about the ward.
   */
  volleyCrossBeats: number;
  /**
   * Rows a ward throws it back up the field each beat of the climb. The same
   * two it came down at, so the return reads as a bounce rather than as a
   * second creature: what the shield does to this body is turn it, and a thing
   * turned goes back the way it came at the speed it arrived.
   */
  volleyRiseRows: number;
  /**
   * Beats the climb lasts. Four, so a ward carries it eight rows — more than
   * half the height of the field, and the shell comes off at row six of
   * fifteen, which is the middle. Both halves of that matter: less and a pair
   * would ward it three times without the body ever leaving the bottom of the
   * screen, more and the third ward would put the hatch off the top where
   * nobody sees the one moment this creature exists for.
   */
  volleyRiseBeats: number;
  /**
   * What one ward is worth, on top of `scoreDeflect` — which a return pays as
   * well, because it *is* a deflection and the pair has to feel that their
   * half worked. Above an ordinary rock's figure for `scoreCaromCrack`'s
   * reason: this is the harder half of a two-control answer, and it is the
   * half that makes the other one possible.
   */
  scoreVolleyReturn: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const VOLLEY_DEFAULTS: VolleyConfig = {
  volleyPlates: 3,
  volleyRows: 2,
  volleyCols: 1,
  volleyCrossBeats: 2,
  volleyRiseRows: 2,
  volleyRiseBeats: 4,
  scoreVolleyReturn: 120,
};
