import type { Wave } from "../wave-types.js";

/**
 * Act nine, opened for THE LEAK — `act-8.ts` had six lines left under the
 * 250-line ceiling, which is less than one wave with its argument written
 * above it (`waves.ts`).
 *
 * **THE LEAK is the sixth fault and the first that takes a *gesture*.** The
 * other five take a control and say so on the panel: a button is drawn dead,
 * or a strip is, and the seat that still has one has to aim the fault
 * somewhere harmless. There is nothing to draw dead here. Both colours answer
 * the thumb, a tap is the bolt it has always been, and every button on both
 * panels works — what is gone is the **hold**. The cannon lobe fills nothing
 * all wave, so no lance ever comes (`sim/lance.ts`, `sim/malfunction.ts`).
 *
 * So the wave is written against the one figure the lance was taught on:
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
 * Nothing is aimed at the fault and nothing can be: it hangs over the field
 * with its beam on both colour lobes for the whole wave, and the only answer
 * to it is the thumb going up and down (`render/fault-beam-ends.ts`).
 */
export const WAVES_ACT_9: Wave[] = [
  {
    id: "theLeak",
    name: "THE LEAK",
    sentence: "The one where the column takes three shots instead of one.",
    guide: {
      both: "Something over the field is holding the cannon lobe open, and its beam is on both colours all wave. Every button still works and every tap still fires. What is gone is the hold: the lobe fills nothing, so there is no beam of your own and a column of three is three shots.",
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
    malfunction: { kind: "leak" },
  },
];
