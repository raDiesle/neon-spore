import type { Wave } from "../wave-types.js";

/**
 * Act three: new mechanics after the first five bosses, one more boss among
 * them (`THE VANE`). New waves land here until this file is full in its own
 * turn — `waves.ts` is the barrel that concatenates this with the other acts,
 * see it for why the list was split by act in the first place.
 */
export const WAVES_ACT_3: Wave[] = [
  {
    name: "THE RUNT",
    sentence: "The one where a shot that lands is the mistake.",
    guide: {
      both: "Tiny, and carries no colour at all. A shot that lands on it is the mistake — it costs points, whatever colour was fired.",
      p1: "The column is still yours to hold. Say when it is not worth standing in.",
      p2: "No colour is the right one here. Hold your fire and let it reach the hull instead.",
    },
    entries: [
      { beat: 0, col: 3, kind: "runt", color: null },
      { beat: 1, col: 5, color: "cyan" },
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
      both: "Two columns wide, with a piece of shell in front of each. Any colour chips a piece. Under the last one is a body in a colour neither of you has seen yet.",
      p1: "Two pieces, two columns. Say which one still has armour and stand under it — then say the colour the moment it shows.",
      p2: "Fire anything at all while the shell is on. The moment it cracks open, stop: only one colour lands now, and it is new to you both.",
    },
    entries: [
      { beat: 0, col: 1, kind: "shell", color: null },
      { beat: 4, col: 5, color: "red" },
      { beat: 10, col: 4, kind: "shell", color: null },
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
