/**
 * THE CAROM's numbers: how steeply it crosses the field, what cracking one
 * open is worth, what a whole one costs the hull when it lands, and how the
 * body thrown clear of it climbs and comes down (`carom.ts`, `chute.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-ghost.ts` and `config-recoil.ts` already give: every call site still
 * reads `cfg.caromCols`, and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **Its own file rather than four more rows in `config-creatures.ts`**, which
 * has been over its limit since THE LID. THE RECOIL's row next door draws the
 * line at three numbers argued *together*, and these four are the same case
 * one number wider: the two strides and the drop are a single decision about
 * how many walls one arrival touches before it reaches the ship, and a reader
 * who moves one has to check all three against that count. The damage is the
 * fourth because it is the only thing that follows from the creature being a
 * rock rather than a body, and it is argued against `damageMeteor` rather than
 * against anything left next door.
 *
 * The two chute numbers are here rather than in a file of their own because a
 * chute is not a creature a wave has: it is the second half of this one, and
 * how long it hangs over the field is argued against how long the crust took
 * to get there. Splitting them would put one arrival's timing in two places.
 */
export interface CaromConfig {
  /**
   * Columns it crosses each beat. Three.
   *
   * It was four while the drop was two rows, and both came down together the
   * first time the owner played it: a body four lanes and two rows a beat is
   * one nobody can be under. A bolt takes the better part of a beat to cross
   * the field, so the cannon has to be *led* — and at four lanes the lead was
   * most of the field, which is not a call two people can make to each other,
   * it is a guess.
   *
   * Three is still further than a cannon slides comfortably in one beat, so
   * the column player 2 says is still where the body is *going* rather than
   * where it is — which is the sentence this creature exists to demand — and
   * it is now a lead a pair can actually say out loud.
   */
  caromCols: number;
  /**
   * Rows it drops each beat. One, the same fall a slick takes, so the whole
   * crossing is fourteen beats — 8.75 seconds at 96 BPM.
   *
   * It was two, which gave seven beats and 4.4 seconds: over the four-second
   * floor a spoken exchange needs (docs/spec/latency.md) and nowhere near
   * enough for *this* exchange, which is a lead and a colour and then a second
   * control after the shot lands. The four-second floor is what one sentence
   * costs; this creature asks for three.
   *
   * At one row a beat the count of walls it touches goes up rather than down —
   * fourteen beats at three columns is four crossings of a nine-wide field —
   * so slowing it made the thing more of a ball, not less.
   */
  caromRows: number;
  /**
   * Rows the body thrown clear of a cracked carom climbs each beat, until it
   * reaches the top of the field and its canopy opens (`chute.ts`).
   *
   * Four, which is faster than anything in this game falls except a torch, and
   * it is meant to be: what the picture has to say is *thrown*, not *drifting
   * upward*. From the deepest row a carom is ever cracked in that is four
   * beats to the top, and from the rows a pair usually takes one it is two —
   * short enough that the climb reads as one event rather than a journey.
   */
  chuteRiseRows: number;
  /**
   * Beats between one row and the next on the way back down. Two, so it comes
   * down at half the speed of a slick — THE ECHO's rate exactly, and the same
   * mechanism: the simulation stores integers, so half a tile a beat is a beat
   * it simply does not move on rather than a fraction it carries.
   *
   * Twenty-eight beats from the top of the field to the ship, which is a long
   * time to leave something hanging and is meant to be. It is the whole
   * bargain of the creature: the pair got the rock off it early, and what they
   * bought with that shot is a body they can take at their leisure — provided
   * they remember it is up there.
   */
  chuteFallBeats: number;
  /**
   * What cracking the crust open is worth. Above `scoreDestroy`, and it is the
   * only kill in the game that is priced above an ordinary body: the shot that
   * lands here is the harder half of a two-control answer, and it is the shot
   * that *makes the other half possible*. The deflection that follows pays
   * `scoreDeflect` on its own, so a carom taken properly is worth both — which
   * is the arithmetic saying what the creature is.
   */
  scoreCaromCrack: number;
  /**
   * What a whole one costs the hull when it reaches the ship. `damageMeteor`'s
   * figure exactly, and that is the point rather than a coincidence: a carom
   * nobody cracked arrives as the rock it always was, and it has to cost what
   * a rock costs — otherwise the pair learns that leaving one alone is cheaper
   * than the rock they already know to ward, which is the opposite of the
   * lesson. It is deliberately not answerable by the shield: nothing turns
   * this body away until the cannon has made it a rock the shield can see.
   */
  damageCarom: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CAROM_DEFAULTS: CaromConfig = {
  caromCols: 3,
  caromRows: 1,
  chuteRiseRows: 4,
  chuteFallBeats: 2,
  scoreCaromCrack: 200,
  damageCarom: 20,
};
