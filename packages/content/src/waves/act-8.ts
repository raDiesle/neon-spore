import type { Wave } from "../wave-types.js";

/**
 * Act eight, opened for THE BEATBOX rather than for a chapter — the rule
 * `waves.ts` states about this directory: a file is cut when the newest one
 * reaches the 250-line ceiling, and `act-7b.ts` had a page and a half of room
 * left, which is less than one wave with its argument written above it.
 *
 * **THE BEATBOX** is the first body in this game answered by *when* a finger
 * lands rather than by what is under it. A soundbox comes down swelling on
 * every beat and carrying a number; player 2 taps the body itself, once a
 * beat, on the beat, that many times, and then **takes the thumb away**,
 * because stopping is how a run is committed. The number is drawn on player
 * 1's screen and on nobody else's.
 *
 * So the sentence names the mistake rather than the creature, as every
 * introduction in this game has to: *the one where the tap you did not make is
 * the one that counts*. That is exactly the error the field punishes here and
 * nowhere else. Everywhere else in this game a press that never happened costs
 * nothing — a trigger unpressed is a rock unwarded, a shot unfired is a body
 * still falling, and in both cases the thing is still there to be answered. On
 * a box the *absence* of the fourth tap is what decides whether the third one
 * was a kill or a wave of sound through the hull, and a pair who have spent
 * seven acts learning that more pressing is better will over-run their first
 * three boxes.
 *
 * The split is the plainest in the game after THE GHOST's column, and it is
 * the crossing rule rather than an exception to it: the count is on the
 * **pilot's** strip and on the pilot's body, and the pilot has no thumb that
 * reaches a box. The navigator has the only thumb and is shown a frame with
 * their own taps and nothing else — so they can always see how far into a run
 * they are and never where it has to stop. One digit, said once, early.
 *
 * The wave is four figures and it is built to spend that digit four ways:
 *
 * 1. Beat 0, one box asking for **two**, alone on the field. The shortest run
 *    there is, with nothing else to look at, so the pair meets the whole
 *    mechanic once — a number said, a thumb counted out, a thumb lifted — with
 *    no second thing to be wrong about.
 * 2. Beat 12, one asking for **four**, still alone. The same sentence with the
 *    number changed, which is the one thing that has to be *heard* rather than
 *    guessed: a pair who took the first box on reflex will play this one as
 *    another two and hear what a miscount costs.
 * 3. Beats 24 and 26, **two at once, asking for different counts**. Now the
 *    pilot has two digits to say and the navigator has two runs to hold apart,
 *    and the runs overlap — which is the first moment the pair has to name
 *    *which box* as well as how many, and the columns are two apart so a lane
 *    is the shortest way to do it.
 * 4. Beats 40–46, a box between two ordinary bodies. The thumb that taps is
 *    the same thumb that swipes the muzzle, so this is where the navigator
 *    finds out that answering a slick costs a beat of the run — and a run
 *    interrupted is not paused, it is committed. The box asks for three, which
 *    is exactly long enough that the shot has to go before it or after it.
 *
 * It is played on the ordinary panel: a box demands no control group of its
 * own (a thumb on the field is not one, which is `creatures-table.ts`'s
 * argument about THE MAGNET's hand and THE CHOIR's shake said a third time),
 * and the bodies beside it want the cannon.
 *
 * **THE WEIGHT** is the second wave here, and it is a lesson in three steps
 * about one sentence: *a thumb held alone and two thumbs held together look the
 * same from where you are sitting.*
 *
 * 1. Beat 0, one sac in the middle of the field, and nothing else on it. The
 *    pair will press it separately first — both of them will see their own
 *    thumb brighten it and believe it is working — and it will land. That is
 *    the wave teaching itself, and it costs a retry rather than a paragraph.
 * 2. Beats 14 and 18, a sac and an ordinary slick four beats behind it. The
 *    hand that presses is a hand off a control, so this is where the pair finds
 *    out what the press is spent out of: the pilot's strip and the navigator's
 *    dome, both, at once.
 * 3. Beats 30 and 32, **two sacs at opposite ends**, two beats apart. Now the
 *    count is not enough — "on the three" answers *when* and says nothing about
 *    *which*, and the two are five lanes apart so a column is the shortest way
 *    to say it. It is THE BALLOON's question arriving from the other side, and
 *    a pair who has met one already has the words for it.
 *
 * It is played on the ordinary panel: a hand on the field is not a
 * `ControlGroup` (`creatures-handed.ts`), and the slick in the middle step
 * wants the cannon.
 *
 * **THE CODEX** is the third, and the first fault in the game the seat it acts
 * on cannot see. Ordinary bodies and nothing else — eight slicks and bulbs, no
 * rock, no special kind — because the wave is about *which button*, and any body
 * with an answer of its own would give the pair something else to talk about.
 *
 * The arrivals are in pairs and the pairs straddle the turn: the key holds for
 * four beats, so a pair arriving on 14 and 16 is one body under one reading and
 * the next under the other. Beats 24 and 26 are two *different* colours across a
 * turn, which is where a pair who learned "always press the other one" finds out
 * that the fault is not a relabelling — it is a thing that keeps changing, and
 * the only reading that counts is the one that was true when the thumb went
 * down.
 *
 * It opens **swapped** (`codexSwapped`), so the very first shot of the wave is
 * the one that lies. That is the owner's kind of opening rather than an accident:
 * a wave that opened clear would let the pair fire a whole bar of ordinary shots
 * and meet the swap with a body halfway down the field.
 *
 * THE WELL and THE HANDOVER, the last two, are `act-8b.ts`'s, with their
 * argument.
 *
 * The prose about a wave lives **here, above the array**, and not beside the
 * entry it is about: `tools/director/src/serialize.ts` regenerates everything
 * from `export const WAVES_ACT_8` down every time somebody saves a wave in the
 * editor, and a comment inside the array is gone the first time they do.
 */
