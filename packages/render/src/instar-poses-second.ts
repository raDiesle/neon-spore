import type { InstarPose } from "@neon-spore/sim";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR's second act, as figures** — the five poses appended on 26
 * September 2026 (`docs/spec/bosses.md` §11.32), each a table of places in
 * thousandths of the field like the six before them (`instar-poses.ts`).
 * Its own file because that one was at its line limit; it takes the breath
 * as an argument rather than importing it, so the two files do not import
 * each other.
 *
 * Each is drawn with the parts the body already has. What only these poses
 * have — the glob the rear spits, the embers the spread shakes off, the heart
 * lit in the bare body — is the look lane's (`docs/queue.md`).
 */
type Second = "rear" | "glare" | "dive" | "spread" | "bare";

export function secondAct(breath: Figure): Record<Second & InstarPose, Figure> {
  return {
    // Reared back face-on, high and small, the jaws wide on the fire, the
    // wings up: about to spit a glob at each half of the hull.
    rear: { ...breath, headY: 230, headR: 190, eye: 0.8, rearY: -40 },
    // Close, face-on, jaws shut, eyes wide, wings folded: the stare the
    // bolts go into, one at each eye.
    glare: {
      ...breath,
      headY: 340,
      headR: 250,
      jawUp: 0.05,
      jawDown: 0.1,
      eye: 1,
      wing: 0.3,
      flame: 0,
    },
    // Head-first at the ship, huge, the wings swept back: the brow the
    // shield drives off.
    dive: {
      ...breath,
      headY: 470,
      headR: 260,
      jawUp: 0.3,
      jawDown: 0.4,
      eye: 0.7,
      wing: 0.15,
      reach: 1,
      flame: 0.4,
    },
    // The head pulled back small, the wings raised wide, the embers shaken
    // off them onto the hull.
    spread: {
      ...breath,
      headY: 280,
      headR: 170,
      jawUp: 0.4,
      jawDown: 0.5,
      eye: 0.9,
      wing: 1,
      flame: 0.6,
    },
    // After the moult: side-on and still, the old hide gone off both halves,
    // the new body pale and its heart lit through the split along the back.
    bare: {
      ...breath,
      headX: 230,
      headY: 310,
      headR: 140,
      jawUp: 0.3,
      jawDown: 0.4,
      eye: 0.9,
      side: 1,
      wing: 0.1,
      rearX: 860,
      rearY: 400,
      eggsX: 620,
      eggsY: 390,
      nestX: 380,
      nestY: 400,
      flame: 0,
      split: 1,
      shedNear: 1,
      shedFar: 1,
      heart: 1,
    },
  };
}
