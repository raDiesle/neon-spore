import type { Wave } from "../wave-types.js";

/**
 * Act three: new mechanics after the first five bosses, one more boss among
 * them (`THE VANE`). New waves land here until this file is full in its own
 * turn — `waves.ts` is the barrel that concatenates this with the other acts,
 * see it for why the list was split by act in the first place.
 */
/**
 * **THE LURE, in three figures.** Written here rather than beside the entries
 * because the director rewrites the array and keeps only what stands above it
 * (`serialize.ts`) — and this is the half of that wave no test can check. A
 * lure costs nothing if it is ignored, so what has to bite is the
 * *column-seconds*: player 1 standing over a body that will never pay while a
 * real one falls somewhere they are not.
 *
 * 1. Beats 0–3, the shape, cheaply. One lure alone, then a real body of the
 *    other colour across the field. There is time to be told and time to
 *    cross, and the pair learns the sentence they will need.
 * 2. Beats 8–9, the twin. A lure wearing a slick and a real slick two columns
 *    apart, one beat apart, the same red. Nothing but the ring tells them
 *    apart, so player 1 cannot guess and has to be told *which* — the moment
 *    the disguise stops being a trick and becomes the mechanic.
 * 3. Beats 14–20, the squeeze. Three cyan bulbs across the left half, the
 *    middle one a lie, and two reds after them at the far edges. Every beat
 *    spent on the middle one is a beat of the run either side of it, and by
 *    now the field is busy enough that those beats are not spare.
 *
 * A lure entry names its kind and its colour and nothing else: the body it
 * wears follows from the colour, the way every real arrival's does
 * (`queueFromWave`). Not a shortcut — a lure has to be a correct body in a
 * correct colour or it is not wearing anything, and a cyan slick would be the
 * one tell in this wave that nothing else in the game could produce.
 */
/**
 * **THE VEIL, in three figures.** Here for the reason the block above is: the
 * director rewrites the array and keeps only what stands over it, so a note
 * written between two entries is a note that survives until the next time
 * somebody saves a wave in the editor.
 *
 * What has to bite is not the colour — either colour is one tap — but the
 * *staleness* of it. A veil is easy while the pair has nothing else to say and
 * impossible the moment saying it costs a beat they needed elsewhere.
 *
 * 1. Beats 0–4, the sentence. One cloud alone, then a real cyan body across
 *    the field. The whole descent is available, so the pair finds the two
 *    halves of the call — the body and the beats left — with nothing pressing
 *    them; and the second arrival is there so that *which one* is already a
 *    question the first time it is asked.
 * 2. Beats 10–11, the pair. Two clouds four columns apart. They turn over on
 *    the same beat, because the morph is read off the shared clock rather than
 *    a phase of each body's own — so one count serves both, and what player 1
 *    has to say is two colours and one number rather than two of each.
 * 3. Beats 18–24, the squeeze. A third cloud, a rock in the middle of it and a
 *    red body after that. The rock is the point: the shield's column is player
 *    2's hand and the trigger is player 1's, so the two of them are already
 *    talking about something else when a call expires. A rebuff here costs two
 *    seconds of a body that goes on turning over while it is shut.
 *
 * A veil entry names its kind and *no* colour, and that is not the lure's
 * arrangement with a field left out: what is inside a cloud is rolled when it
 * enters the field (`veilOnSpawn`), because the only thing this game leaves
 * random is what one player knows and the other does not.
 */
