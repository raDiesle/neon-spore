import type { InstarPose } from "@neon-spore/sim";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR's fourth act, as figures** — five more poses appended on 26
 * September 2026 (`docs/spec/bosses.md` §11.32, *The fourth act*), in the
 * form of the second and third (`instar-poses-second.ts`).
 *
 * Hung high with the tail down, bowed low, bridged, upright, and filling the
 * field. Every mark in `content/instar-script-fourth.ts` is on a place
 * written here.
 */
type Fourth = "hover" | "bow" | "arch" | "rise" | "loom";

export function fourthAct(breath: Figure): Record<Fourth & InstarPose, Figure> {
  return {
    // Hovering high side-on, the wings up, the back level near the top and
    // the tail hung straight down from it, the blades at 380 and 620 over
    // the hull.
    hover: {
      ...breath,
      headX: 230,
      headY: 170,
      headR: 140,
      jawUp: 0.3,
      jawDown: 0.4,
      side: 1,
      wing: 1,
      rearX: 820,
      rearY: 200,
      eggsX: 640,
      eggsY: 190,
      nestX: 400,
      nestY: 190,
      tail: 1,
      tailY: 600,
      flame: 0,
    },
    // Bowed face-on, the head low and small-browed over the ship, the jaws
    // shut, the eyes hooded, the horns forward where the two holds are.
    bow: {
      ...breath,
      headY: 540,
      headR: 210,
      jawUp: 0.05,
      jawDown: 0.1,
      eye: 0.3,
      wing: 0.8,
      reach: 1,
      flame: 0,
    },
    // Arched side-on: the head down at the hull on the left, the back
    // bridged high through the nest at 400/160, the rear and the tail down
    // on the right with the blade at 700/620.
    arch: {
      ...breath,
      headX: 180,
      headY: 540,
      headR: 130,
      jawUp: 0.3,
      jawDown: 0.4,
      eye: 0.8,
      side: 1,
      wing: 0.5,
      rearX: 860,
      rearY: 520,
      eggsX: 640,
      eggsY: 180,
      nest: 1,
      nestX: 400,
      nestY: 160,
      tail: 1,
      tailX: 580,
      tailY: 620,
      flame: 0,
    },
    // Risen upright on its tail side-on: the head at the top, the back
    // falling straight down through the nests to the rear at the hull, the
    // wings spread wide either side.
    rise: {
      ...breath,
      headX: 460,
      headY: 110,
      headR: 140,
      jawUp: 0.5,
      jawDown: 0.6,
      eye: 1,
      side: 1,
      wing: 1,
      rearX: 540,
      rearY: 600,
      eggsX: 530,
      eggsY: 420,
      nestX: 500,
      nestY: 260,
      flame: 0.5,
    },
    // Looming face-on so close the head fills the field, the jaws wide, the
    // lips at 197 and 563, the fire deep in the mouth.
    loom: {
      ...breath,
      headY: 380,
      headR: 300,
      eye: 1,
      wing: 0.6,
      flame: 0.8,
    },
  };
}
