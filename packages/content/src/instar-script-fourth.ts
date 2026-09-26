import type { BossSequenceStep } from "@neon-spore/sim";

/**
 * **THE INSTAR's fourth act**: five more poses, laid in among the other three
 * acts (docs/spec/bosses.md §11.32, *The fourth act*), for the same ask as the
 * third: more states to see, and a SLOW moment in each where the pair acts.
 * Hung high, bowed, bridged, upright, and so close the jaws fill the field.
 *
 * Every place is where the pose draws its part (`render/instar-poses-fourth.ts`).
 */

/** Hovering high side-on, the wings beating, the tail hung straight down with
 * its fork over the hull. Shoot each blade of it. */
export const INSTAR_HOVER: BossSequenceStep = {
  pose: "hover",
  arrive: "passes",
  morphBeats: 10,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "both", part: "tail", gesture: "shoot", xMilli: 380, yMilli: 600, need: 2 },
    { seat: "both", part: "tail", gesture: "shoot", xMilli: 620, yMilli: 600, need: 2 },
  ],
};

/** Bowed face-on, the head low and the horns at the ship, about to gore it.
 * Each seat holds its own horn off, both at once. */
export const INSTAR_BOW: BossSequenceStep = {
  pose: "bow",
  arrive: "approach",
  morphBeats: 6,
  windowBeats: 5,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "head", gesture: "hold", xMilli: 400, yMilli: 420, need: 3 },
    { seat: "p2", part: "head", gesture: "hold", xMilli: 600, yMilli: 420, need: 3 },
  ],
};

/** Arched side-on, head and tail down at the hull and the back bridged high
 * over the ship with the nest at its top. Player 1 taps the nest flat;
 * player 2 pulls the tail's blade up off the hull. */
export const INSTAR_ARCH: BossSequenceStep = {
  pose: "arch",
  arrive: "cross",
  morphBeats: 8,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "eggs", gesture: "tap", xMilli: 400, yMilli: 160, need: 16 },
    { seat: "p2", part: "tail", gesture: "pullUp", xMilli: 700, yMilli: 620, need: 3000 },
  ],
};

/** Risen upright on its tail, side-on, the wings spread and shaking embers
 * down on both halves. Open the maw under each. */
export const INSTAR_RISE: BossSequenceStep = {
  pose: "rise",
  arrive: "cross",
  morphBeats: 8,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "both", part: "ember", gesture: "suck", xMilli: 227, yMilli: 740, need: 1 },
    { seat: "both", part: "ember", gesture: "suck", xMilli: 772, yMilli: 740, need: 1 },
  ],
};

/** Looming face-on so close the jaws fill the field, wide open on the ship.
 * The breath's jaws again, twice the size and the seats' lips swapped. */
export const INSTAR_LOOM: BossSequenceStep = {
  pose: "loom",
  arrive: "approach",
  morphBeats: 6,
  windowBeats: 4,
  landBeats: 3,
  marks: [
    { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 420, yMilli: 563, need: 4000 },
    { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 580, yMilli: 197, need: 4000 },
  ],
};
