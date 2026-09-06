/**
 * THE CLAW's numbers — the wreck field, the clock, and what a bad grab costs
 * (`claw.ts`, `docs/spec/bosses.md` 11.9).
 *
 * Its own file for the reason `config-gauge.ts` and `config-fleet.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.clawCells`, and the split is about how much of one file a reader
 * has to hold at once. A round is a subject of its own.
 *
 * Everything here is beats or whole cells. Nothing is in milliseconds and
 * nothing is a fraction: the rail is a row of sockets, and a place two people
 * are talking each other onto has to be the same whole socket on both phones.
 */
export interface ClawConfig {
  /**
   * How many sockets the wreck field is, end to end.
   *
   * Nine, and it is not `cfg.cols` on purpose. The field's eleven columns come
   * with a vocabulary — a column is a thing this game has taught a pair to
   * count and to name — and this round is the one that takes the naming away.
   * A rail as wide as the field would invite the pair to reach for the wave's
   * own words on a screen where nothing is labelled.
   */
  clawCells: number;
  /** Pods buried in it. Raising every one of them is the round. */
  clawPods: number;
  /**
   * Rocks buried beside them. A grab that comes up holding one costs the hull,
   * so this is the whole of the risk in a sentence said too early.
   */
  clawRocks: number;
  /** Beats the pair has to clear the pods in. Running out costs `damageClaw`. */
  clawRoundBeats: number;
  /**
   * Beats between two grabs, landed or not — the claw going down and coming
   * back up. A thumb held on the button is slower than a pair who talk, which
   * is THE GAUGE's call rule and THE FLEET's salvo rule one round further on.
   */
  clawGrabRestBeats: number;
  /**
   * Beats between one wreck shifting a socket and the next one doing it.
   *
   * **This is the round.** A field that held still would let the navigator say
   * one sentence and then watch; a field that shifts under her makes every
   * sentence a correction of the last one, which is what "left — no, one more
   * left" actually is. It is also the whole difference between this round and
   * THE FLEET, whose chart never moves and whose squares have names.
   */
  clawDriftBeats: number;
  /**
   * What running out of time takes off the hull, in whole points.
   *
   * Named for the `damage*` family rather than the `claw*` one, because that
   * is the question a reader is asking when they find it: everything else in
   * this file is the machine, and this is the line that can end a run.
   */
  damageClaw: number;
  /** And what one rock raised takes off it. A wrong grab has to hurt. */
  damageClawRock: number;
  /** Score for a pod raised. */
  scoreClawPod: number;
  /** Score for the grab that empties the field of pods. */
  scoreClawClear: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Nine sockets holding four pods and three rocks leaves two of them empty, and
 * the two are load-bearing: a wreck can only shift into a socket that is free,
 * so a field packed solid would never move and the round would be THE FLEET
 * with the letters filed off.
 *
 * `clawRoundBeats` at 140 is about eighty-seven seconds at 96 BPM — the ninety
 * the category is written against (`docs/spec/interludes.md`). Four pods at
 * three beats of rest apiece is twelve beats of the clock spent on grabs that
 * all landed, so the rest of it is the talking, which is the point.
 */
export const CLAW_DEFAULTS: ClawConfig = {
  clawCells: 9,
  clawPods: 4,
  clawRocks: 3,
  clawRoundBeats: 140,
  clawGrabRestBeats: 3,
  // Six beats is 3.75 seconds at 96 BPM, and it is set against how long a
  // sentence takes: a spoken exchange in this game runs 2.1-3.6 s
  // (`docs/spec/latency.md`), so the field moves about once per exchange —
  // often enough that a direction goes stale while it is being said, rarely
  // enough that saying one is still worth doing.
  clawDriftBeats: 6,
  // Two rocks' worth, the same figure THE GAUGE's and THE FLEET's failures
  // cost, and for the same reason: it has to hurt enough that the pair play
  // the round, and the number itself is the owner's to turn once they have
  // lost one.
  damageClaw: 20,
  // A third of that. A rock is a mistake inside the round rather than the
  // round lost, and three of them buried in the field means a pair who grab on
  // every guess can spend more than the clock ever would.
  damageClawRock: 7,
  scoreClawPod: 300,
  scoreClawClear: 1200,
};
