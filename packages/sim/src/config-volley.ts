/**
 * THE VOLLEY's numbers: how many wards it takes, how far each one throws it
 * back up the field and what one is worth (`volley.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-carom.ts` and `config-recoil.ts` already give: every call site still
 * reads `cfg.volleyPlates`, and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **There is no fall in here, and that is the point.** A volley falls a tile a
 * beat because `fallTilesPerBeat` says so for anything it does not name, drops
 * through the same `grippedFallTiles` line in `beat.ts` every other body does,
 * and is clamped onto the ship's row by the same rule that keeps a rock
 * answerable at the plating. It is turned at `shieldRow` by the same branch of
 * `resolveHull` a meteor is turned by. Three numbers here and not six: what is
 * left is only the part a meteor has no answer for, which is what happens
 * *after* the shield says yes.
 *
 * There is deliberately **no damage figure** either. A volley nobody turned
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
   * It is also the readout. There is no health bar — render fills one sector
   * of the ball per one of these still on and leaves the rest as bare skeleton
   * (`render/volley.ts`), so how many are left is a thing both seats read off
   * the body from where they are sitting.
   */
  volleyPlates: number;
  /**
   * Rows a ward throws it back up the field each beat of the climb. Three,
   * which is three times the speed it came down at — a ball hit back leaves
   * faster than it arrived, and the pair has to be able to see that the thing
   * they just answered is *going away* rather than hanging over the dome.
   */
  volleyRiseRows: number;
  /**
   * Beats the climb lasts. Two, so a ward carries it six rows — from the
   * shield's own row to the middle of the field, which is where the shell
   * bursts after the last one. Both halves matter: fewer and a pair would ward
   * it three times without the body ever leaving the bottom of the screen,
   * more and the third ward would put the hatch off the top where nobody sees
   * the one moment this creature exists for.
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
  volleyRiseRows: 3,
  volleyRiseBeats: 2,
  scoreVolleyReturn: 120,
};
