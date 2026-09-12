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
      p2: "Your thumb, on the body, on the beat — you are the only one who can. Every beat that lands grows an arm on it. Take the thumb off on their number: extra is as wrong as missing, and it goes red the moment either happens.",
      scene: "theBeatbox",
    },
    entries: [
      { beat: 0, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 26, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 42, col: 5, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "theWeight",
    name: "THE WEIGHT",
    sentence: "The one where holding it alone looks exactly like holding it together.",
    guide: {
      both: "A heavy sac, coming down a lane a beat. No shot reaches it and the shield goes straight through, so if it lands the wave is lost. It gives to one thing only: a hand from each of you, on the body itself, at the same moment. Press it on your own and it brightens under your thumb — on your screen, and on nothing the other one can see. So a thumb held alone and two thumbs held together look identical from where you are sitting.",
      p1: 'You call it. Pick the beat out loud — "on the three" — and put your thumb down on it. Your thumb is off the strip while it is down, so call one you can afford.',
      p2: "Do not count. Land on the beat they called, not on the one you were about to say, and keep your thumb there until it gives. Yours is the hand that is also the shield, so what they are spending is your dome.",
    },
    entries: [
      { beat: 0, col: 3, kind: "weight", color: null },
      { beat: 14, col: 5, kind: "weight", color: null },
      { beat: 18, col: 2, color: "red" },
      { beat: 30, col: 1, kind: "weight", color: null },
      { beat: 32, col: 6, kind: "weight", color: null },
    ],
  },
];