export const WAVES_ACT_3: Wave[] = [
  {
    name: "THE LURE",
    sentence: "The one where the shot you are waiting for must never come.",
    guide: {
      both: "One of these is not what it looks like. Only one of you can tell.",
      p1: "You will see a body worth shooting and nothing will happen. Believe your partner and move — the column you are standing in is the one you are losing.",
      p2: "The ringed one is a lure. Do not fire at it, and do not wait to be asked — say the column it is in and say the column to go to instead.",
    },
    entries: [
      { beat: 0, col: 2, kind: "lure", color: "cyan" },
      { beat: 3, col: 5, color: "red" },
      { beat: 8, col: 3, kind: "lure", color: "red" },
      { beat: 9, col: 4, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 15, col: 2, kind: "lure", color: "cyan" },
      { beat: 16, col: 4, color: "cyan" },
      { beat: 18, col: 6, color: "red" },
      { beat: 20, col: 1, color: "red" },
    ],
  },
  {
    name: "ON THE BEAT",
    sentence: "The one where firing on sight is the miss.",
    guide: {
      both: "Swells and shrinks on the beat, and carries no colour either. Only a shot on the beat it is open lands at all.",
      p1: "Call the beat it swells on, out loud, the way you call a column.",
      p2: "Fire on the count, not on sight — a shot on the wrong beat does nothing.",
    },
    entries: [{ beat: 0, col: 3, kind: "throb", color: null }],
  },
  {
    name: "THE THIRD SHOT",
    sentence: "The one where the shot that worked twice is the miss.",
    guide: {
      both: "A slick or a bulb in plating a size too big for it, split down the middle: one piece in front of each of its two columns, and its colour showing through the cracks. Any colour chips a piece. Only when both are off does that colour finish it.",
      p1: "Two pieces, two columns. Say which one still has armour and stand under it — the bare half is already the body, and a shot up that column does nothing.",
      p2: "Fire anything at all while a piece is still on. When the last one goes, load the colour you have been able to see the whole way down — and not before.",
    },
    entries: [
      { beat: 0, col: 1, kind: "shell", color: "cyan" },
      { beat: 4, col: 5, color: "red" },
      { beat: 10, col: 4, kind: "shell", color: "red" },
    ],
  },
  {
    name: "THE CLASP",
    sentence: "The one where the shield opens the enemy instead of stopping it.",
    guide: {
      both: "A slick or a bulb inside a shield of its own. Shots bounce off it — the only thing that opens one is the ward, aimed up the field instead of down at the hull. What is left is an ordinary body in the colour you could see the whole time, and it still has to be shot.",
      p1: "Your strip says where they come in. Trigger while the shield is under one and it comes apart. But the shield is in one column at a time and the rocks want it too — say which you are spending it on.",
      p2: "Put the shield in the column your partner names and hold it. Do not fire until the shield is off: a shot at a shut clasp is wasted. The colour shows through, so you can be loaded before it opens.",
    },
    entries: [
      { beat: 0, col: 3, kind: "clasp", color: "cyan" },
      { beat: 6, col: 1, kind: "clasp", color: "red" },
      { beat: 12, col: 5, kind: "clasp", color: "red" },
      { beat: 13, col: 1, kind: "meteor", color: null },
      { beat: 20, col: 2, kind: "clasp", color: "cyan" },
      { beat: 21, col: 6, kind: "meteorMedium", color: null },
      { beat: 28, col: 4, kind: "clasp", color: "cyan" },
      { beat: 28, col: 0, color: "red" },
    ],
  },
  {
    name: "THE DART",
    sentence: "The one where the column you were given is the column it has already left.",
    guide: {
      both: "A dart never falls straight down. Every other beat it takes a diagonal — two rows down and two columns to one side — and in between it hangs for one beat, already aimed.",
      p1: "The column under it is the wrong column. Wait for the side, take two, and be standing there before the beat turns over.",
      p2: "Only your screen carries the arrow over it. Say the side while it is hanging, not while it is moving — by then it is your partner's eyes, not yours.",
    },
    entries: [
      { beat: 0, col: 3, kind: "dart", color: "red" },
      { beat: 8, col: 6, kind: "dart", color: "cyan" },
      { beat: 16, col: 1, kind: "dart", color: "red" },
      { beat: 17, col: 5, kind: "dart", color: "cyan" },
      { beat: 20, col: 3, color: "red" },
      { beat: 26, col: 2, kind: "dart", color: "cyan" },
      { beat: 30, col: 4, color: "cyan" },
    ],
  },
  {
    name: "THE VEIL",
    sentence: "The one where the colour you were given goes stale while you are loading it.",
    guide: {
      both: "A thundercloud, and something is falling inside it. The lightning is on the beat — count it.",
      p1: "You can see into the cloud and your partner cannot. Say the body and say how long: “cyan, two beats”. The ring over it is the clock.",
      p2: "You have a question mark and nothing else, so ask. Fire on what you are told, not on what you last heard — a wrong colour shuts the cloud for two seconds and the answer changes while it is shut.",
    },
    entries: [
      { beat: 0, col: 3, kind: "veil", color: null },
      { beat: 4, col: 6, color: "cyan" },
      { beat: 10, col: 1, kind: "veil", color: null },
      { beat: 11, col: 5, kind: "veil", color: null },
      { beat: 18, col: 2, kind: "veil", color: null },
      { beat: 20, col: 4, kind: "meteor", color: null },
      { beat: 22, col: 6, color: "red" },
      { beat: 24, col: 0, kind: "veil", color: null },
    ],
  },
  {
    name: "THE VANE",
    sentence: "The one where the column you were told is never the column it lands in.",
    guide: {
      both: "An arm sweeping the top of the field. Everything that comes in under it is folded about the column it is standing in — as far the other side of the arm as it came in. The rocks under it fall two rows a beat, not one.",
      p1: "Your strip still says where a rock was aimed. Fold it before you say it, or you have named a column nothing lands in.",
      p2: "Same for what you see coming. Count from the arm, not from the edge — and be in the column early, because there is no time to slide late.",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 3, col: 5, color: "red" },
      { beat: 6, col: 0, kind: "meteor", color: null },
      { beat: 9, col: 4, color: "cyan" },
      { beat: 12, col: 6, kind: "meteor", color: null },
      { beat: 15, col: 2, color: "red" },
      { beat: 18, col: 3, kind: "meteorMedium", color: null },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 24, col: 1, kind: "meteor", color: null },
      { beat: 27, col: 5, color: "red" },
      { beat: 30, col: 0, kind: "meteorMedium", color: null },
      { beat: 33, col: 3, color: "cyan" },
    ],
    boss: { kind: "vane" },
  },
  {
    name: "THE LANCE",
    sentence: "The one where three of the same colour arrive in one column.",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 1, col: 2, color: "red" },
      { beat: 2, col: 2, color: "red" },
    ],
    controls: "lance",
  },
  {
    name: "THE PURGE",
    sentence: "The one where the field is cleared by swallowing, not by shooting.",
    guide: {
      both: "The same pod with different cargo: taking this one in clears the field of everything that is falling.",
      p1: "Hold it for the beat that is about to go wrong, not for the one that already has.",
      p2: "Freeing it is still a shot, and a shot spent here is a creature still coming.",
    },
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 6, color: "red" },
      { beat: 2, col: 2, kind: "meteor", color: null },
      { beat: 3, col: 4, color: "cyan" },
    ],
    pods: [{ beat: 0, col: 3, row: 2, kind: "purge" }],
  },
  {
    name: "THE WARD",
    sentence: "The one where the shield answers four rocks untriggered and the fifth on its own.",
    guide: {
      both: "This pod holds the shield armed for six beats with no trigger at all — and the rocks that come with it are quicker than any you have met: three rows a beat, then four, then five.",
      p1: "Your trigger is free while it lasts, so spend the hand on something else. Call each rock from your strip the moment it appears — by the time it is on the field it is nearly here.",
      p2: "Armed is not aimed: the column is still yours to be standing in. Park the shield where the rock is going, not where it is — one slide, no correction.",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 2, col: 2, kind: "meteorMedium", color: null },
      { beat: 4, col: 5, kind: "meteorFast", color: null },
      { beat: 6, col: 1, kind: "meteorFaster", color: null },
      { beat: 7, col: 6, kind: "meteorFastest", color: null },
    ],
    pods: [{ beat: 0, col: 3, row: 2, kind: "ward" }],
  },
];
