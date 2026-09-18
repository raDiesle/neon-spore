import type { Wave } from "../wave-types.js";

/**
 * Act ten, opened for THE REPRISE — `act-9.ts` had twenty-odd lines left under
 * the 250-line ceiling, which is less than one wave with its argument written
 * above it (`waves.ts`).
 *
 * **THE REPRISE is the first boss whose whole content is what the pair can no
 * longer see.** The wave falls as its author wrote it, both seats watching;
 * then the stretch that has just come down is sent again from the top with
 * nothing drawn, in the same columns at the same spacing, and the wave's own
 * arrivals stand still until it has finished (`sim/reprise.ts`). Nothing about
 * a body changes: it falls at its own speed, the shield turns it, a bolt of
 * the right colour takes it, and one that reaches the hull costs what any
 * other would. The only thing taken away is the picture.
 *
 * **The stretch is twelve beats, which is what makes it a memory and not a
 * reflex.** A stretch short enough to still be in the eye would be a wave
 * about reaction; twelve beats is about eight seconds at the default tempo,
 * long enough that the pair has to have *said* the columns to still have them.
 *
 * **The split is the wave.** Both screens go blank together, so neither seat
 * can read the answer off the other's — which leaves the record itself to be
 * divided, and the guide divides it: player 2 keeps the columns and player 1
 * keeps the order. Half the sentence each, and neither half is a wave on its
 * own: a column with no beat on it is a dome held in the wrong second, and a
 * count with no column is a cannon fired at nothing.
 *
 * The figures are chosen to be sayable. The first stretch is one at each wall
 * and one in the middle — the shape `THE WELL`'s wave is built on, and the
 * shortest thing two people can agree on out loud. The second is four and
 * crosses over itself, which is the same sentence with one more clause in it
 * than anybody can hold without saying it.
 */
/**
 * **THE FLIP is the second wave in the game whose content is the picture**, and
 * it is the opposite half of THE WELL's idea. There the turned screen is drawn
 * as something else entirely — a clock, with its own hours — and the pair has
 * to learn a second vocabulary. Here it is the same field, the same words and
 * the same columns, and every one of them means another one. A seat that has
 * learnt a clock knows it is reading a clock; a seat looking at a mirror of
 * the field it has played all evening has no way of knowing, which is why the
 * guide says so and the two walls stay lit under it.
 *
 * **It is the pilot's screen that turns**, and that is the whole design. The
 * navigator's job is already talking, and turning their picture would only
 * make the talking harder in a way they can hear themselves doing. The pilot's
 * job is pressing, and every press they make is a column — so the mirror lands
 * on the one seat whose eyes and hands now disagree, and the pair's only way
 * through is the navigator calling columns the pilot can see perfectly well
 * and must not believe (`sim/flip.ts`, `render/field-flip.ts`).
 *
 * **It starts on beat six rather than on beat nought.** Two bodies come down
 * an honest field first, so the pair has the wave's own rhythm before anything
 * is taken; and the body already falling when it turns crosses the screen in
 * one frame, which is a tell nobody has to be told about. The middle column
 * opens the wave and closes it on purpose: it is the one column the mirror
 * leaves where it is, and a pair that notices that has found their landmark.
 */
export const WAVES_ACT_10: Wave[] = [
  {
    id: "theReprise",
    name: "THE REPRISE",
    sentence: "The one where the wave you have just beaten comes back with nothing to see.",
    guide: {
      both: "Everything you clear comes again, unseen. Ward and shoot it from memory, in the same order and columns.",
      p1: "1. Count the things as they come the first time.\n2. Say the gaps out loud: two beats, then three.\n3. When the field goes dark, trigger the plate on your count. The tear at the top counts them down.",
      p2: "1. Say each column while it is still lit, in order.\n2. Say them again the moment the field empties.\n3. Move the plate and fire on those columns, in that order, on your partner's count.",
      scene: "theReprise",
    },
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 3, col: 3, color: "cyan" },
      { beat: 6, col: 5, color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 14, col: 4, color: "red" },
      { beat: 18, col: 0, color: "red" },
      { beat: 21, col: 6, color: "cyan" },
    ],
    boss: { kind: "reprise", beat: 12 },
    bossType: "normal",
  },
  {
    id: "theFlip",
    name: "THE FLIP",
    sentence: "The one where the column you can see is the one it is not in.",
    guide: {
      both: "Six beats in, something over the field takes the pilot's screen and turns it about its middle. From then on their field is a mirror of itself: a body falling down the left wall is really falling down the right one, on the same row, at the same speed, in the same colour, and nothing about it says so. Every button on both panels still works and both strips still slide where they are told — it is the picture that turned, not the ship. The two walls light up on the screen it happened to, and stay lit while it holds.",
      p1: "Your field is backwards and your cannon is not. A body against your left wall is one to shoot against your right — count from the wall it is not near. Only the middle column stayed put. Trust their number, not your eyes.",
      p2: "Yours is the only true picture left, so the columns are all yours. Say every one early, and again while they aim — they can see the body perfectly and cannot believe where it is. Answer a repeated column with a number.",
      scene: "theFlip",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 1, color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 18, col: 6, color: "red" },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 28, col: 4, color: "red" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 36, col: 0, color: "red" },
      { beat: 40, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "flip", seat: 1, at: 6 }],
  },
  {
    id: "theHusk",
    name: "THE HUSK",
    sentence: "The one where taking the pod in is the mistake.",
    guide: {
      both: "Three pods hang over the field and one of them is hollow. It hangs where a pod hangs, it beats like a pod, it says on its face what it is carrying, and it is carrying nothing. It comes loose to a shot like any other and it sinks to the ship like any other. Swallow it and the wave is lost. Let it reach a shut maw and it simply lets go of its air and is gone, and that costs you nothing at all.",
      p1: "Your screen cannot tell you which is which, so do not decide. Open the maw for a pod they have called safe and for no other — a pod nobody named is a pod you let past.",
      p2: "The hollow one is framed on your screen and on nothing of theirs. Name the two that are real, by column, before either is loose; then name the fake and say to leave it. Saying nothing is what loses this wave.",
      scene: "theHusk",
    },
    entries: [
      { beat: 3, col: 0, color: "red" },
      { beat: 9, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 1, row: 3, kind: "ward" },
      { beat: 0, col: 3, row: 4, kind: "purge", husk: true },
      { beat: 6, col: 5, row: 3, kind: "purge" },
    ],
  },
];
