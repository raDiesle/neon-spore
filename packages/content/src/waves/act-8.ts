import { TELL_BEATS, TELL_RUNGS } from "../tell-rungs.js";
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
 * reaches a box. The navigator has the only thumb and is shown a tally of
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
 * The prose about a wave lives **here, above the array**, and not beside the
 * entry it is about: `tools/director/src/serialize.ts` regenerates everything
 * from `export const WAVES_ACT_8` down every time somebody saves a wave in the
 * editor, and a comment inside the array is gone the first time they do.
 */
export const WAVES_ACT_8: Wave[] = [
  {
    id: "theBeatbox",
    name: "THE BEATBOX",
    sentence: "The one where the tap you did not make is the one that counts.",
    guide: {
      both: "A soundbox that swells on every beat and asks for a number of them. Nothing you can fire touches it. It is answered by tapping the body itself, once a beat, on the beat — and the run is finished by stopping: the first beat that goes by untapped is the beat it is judged on. Right and it goes quiet. Wrong and it puts a wave of sound through the hull and keeps coming.",
      p1: "The number is over the box on your screen and on nobody else's. Say it early and say it once — they cannot see it, and by the time they have started tapping it is too late to hear it.",
      p2: "Your thumb, on the body, on the beat — you are the only one who can. Count what they gave you and take the thumb off: extra is as wrong as missing, and the tally under the box is your own taps, never the target.",
    },
    entries: [
      { beat: 0, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 26, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 40, col: 2, color: "red" },
      { beat: 42, col: 5, kind: "beatbox", color: null, beats: 3 },
      { beat: 46, col: 6, color: "cyan" },
    ],
  },
  {
    id: "theTell",
    name: "THE TELL",
    sentence:
      "The one where it shows you what it is about to throw and only one of you can see it.",
    guide: {
      both: "A body at the top of the field, and one throw each exchange. The plate beats a bolt. A bolt beats an open mouth. An open mouth beats the plate — it drinks the charge. The ring is drawn on the boss itself, so it is on the screen the whole time. It draws breath, you throw, and you both open at once. Win five in a row; lose one and you start again.",
      p1: "SHIELD and SUCK are yours: the plate and the mouth are your only throws. The lobe it fills shows on your screen alone — that is what it will throw. Say who is throwing: two thumbs at once and the ship throws nothing.",
      p2: "The bolt is yours and it is your only throw. The colour it wears is on your screen alone; a bolt in that colour lands and the other bounces off. What it will throw, only they can see.",
    },
    entries: [],
    boss: { kind: "tell", rungs: TELL_RUNGS, beats: TELL_BEATS },
    controls: "tell",
  },
];
