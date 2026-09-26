import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * **THE INSTAR's first act**: the steps the script had before the second and
 * third acts were laid in among them, each named for its pose and its turn
 * (`instar-script.ts`, whose preamble tells what each asks and why). Cut out
 * of that file on 26 September 2026 when the third act took it past its line
 * limit.
 */

/** The brood: player 1 taps the left nest flat, player 2 swipes the right one's eggs off. */
export const INSTAR_BROOD: BossSequenceStep = {
  pose: "brood",
  arrive: "passes",
  morphBeats: 12,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "eggs", gesture: "tap", xMilli: 320, yMilli: 380, need: 16 },
    { seat: "p2", part: "eggs", gesture: "swipeDown", xMilli: 660, yMilli: 360, need: 10 },
  ],
};

/** The lash: the fork sweeping leftward along the hull, a blade each, tapped back. */
export const INSTAR_LASH: BossSequenceStep = {
  pose: "lash",
  arrive: "cross",
  morphBeats: 7,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    {
      seat: "p1",
      part: "tail",
      gesture: "tap",
      xMilli: 380,
      yMilli: 560,
      need: 20,
      sweepMilli: -110,
    },
    {
      seat: "p2",
      part: "tail",
      gesture: "tap",
      xMilli: 620,
      yMilli: 560,
      need: 20,
      sweepMilli: -110,
    },
  ],
};

/** The lunge: the head driven down at the ship, both seats holding the brow off. */
export const INSTAR_LUNGE: BossSequenceStep = {
  pose: "lunge",
  arrive: "approach",
  morphBeats: 6,
  windowBeats: 5,
  landBeats: 3,
  marks: [{ seat: "both", part: "head", gesture: "hold", xMilli: 500, yMilli: 300, need: 3 }],
};

/** The breath, turned round: the jaws pushed shut with the seats swapped. */
export const INSTAR_BREATH_TURNED: BossSequenceStep = {
  pose: "breath",
  arrive: "cross",
  morphBeats: 6,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "jaw", gesture: "pullDown", xMilli: 440, yMilli: 220, need: 4000 },
    { seat: "p2", part: "jaw", gesture: "pullUp", xMilli: 560, yMilli: 500, need: 4000 },
  ],
};

/** The coil: the tail wound up high, each blade wound the other way. */
export const INSTAR_COIL: BossSequenceStep = {
  pose: "coil",
  arrive: "passes",
  morphBeats: 10,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "tail", gesture: "turnBack", xMilli: 380, yMilli: 330, need: 2000 },
    { seat: "p2", part: "tail", gesture: "turn", xMilli: 620, yMilli: 330, need: 2000 },
  ],
};

/** The split lunge: player 1 holds the brow while player 2 strikes the right eye. */
export const INSTAR_LUNGE_SPLIT: BossSequenceStep = {
  pose: "lunge",
  arrive: "cross",
  morphBeats: 7,
  windowBeats: 5,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "head", gesture: "hold", xMilli: 440, yMilli: 300, need: 3 },
    { seat: "p2", part: "eye", gesture: "tap", xMilli: 632, yMilli: 280, need: 12 },
  ],
};

/** The brood, turned round: the counts swapped and the nests with them. */
export const INSTAR_BROOD_TURNED: BossSequenceStep = {
  pose: "brood",
  arrive: "passes",
  morphBeats: 10,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "eggs", gesture: "swipeDown", xMilli: 320, yMilli: 380, need: 10 },
    { seat: "p2", part: "eggs", gesture: "tap", xMilli: 660, yMilli: 360, need: 16 },
  ],
};

/** The mixed lash: player 1 taps the left blade, player 2 winds the right. */
export const INSTAR_LASH_MIXED: BossSequenceStep = {
  pose: "lash",
  arrive: "cross",
  morphBeats: 7,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "tail", gesture: "tap", xMilli: 380, yMilli: 560, need: 20 },
    { seat: "p2", part: "tail", gesture: "turn", xMilli: 620, yMilli: 560, need: 2000 },
  ],
};

/** The moult: each seat swipes its half of the old hide off, downward. */
export const INSTAR_MOULT: BossSequenceStep = {
  pose: "moult",
  arrive: "passes",
  morphBeats: 10,
  windowBeats: 4,
  landBeats: 4,
  marks: [
    { seat: "p1", part: "hide", gesture: "swipeDown", xMilli: 380, yMilli: 400, need: 8 },
    { seat: "p2", part: "hide", gesture: "swipeDown", xMilli: 620, yMilli: 390, need: 8 },
  ],
};
