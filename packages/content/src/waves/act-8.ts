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
 * **THE HANDOVER** is the fifth wave here and the fifth fault, and the first of
 * them that ends before the wave does (`sim/handover.ts`). Nine beats in, the two
 * panels change screens: the pilot's phone comes up as the navigator's and the
 * navigator's as the pilot's, in the other seat's colours, with the other seat's
 * hidden reads on it. Eight beats later they come home. Nothing is taken away and
 * nothing is added — what moves is whose screen each control is on, which is the
 * fault `ideas.md` called Handover and left unbuilt over one question: whether
 * the radar travels with the controls. It does. It is the same screen.
 *
 * The arrivals are authored around that window rather than through it. Two bodies
 * and a rock go in before the trade, so the pair has its own hands on something
 * first and something to lose; the rock is timed to *land* inside the window, and
 * a rock is the one answer in this game that needs both seats at once — the plate
 * in the column and the dome up on the beat — so it is asked of two people each
 * holding the other's half of it. Two more arrive inside the window with a colour
 * to get right, and the last two after it, because a pair whose hands have just
 * been given back has to find them again.
 *
 * **Its bodies are answered by the band and never by a hand on the glass**, and
 * that is the mechanic putting a constraint on the wave rather than a preference.
 * A grip, a balloon's two pulls and a tap on a box are attributed by the
 * simulation to the player who *sent* them, and the wire's two identities do not
 * trade — only the panel does (`render/handover.ts`). So this is slicks, bulbs
 * and a rock; a crawler or a cairn on it would be a hand the screen says is the
 * other seat's and the ship says is yours.
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
      both: "A soundbox swells each beat and wants a number of taps. No shot touches it. Tap it once a beat, then stop. Wrong, it hits the hull.",
      p1: "1. Only you see the number over the box.\n2. Say it early and say it once.\n3. Once your partner starts tapping, it is too late to hear it.",
      p2: "1. Only you can tap the body, once a beat, on the beat.\n2. Each tap grows an arm on it.\n3. Stop on your partner's number. Extra is as wrong as missing.",
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
      both: "A heavy sac falls a row a beat. No shot or shield stops it. Both of you press it on the same beat. One thumb alone looks the same.",
      p1: "1. You call it. Say the beat out loud: on the three.\n2. Put your thumb on the body on that beat.\n3. Your thumb is off the strip while it is down. Call one you can afford.",
      p2: "1. Do not count. Press on the beat your partner calls.\n2. Hold your thumb there until it gives.\n3. While your thumb is down, the shield waits. Your partner spends your dome.",
      scene: "theWeight",
    },
    entries: [
      { beat: 0, col: 3, kind: "weight", color: null },
      { beat: 14, col: 5, kind: "weight", color: null },
      { beat: 18, col: 2, color: "red" },
      { beat: 30, col: 1, kind: "weight", color: null },
      { beat: 32, col: 6, kind: "weight", color: null },
    ],
  },
  {
    id: "theCairn",
    name: "THE CAIRN",
    sentence: "The one where the rock you did not pull is the one that lands.",
    guide: {
      both: "Take the pile apart by hand. Put the shield under every rock that comes away. Leave it eight beats and it drops one itself. Only Player 1 sees where.",
      p1: "1. Only you see the column it drops into by itself. Say it.\n2. It changes every time a rock leaves.\n3. Eight beats of patience, and every pull resets it.\n4. Trigger the shield under every rock.",
      p2: "1. Say how many you can be under, and which side to pull.\n2. A pulled rock lands in twelve beats. Put the shield under it.\n3. The pile's own rock falls eight beats later. Your colours are dead.",
      scene: "theCairn",
    },
    entries: [],
    boss: { kind: "cairn" },
    bossType: "normal",
  },
  {
    id: "theCodex",
    name: "THE CODEX",
    sentence: "The one where the button you pressed is not the shot you fired.",
    guide: {
      both: "Every four beats, something swaps what the two colours kill. Red kills what cyan should, and cyan what red should. The shot looks and sounds the same.",
      p1: "1. Only you see it. The air moves in slow bands while the colours swap.\n2. Say which it is, and again every time it turns.",
      p2: "1. Both your buttons work and one of them lies.\n2. Fire the colour your partner says, not the body's colour.\n3. A body that refuses a shot means the key turned as you pressed.",
    },
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 4, color: "cyan" },
      { beat: 14, col: 1, color: "red" },
      { beat: 16, col: 5, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 26, col: 0, color: "red" },
      { beat: 34, col: 6, color: "cyan" },
      { beat: 36, col: 2, color: "cyan" },
    ],
    faults: [{ kind: "codex" }],
  },
  {
    id: "theWell",
    name: "THE WELL",
    sentence: "The one where the column beside it is the other end of the field.",
    guide: {
      both: "One field, a clock on one screen and rows on the other. Columns are hours, and the cannon is the hand. Only Player 2 sees the warning strip.",
      p1: "1. Your clock has no warning marks. Every arrival shows on your partner's strip alone.\n2. Near the rim, four beats cover a third of a tile. The last beat, as much again.\n3. Eleven and one are your rail's two ends.",
      p2: "1. Only you see the strip. Say what comes, and its column, early.\n2. Your partner hears a number as an hour.\n3. Your rows sit evenly. Theirs crowd at the rim, so say how soon.\n4. Your shield is dead this wave.",
      scene: "theWell",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 4, color: "cyan" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 26, col: 6, color: "red" },
      { beat: 38, col: 6, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 58, col: 3, color: "cyan" },
    ],
    boss: { kind: "well" },
    bossType: "special",
  },
  {
    id: "theHandover",
    name: "THE HANDOVER",
    sentence: "The one where your thumb lands on their button.",
    guide: {
      both: "Nine beats in, your panels swap screens. Every button works, but none is the one you know. The band counts down to it, then eight beats back.",
      p1: "1. Before the swap, the cannon and the trigger are yours.\n2. After it, you hold the shield and the two colours.\n3. Say where the cannon was going while the strip is still yours.",
      p2: "1. Before the swap, the shield and the two colours are yours.\n2. After it, you hold the cannon and the trigger.\n3. You have never fired the dome. Let your partner call the beat and the column.",
      scene: "theHandover",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 2, col: 5, kind: "meteor", color: null },
      { beat: 6, col: 1, color: "cyan" },
      { beat: 10, col: 4, color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 18, col: 6, color: "red" },
      { beat: 24, col: 0, color: "cyan" },
    ],
    faults: [{ kind: "handover", at: 9, beats: 8 }],
  },
];
