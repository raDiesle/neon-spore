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
    id: "theRind",
    name: "THE RIND",
    guide: {
      both: "Three times the size of a normal body. The matching colour only takes one layer off.\nThree sizes, three shots. Its size tells you how many are left.",
      p1: "1. Keep the cannon in its column until it is gone.\n2. The first two shots only make it smaller.\n3. Move off early and you pay for it twice.",
      p2: "1. Fire the same colour three times.\n2. Count the sizes down out loud: three, two, one.\n3. Then you both know which shot is the last.",
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 3, kind: "rind", color: "red" },
      { beat: 8, col: 1, kind: "rind", color: "cyan" },
      { beat: 18, col: 2, kind: "rind", color: "cyan" },
      { beat: 21, col: 5, kind: "rind", color: "red" },
    ],
  },
];
