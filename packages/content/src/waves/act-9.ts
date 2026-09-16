import type { Wave } from "../wave-types.js";

/**
 * Act nine, opened for THE LEAK — `act-8.ts` had six lines left under the
 * 250-line ceiling, which is less than one wave with its argument written
 * above it (`waves.ts`).
 *
 * **THE LEAK was the sixth fault, and on 15 September 2026 the owner made it a
 * rung instead.** The five faults take a control and say so on the panel: a
 * button is drawn dead, or a strip is, and the seat that still has one has to
 * aim the fault somewhere harmless. There is nothing to draw dead here, and
 * nothing to aim. Both colours answer the thumb, a tap is the bolt it has
 * always been, and every button on both panels works — what is gone is the
 * **hold**. So the wave is simply played on the panel whose hold fills
 * nothing, STANDARD 5 (`content/control-sets-table.ts`, `sim/lance.ts`), and
 * nothing hangs over the field.
 *
 * **It is a panel the pair has played on before, and that is the wave.** Every
 * wave between the top of the ladder and THE LANCE is on STANDARD 5 now, so
 * the hold is a thing they were given at wave 31 and have had for nine waves
 * when this one takes it back. The wave is written against the one figure the
 * lance was taught on:
 * **three of a colour standing in one column**. That is one shot and three
 * beats of a still cannon in THE LANCE, and it is three shots here, which is
 * the whole lesson — the pair meets the shape they know and finds out what it
 * costs without the weapon. Quoting the teaching wave is deliberate: a new
 * figure would have made this a wave about a new problem rather than a wave
 * about a missing answer.
 *
 * Four figures, and each one takes the lesson somewhere it hurts more:
 *
 * 1. Beats 0–2, **three cyan in column two** — THE LANCE's own opening column,
 *    to the beat. A pair that reaches for the hold gets nothing at all out of
 *    it, and the bodies go on falling while the thumb waits for a ring that
 *    never closes. The first thing this wave has to teach is that the hold is
 *    not slow, it is *gone*, and it teaches it on the figure where they are
 *    most certain of the answer.
 * 2. Beats 10–12, **three red in column five**, the other half of that same
 *    wave. The second telling, with the cannon having to cross the field to
 *    reach it first: three taps at one end, a slide, three taps at the other,
 *    and the pilot has to say the column early because the navigator's thumb
 *    has nothing to charge while they wait.
 * 3. Beats 20–23, **a column of four that is not one colour** — cyan, cyan,
 *    red, cyan in column one. A lance could never have taken this one whole
 *    anyway, so nothing is being withheld; what it does is put the two seats
 *    back on the colour they were spending the wave not thinking about, at the
 *    moment the tapping is fastest.
 * 4. Beats 30–35, **two columns of three at once**, red in column zero and
 *    cyan in column six, at opposite walls. Six taps and one crossing, and the
 *    pair has to agree *which wall first* — the one question in the wave that
 *    a lance would have made cheap and that six ordinary shots make expensive.
 *
 * Nothing is aimed at anything and nothing can be: the panel is the panel, the
 * only answer is the thumb going up and down, and the wave's guide is what says
 * so. The field is empty of emitters, which is the plainest reading of the
 * lesson — there is no thing to blame, and the pair is not waiting for one to
 * be dealt with.
 *
 * **THE SPLICE is the act's second wave and has nothing to do with the first.**
 * It is here because `act-8.ts` has six lines left and this file had room, and
 * that is the whole of the reason (`waves.ts` says an act is a file, not an
 * argument). What it is, is the thirteenth boss: a row of mouths over the
 * plating, a straw out of each running the height of the field, and a number
 * at the far end of every one. Three rounds, two straws then three then four
 * (`spliceStraws`), and the only thing authored is how long the pair has —
 * sixteen beats, then twenty-four, then thirty-two. That is about six beats a
 * feed throughout, two of which are the number's own travel, so what the count
 * really buys is four beats a straw to trace one and say it. The figures are
 * written here rather than beside the entry because the director rewrites that
 * line whenever anybody saves the wave (`tools/director/src/serialize-boss.ts`)
 * and a comment inside it would not survive.
 *
 * It is played on a panel of its own with **two buttons, one a seat**
 * (`control-sets-table.ts`): the cannon is player 1's and the mouth is player
 * 2's, which is THE CLAW's arrangement reached from the other end. Player 2
 * can read the tangle and cannot see the cannon; player 1 can move the cannon
 * and cannot see past the first hand's width of any straw. So a feed is a
 * sentence each way — *the third mouth from the left*, *I am on it* — and
 * neither seat is sitting with nothing to press.
 */
export const WAVES_ACT_9: Wave[] = [
  {
    id: "theLeak",
    name: "THE LEAK",
    sentence: "The one where the column takes three shots instead of one.",
    guide: {
      both: "You are back on the panel you had before THE LANCE. Every button still works and every tap still fires — what is gone again is the hold: keep a colour down and the lobe fills nothing, so there is no beam of your own and a column of three is three shots.",
      p1: "Nothing is dead on your strip, and standing still buys you nothing this wave — there is no lobe to fill. Call the next column while they are still firing at this one: the crossing is what costs here, not the shots.",
      p2: "Tap. Holding a colour fills nothing and the body is still falling while your thumb is down, so take them one at a time and let go between. Three of a colour is three presses now.",
      scene: "theLeak",
    },
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 1, col: 2, color: "cyan" },
      { beat: 2, col: 2, color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 11, col: 5, color: "red" },
      { beat: 12, col: 5, color: "red" },
      { beat: 20, col: 1, color: "cyan" },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 22, col: 1, color: "red" },
      { beat: 23, col: 1, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 31, col: 0, color: "red" },
      { beat: 32, col: 0, color: "red" },
      { beat: 33, col: 6, color: "cyan" },
      { beat: 34, col: 6, color: "cyan" },
      { beat: 35, col: 6, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSplice",
    name: "THE SPLICE",
    sentence:
      "The one where the number is at the other end of the straw, and only one of you can see it.",
    guide: {
      both: "A row of mouths stands two tiles over the plating, and out of each one a straw runs the whole height of the field, tangled through every other. Each straw has a number at its far end. Feed them in order — one, then two, then three — by standing the cannon under a mouth and opening the maw. The number takes two beats to come down before the ship knows whether it was the one wanted. Get it wrong, or let the round's beats run out, and the hull pays.",
      p1: "The cannon is yours and the mouth is not. Your straws fade out just above the mouths, so where one goes is not yours to know: count the mouths from the left, go where you are sent, and say when you are there.",
      p2: "The mouth is yours and the cannon is not — you cannot see where it is. Trace the straw down from number one, say which mouth it leaves, counting from the left, and open the maw when they say they are under it.",
      scene: "theSplice",
    },
    entries: [],
    boss: { kind: "splice", rounds: [{ beats: 16 }, { beats: 24 }, { beats: 32 }] },
    controls: "splice",
  },
];
