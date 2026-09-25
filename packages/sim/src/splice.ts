import { hullRow, type SimConfig } from "./config.js";

/**
 * THE SPLICE: a children's path puzzle, played by two people who can each see
 * half of it.
 *
 * Two tiles above the shield a row of **straw entrances** stands — the open
 * bottom ends of hollow straws. Every straw runs up the whole field, tangled
 * across the others, and its top end carries a **number**. The numbers say the
 * order: the ship must suck the entrances 1, 2, 3 … in turn, and a suck is the
 * shipped SUCK — the cannon slid under an entrance and the maw opened
 * (`pods.ts`). Nothing new is on either panel.
 *
 * **The split is the whole round, and it crosses.** The navigator sees the
 * tangle and the numbers at the top, is shown no cannon at all, and holds
 * **the only SUCK**; the pilot sees the entrances near the ship, each straw
 * fading out two tiles up, and holds the cannon and nothing else. So every feed
 * is two calls — *the third from the left*, *I am on it* — and neither seat can
 * make one alone. Asked for by the owner on 15 September 2026, with the split,
 * the beat count and the cost of a wrong feed decided the same day.
 *
 * **This paragraph had the two panels the wrong way round** — the navigator
 * with no SUCK and the pilot holding the maw — from the day it was written
 * until 19 September 2026. The panel is `content/src/control-sets-table.ts` and
 * has always been `["cannon", "mawTake"]`: `mawTake` is player 2's lobe, and
 * `applyCommand` seat-checks nothing, so the code was never wrong and the file
 * a reader opens first was. It cost nothing until a lane came to put the
 * fight's one word on a screen, which is a decision made entirely out of who
 * can press and who is shown what (`render/boss-cue-read-d.ts`).
 *
 * **The first round has two straws and every later one adds a straw**
 * (`spliceStraws`), so how long the fight is and how hard it gets are the
 * number of rounds, and the only thing an author writes per round is how many
 * beats the pair has.
 *
 * **What is authored and what is drawn.** The tangle is laid from the seeded
 * `Rng` and kept as integers (`splice-tangle.ts`), so both devices draw the
 * same straws without a word crossing the wire about it; the picture is
 * `render/splice-*.ts` and derives every curve from those integers. Nothing
 * here is a pixel and nothing there is a rule.
 *
 * This file is the shape and nothing else. The clock, the suck and what a feed
 * costs are `splice-round.ts`; the tangle is `splice-tangle.ts`; the three
 * numbers the fight is tuned by are in `config-boss.ts` beside every other
 * boss's (`spliceEntranceRows`, `spliceTopRow`, `spliceFeedBeats`) — this line
 * named a config-splice.ts that has never existed.
 */

/**
 * One round of the fight, and the only thing about it an author writes.
 *
 * There is no placement to author — the straws are laid by the rng and their
 * count follows from the round — so what is left is the one figure that is a
 * decision: how long the pair has. That is the shape PINBALL's `beats` has
 * next to a board it does not have, arrived at from the other end.
 */
export interface SpliceRound {
  /** Beats one attempt at the round lasts. Running out sends the eater, which costs the hull. */
  beats: number;
}

/**
 * The row the entrances stand on — the one row of this fight that is a place
 * on the field rather than a place in the tangle.
 *
 * Named here rather than worked out at each of its four call sites: the sim
 * aims the hull damage at it, the events carry it so a burst lands on the
 * mouth that was sucked, and render/ draws the mouths and the stub of straw
 * over each of them there. Four copies of one subtraction is three chances for
 * the picture and the rule to disagree about where the maw is.
 */
export function spliceEntranceRow(cfg: SimConfig): number {
  return hullRow(cfg) - cfg.spliceEntranceRows;
}

/** Straws in the first round. Two, so the first call the pair makes is a real one. */
export const SPLICE_FIRST_STRAWS = 2;

/** How many straws a round of this index stands. One more every round. */
export function spliceStraws(round: number): number {
  return SPLICE_FIRST_STRAWS + Math.max(0, round);
}

/** Everything the fight remembers between beats. A `BossState` like the others. */
export interface SpliceState {
  kind: "splice";
  /** The authored rounds, in order. Copied in, so content is never written to. */
  rounds: SpliceRound[];
  /** Which of them is being played. */
  round: number;
  /** `world.beat` this attempt at the round began on — the clock it is judged against. */
  roundBeat: number;
  /** The columns the entrances stand in, left to right. One per straw. */
  entranceCols: number[];
  /** The columns the numbered top ends stand in, left to right. */
  topCols: number[];
  /**
   * The column each straw is dragged through halfway up.
   *
   * It is what makes the picture a tangle rather than a fan: without it a
   * straw is a straight line from its entrance to its top end, and a pair
   * could read the whole puzzle off the two rows without following anything.
   */
  midCols: number[];
  /**
   * Which top end each entrance's straw reaches — **the tangle, and the whole
   * puzzle**. `topOf[e]` is an index into `topCols`, and the number printed
   * there is that index plus one.
   *
   * Stored as the permutation rather than as a list of crossings: a crossing
   * is a fact about the picture and this is the fact about the fight.
   */
  topOf: number[];
  /** How many numbers have been fed. The next one wanted is `fed + 1`. */
  fed: number;
  /**
   * The entrance whose number is travelling down its straw, or -1 while none
   * is. A feed is judged when it **arrives**, not when it is sucked, so the
   * pair watches the answer come down the field — and a second suck while one
   * is in flight is a maw that is already busy.
   */
  feedFrom: number;
  /** The beat that number left its top end. */
  feedBeat: number;
  /**
   * The beat the round's clock ran out and **the eater** took the number
   * wanted next, or -1 while it has not.
   *
   * The clock is a creature rather than a readout: something crawling along
   * the top of the field toward the next number for as long as the round
   * lasts, which is why the time running out is a thing the navigator can
   * see coming rather than a count. When the beats are spent it swallows that
   * number and comes down on the ship with it; the hull breaks when it lands,
   * `spliceEatBeats` later (`splice-round.ts`), and until then the maw is
   * shut — the round is already lost and nothing may be fed into it.
   */
  eatBeat: number;
  /** The column the eater comes down on — the cannon's, on the beat it bit. */
  eatCol: number;
  /** `world.beat` the round was cleared on, -1 until it is. */
  passBeat: number;
  /** The last verdict: 1 right, -1 wrong, 0 none yet. render only. */
  verdict: -1 | 0 | 1;
  /** The beat it landed on, -1 before the first. render only. */
  verdictBeat: number;
  /** The entrance it landed at, -1 before the first. render only. */
  verdictStraw: number;
}

/** The round being played. Clamped, so a state read past the last one still answers. */
export function spliceCurrent(s: SpliceState): SpliceRound {
  const round = s.rounds[Math.min(s.round, s.rounds.length - 1)];
  if (!round) throw new Error("a splice with no rounds left to play");
  return round;
}

/** The number printed at the top of the straw that starts at this entrance. */
export function spliceNumberAt(s: SpliceState, entrance: number): number {
  return (s.topOf[entrance] ?? -1) + 1;
}

/**
 * The entrance the pair has to suck next, or -1 when the round is already fed.
 *
 * The one place that turns "how many are fed" into "which one now": the pilot's
 * screen, the navigator's, the verdict and every test read it from here rather
 * than each searching `topOf` for `fed` themselves.
 */
export function spliceWanted(s: SpliceState): number {
  return s.topOf.indexOf(s.fed);
}
