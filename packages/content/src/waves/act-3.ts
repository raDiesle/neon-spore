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
    hint: "Small and colourless — leave it alone. A real target is coming too; say which column is which.",
    entries: [
      { beat: 0, col: 3, kind: "runt", color: null },
      { beat: 1, col: 5, color: "cyan" },
    ],
  },
  {
    name: "ON THE BEAT",
    sentence: "The one where firing on sight is the miss.",
    hint: "It swells and shrinks on the beat. Wait for it — a shot on the wrong one does nothing at all.",
    entries: [{ beat: 0, col: 3, kind: "throb", color: null }],
  },
  {
    name: "THE THIRD SHOT",
    sentence: "The one where the shot that worked twice is the miss.",
    hint: "Any colour chips a piece off, and there are two of them, one per column. Under the last piece is a colour neither of you has seen — say it before you fire.",
    entries: [
      { beat: 0, col: 1, kind: "shell", color: null },
      { beat: 4, col: 5, color: "red" },
      { beat: 10, col: 4, kind: "shell", color: null },
    ],
  },
  {
    name: "THE VANE",
    sentence: "The one where the column you were told is never the column it lands in.",
    hint: "The arm folds every arrival about the column it is standing in. Count from the arm, not from the edge.",
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
    hint: "P1 holds the lance with the cannon still. P2 must not fire until the lobe is full.",
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
    hint: "Free the pod and take it in — everything still falling goes with it.",
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
    hint: "Take the pod in first — six beats armed, then it is only the column. The slow one lands after it runs out.",
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
