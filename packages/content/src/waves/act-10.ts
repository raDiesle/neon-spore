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
export const WAVES_ACT_10: Wave[] = [
  {
    id: "theReprise",
    name: "THE REPRISE",
    sentence: "The one where the wave you have just beaten comes back with nothing to see.",
    guide: {
      both: "This wave comes down twice. Every stretch of it you get through is sent again from the top — the same bodies, the same columns, the same spacing — and on the second run neither of your screens draws a thing. It is all still there. It still falls at the same speed, the dome still turns it, a bolt of the right colour still takes it, and one that reaches the ship costs you exactly what it would have the first time. While it is running, nothing new arrives: the wave takes up again where it left off once the last of it has gone by.",
      p1: "Keep the order. Count them as they come, and say the gaps out loud — two beats, then three. When the field goes dark that count is the only clock either of you has.",
      p2: "Keep the columns. Say them while they are still lit, in order, and say them again the moment the field empties — a column you did not say out loud is a column neither of you has.",
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
  },
];
