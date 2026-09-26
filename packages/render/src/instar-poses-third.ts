import type { InstarPose } from "@neon-spore/sim";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR's third act, as figures** — five more poses appended on 26
 * September 2026 (`docs/spec/bosses.md` §11.32, *The third act*), in the
 * second act's form (`instar-poses-second.ts`): a table of places in
 * thousandths of the field, taking the breath as an argument.
 *
 * Each is a body the other thirteen are not: low and wide, high on its wings,
 * thrown back at the sky, flat on the hull, and upside down along a diagonal.
 * Every mark in `content/instar-script-third.ts` is on a place written here.
 */
type Third = "crouch" | "perch" | "roar" | "sprawl" | "twist";

export function thirdAct(breath: Figure): Record<Third & InstarPose, Figure> {
  return {
    // Crouched face-on, low and wide over the ship, the jaws shut, the eyes
    // narrowed to slits on it, the wings half down: about to spring.
    crouch: {
      ...breath,
      headY: 480,
      headR: 280,
      jawUp: 0.05,
      jawDown: 0.05,
      eye: 0.5,
      wing: 0.3,
      reach: 0.5,
      flame: 0,
    },
    // Perched high side-on, the wings full up, the brood on its back over
    // both halves of the ship, the nests at 380/170 and 640/160.
    perch: {
      ...breath,
      headX: 240,
      headY: 150,
      headR: 140,
      jawUp: 0.3,
      jawDown: 0.4,
      side: 1,
      wing: 1,
      rearX: 860,
      rearY: 160,
      eggs: 1,
      eggsX: 640,
      eggsY: 160,
      nest: 1,
      nestX: 380,
      nestY: 170,
      flame: 0,
    },
    // The head thrown back small at the top of the field, the jaws wide at
    // the sky, the wings up, the fire pouring out of the mouth.
    roar: {
      ...breath,
      headY: 130,
      headR: 170,
      eye: 0.2,
      rearY: -80,
      flame: 1,
    },
    // Sprawled flat along the hull side-on, the wings folded, the fork of
    // its tail laid on the ship, the blades at 380 and 620.
    sprawl: {
      ...breath,
      headX: 200,
      headY: 560,
      headR: 130,
      jawUp: 0.15,
      jawDown: 0.2,
      eye: 0.7,
      side: 1,
      wing: 0.1,
      rearX: 880,
      rearY: 580,
      eggsX: 640,
      eggsY: 560,
      nestX: 380,
      nestY: 570,
      tail: 1,
      tailY: 640,
      flame: 0,
    },
    // Twisted along a diagonal, side-on: the head down at the hull on the
    // left, the back climbing through the nests to the rear high on the
    // right, the tail thrown up with its right blade at 800/200.
    twist: {
      ...breath,
      headX: 220,
      headY: 560,
      headR: 140,
      jawUp: 0.4,
      jawDown: 0.5,
      eye: 0.8,
      side: 1,
      wing: 0.4,
      rearX: 860,
      rearY: 140,
      eggsX: 640,
      eggsY: 280,
      nestX: 420,
      nestY: 420,
      tail: 1,
      tailX: 680,
      tailY: 200,
      flame: 0.3,
    },
  };
}