export const WAVES_ACT_8: Wave[] = [
  {
    id: "theHive",
    name: "THE HIVE",
    guide: {
      scene: "theHive",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
  {
    id: "theChoke",
    name: "THE CHOKE",
    guide: {
      scene: "theChoke",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 8, color: "cyan" },
      { beat: 8, col: 3, color: "red" },
      { beat: 14, col: 2, color: "cyan" },
      { beat: 20, col: 10, color: "red" },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 42, col: 10, color: "red" },
      { beat: 44, col: 0, color: "cyan" },
      { beat: 48, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeAgain",
    name: "CHOKE AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "coil", color: null },
      { beat: 6, col: 4, kind: "magnet", color: "red" },
      { beat: 14, col: 2, kind: "coil", color: null },
      { beat: 21, col: 4, kind: "magnet", color: "cyan" },
      { beat: 28, col: 8, kind: "coil", color: null },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeSpread",
    name: "CHOKE WIDE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "coil", color: null },
      { beat: 7, col: 6, kind: "magnet", color: "red" },
      { beat: 13, col: 1, kind: "clasp", color: "cyan" },
      { beat: 19, col: 6, kind: "coil", color: null },
      { beat: 24, col: 5, kind: "magnet", color: "cyan" },
      { beat: 31, col: 4, kind: "clasp", color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeReach",
    name: "CHOKE AT THE EDGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "coil", color: null },
      { beat: 5, col: 2, kind: "magnet", color: "cyan" },
      { beat: 11, col: 8, kind: "dart", color: "cyan" },
      { beat: 17, col: 2, kind: "coil", color: null },
      { beat: 23, col: 8, kind: "magnet", color: "red" },
      { beat: 28, col: 1, kind: "dart", color: "red" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokePair",
    name: "CHOKE IN PAIRS",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 5, kind: "coil", color: null },
      { beat: 11, col: 2, color: "red" },
      { beat: 17, col: 8, kind: "magnet", color: "cyan" },
      { beat: 21, col: 1, color: "red" },
      { beat: 21, col: 9, color: "red" },
      { beat: 27, col: 7, kind: "throb", color: "red" },
      { beat: 31, col: 9, kind: "coil", color: null },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeBreathe",
    name: "CHOKE AT EASE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 9, kind: "coil", color: null },
      { beat: 13, col: 0, color: "red" },
      { beat: 20, col: 10, kind: "magnet", color: "red" },
      { beat: 26, col: 2, color: "red" },
      { beat: 33, col: 7, kind: "torch", color: null },
      { beat: 40, col: 6, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 5, kind: "coil", color: null },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 17, col: 9, kind: "lid", color: "red" },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 28, col: 3, kind: "coil", color: null },
      { beat: 34, col: 6, kind: "lid", color: "red" },
      { beat: 39, col: 4, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
];
