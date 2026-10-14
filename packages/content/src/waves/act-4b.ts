import type { Wave } from "../wave-types.js";

/**
 * The tail of act four, cut off `act-4.ts` at ten lines under the 250-line
 * ceiling rather than at it — `act-3.ts` reached its own limit exactly once
 * and paid two rounds of shaving a sentence out of a comment for the next
 * `scene:` line, which is the cost this queues ahead of instead of after.
 * `act-3b.ts` said why the name is `4b` and not `11`: an act file is a page
 * rather than a chapter, cut where it fills up rather than where the game
 * changes subject, so this one stands between act four and act five in
 * `waves.ts` and nothing about the game moved. `THE RIND` is the last wave
 * act four ever had, and the only one here — a companion file earns its
 * waves one at a time, the same way the one it is cut from filled.
 */
/**
 * **THE RIND, in three figures.** Here for the reason `act-4.ts`' blocks are:
 * the director rewrites the array and keeps only what stands over it.
 *
 * Nothing is hidden in this one either, and what it takes from the pair is not
 * information but a *habit*. Every aim target before it is answered by one
 * call and one shot, so "landed" and "next" have become the same word. A rind
 * is three shots in one column, and the two in the middle are the ones nobody
 * fires unless somebody says so out loud.
 *
 * 1. Beats 0–6, the three shots. One rind on an empty field with the whole
 *    descent available. There is nothing else to shoot, so the pair is free to
 *    find out that the first hit did not kill it — and to watch it step down a
 *    size twice, which is the only read-out this creature has.
 * 2. Beats 8–12, the temptation. A rind, and then two ordinary bodies in other
 *    columns a few beats behind it. The small ones die to one shot each and
 *    look far more urgent; leaving the rind half-shed is how a pair loses the
 *    column they had already paid two shots for. This is the wave.
 * 3. Beats 18–21, the two colours. Two rinds in opposite colours with a rock
 *    between them: player 2 has to reload in the middle of six shots rather
 *    than fire six of one, and the shield's column is their hand while its
 *    trigger is player 1's — so both seats are already saying something else.
 *
 * A rind entry names its kind and its colour, the way an echo does: the
 * silhouette is the slick's or the bulb's, drawn one body's footprint per
 * layer it still wears, and the colour is which trigger answers it — three
 * times over, since a shed needs the same colour a kill does.
 */
export const WAVES_ACT_4B: Wave[] = [
  {
    id: "theEcho",
    name: "THE ECHO",
    guide: {
      scene: "theEcho",
    },
    entries: [
      { beat: 0, col: 5, kind: "echo", color: "cyan" },
      { beat: 12, col: 5, kind: "echo", color: "red" },
      { beat: 13, col: 10, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 20, col: 3, kind: "echo", color: "cyan" },
      { beat: 24, col: 7, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoAgain",
    name: "ECHOES AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "echo", color: "red" },
      { beat: 6, col: 8, kind: "echo", color: "cyan" },
      { beat: 13, col: 4, kind: "echo", color: "red" },
      { beat: 20, col: 8, kind: "echo", color: "red" },
      { beat: 27, col: 7, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoSpread",
    name: "ECHOES SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "echo", color: "red" },
      { beat: 7, col: 9, kind: "echo", color: "red" },
      { beat: 13, col: 3, kind: "echo", color: "red" },
      { beat: 18, col: 1, kind: "echo", color: "cyan" },
      { beat: 24, col: 10, kind: "echo", color: "red" },
      { beat: 30, col: 5, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoReach",
    name: "ECHOES FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "echo", color: "red" },
      { beat: 6, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 11, col: 9, kind: "echo", color: "red" },
      { beat: 16, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 22, col: 1, kind: "echo", color: "cyan" },
      { beat: 28, col: 5, kind: "ghost", color: "cyan" },
    ],
  },
  {
    id: "theEchoPair",
    name: "ECHO AND GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 0, kind: "echo", color: "cyan" },
      { beat: 8, col: 10, color: "red" },
      { beat: 12, col: 2, kind: "ghost", color: "cyan", path: "across" },
      { beat: 18, col: 1, color: "cyan" },
      { beat: 23, col: 3, kind: "dart", color: "red" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 34, col: 7, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoBreathe",
    name: "EASY ECHOES",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 7, col: 8, kind: "echo", color: "red" },
      { beat: 14, col: 10, color: "cyan" },
      { beat: 20, col: 3, kind: "echo", color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 35, col: 0, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoRecall",
    name: "ECHO RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 1, kind: "echo", color: "cyan" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 18, col: 9, kind: "throb", color: "red" },
      { beat: 24, col: 0, color: "red" },
      { beat: 29, col: 1, kind: "echo", color: "red" },
      { beat: 35, col: 3, color: "cyan" },
      { beat: 40, col: 5, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theEchoBend",
    name: "ECHOES AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 6, kind: "echo", color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 6, kind: "ghost", color: "cyan" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 30, col: 0, kind: "echo", color: "cyan" },
      { beat: 35, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 47, col: 6, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoPeak",
    name: "ECHO PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 1, kind: "echo", color: "cyan" },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 1, kind: "ghost", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 20, col: 8, kind: "meteorMedium", color: null },
      { beat: 24, col: 0, kind: "echo", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 5, kind: "ghost", color: "cyan" },
      { beat: 36, col: 8, kind: "meteorMedium", color: null },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 44, col: 10, kind: "echo", color: "red" },
      { beat: 48, col: 7, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
];
