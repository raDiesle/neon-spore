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
    // the new body pale and its heart lit in the front of its chest, under
    // the neck and turned to the cannon. Grown about where it was drawn
    // first (`grownAbout`), so growing it moves nothing else.
    bare: grownAbout(BARE_CENTRE, BARE_GROWTH, {
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
    }),
  };
}

/**
 * How much bigger the bare body is than it was drawn at first. The owner, 27
 * September 2026, on `instar:heart`: *making the body in this pose bigger …
 * then we should also increase the heart, so we can see it although it sits
 * behind the action circle.* A quarter bigger still leaves the hull and the
 * fuse clear, and its heart grows with it (`instar-heart.ts`).
 */
export const BARE_GROWTH = 1.25;

/** The point the bare body is grown about, thousandths of the field: where its heart was before it moved to the chest. */
export const BARE_CENTRE = { xMilli: 500, yMilli: 395 } as const;

/**
 * Where the bare body's heart is, thousandths of the field: the script's one
 * mark on it (`content/instar-script-second.ts`). The owner, 27 September
 * 2026, on `instar:heart`: *the heart should be on the torso front, also that
 * it can be shot by cannon* — so it sits on the chest under the neck, on the
 * side of the body turned to the ship, and not on the back.
 */
export const BARE_HEART = { xMilli: 340, yMilli: 440 } as const;

/** `f` grown by `k` about `at`: every place moved away from it, the head's radius — and with it the body's girth — scaled. */
export function grownAbout(at: { xMilli: number; yMilli: number }, k: number, f: Figure): Figure {
  const x = (v: number) => at.xMilli + (v - at.xMilli) * k;
  const y = (v: number) => at.yMilli + (v - at.yMilli) * k;
  return {
    ...f,
    headX: x(f.headX),
    headY: y(f.headY),
    headR: f.headR * k,
    rearX: x(f.rearX),
    rearY: y(f.rearY),
    eggsX: x(f.eggsX),
    eggsY: y(f.eggsY),
    nestX: x(f.nestX),
    nestY: y(f.nestY),
    tailX: x(f.tailX),
    tailY: y(f.tailY),
  };
}
