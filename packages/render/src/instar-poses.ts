import type { InstarMark, InstarPose } from "@neon-spore/sim";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR's poses**, one `Figure` each: the dragon as it comes in, the
 * three the script names, and the beaten one it sags into at the end.
 *
 * Cut off `instar-shape.ts` the day it was written, for the reason the
 * scout's arenas are their own file: a pose is a table of places in
 * thousandths of the field, and the file next door is the arithmetic that
 * blends and deforms them. Every place a mark sits in
 * `packages/content/src/instar-script.ts` is a place written here for the
 * part the mark is on — the jaw marks on the two lips, the egg marks on the
 * two nests, the tail's two marks on the blades of its fork — because a mark
 * that was not on its part would be a ring beside a body.
 *
 * **The two nests are the back.** Side-on the body is drawn through them
 * (`instar-profile.ts`), so a pose with no eggs still names where they would
 * be: that is where the back runs.
 */

/** The fire: the face at the ship, the wings wide, the jaws apart on it —
 * the upper lip at 220 and the lower at 500, where their marks are. */
const BREATH: Figure = {
  headX: 500,
  headY: 360,
  headR: 230,
  jawUp: 1,
  jawDown: 1,
  eye: 1,
  wince: 0,
  side: 0,
  wing: 1,
  rearX: 500,
  rearY: 20,
  eggs: 0,
  eggsX: 660,
  eggsY: 360,
  nest: 0,
  nestX: 320,
  nestY: 380,
  tail: 0,
  tailX: 500,
  tailY: 560,
  reach: 0,
  flame: 1,
};

/** The body as it comes in, before the first morph: the same face, the mouth
 * already open, the eyes still narrow. The flight makes it small and far
 * (`instar-flight.ts`). */
export const ENTER: Figure = { ...BREATH, jawUp: 0.6, jawDown: 0.6, eye: 0.4, wing: 0.6 };

/** The five poses the script names. */
export const POSES: Record<InstarPose, Figure> = {
  breath: BREATH,
  // Side-on, head to the left, the back running through the two nests: the
  // one at 320/380 squashed by taps, the one at 660/360 swiped.
  brood: {
    ...BREATH,
    headX: 240,
    headY: 300,
    headR: 150,
    jawUp: 0.15,
    jawDown: 0.3,
    side: 1,
    wing: 0.6,
    rearX: 900,
    rearY: 380,
    eggs: 1,
    nest: 1,
  },
  // Side-on and higher, the tail up over the back and its fork down at the
  // hull, the blades at 380 and 620.
  lash: {
    ...BREATH,
    headX: 250,
    headY: 170,
    headR: 140,
    jawUp: 0.25,
    jawDown: 0.35,
    side: 1,
    wing: 0.85,
    rearX: 860,
    rearY: 200,
    eggsX: 640,
    eggsY: 190,
    nestX: 380,
    nestY: 200,
    tail: 1,
  },
  // Face-on and lower, the head thrust down at the ship to butt it, the jaws
  // shut behind the brow both seats hold it off by, at 500/300.
  lunge: {
    ...BREATH,
    headY: 400,
    headR: 220,
    jawUp: 0.1,
    jawDown: 0.15,
    reach: 1,
  },
  // Side-on and low, the back through the nests down near the hull, the tail
  // wound up high over it to spring, the blades at 380 and 620 over the back.
  coil: {
    ...BREATH,
    headX: 220,
    headY: 440,
    headR: 140,
    jawUp: 0.2,
    jawDown: 0.3,
    side: 1,
    wing: 0.5,
    rearX: 740,
    rearY: 470,
    eggsX: 640,
    eggsY: 460,
    nestX: 380,
    nestY: 470,
    tail: 1,
    tailY: 330,
  },
};

/** Beaten: side-on, sagging, the eyes shut, the wings folded, the tail down. */
export const BEATEN: Figure = {
  ...POSES.lash,
  headY: 300,
  jawUp: 0,
  jawDown: 0.4,
  eye: 0,
  wing: 0.1,
  rearY: 250,
  eggsY: 270,
  nestY: 290,
  tail: 0,
};

/**
 * The pose with each nest stood where its mark is: the tapped nest at the
 * tap's mark, the swiped one at the swipe's. The brood is played twice, the
 * second time with the seats' counts swapped (`instar-script.ts`), and since
 * left is player 1's the nests change sides with them.
 */
export function placed(pose: InstarPose, marks: readonly InstarMark[]): Figure {
  const g = { ...POSES[pose] };
  for (const m of marks) {
    if (m.part !== "eggs") continue;
    if (m.gesture === "tap") {
      g.nestX = m.xMilli;
      g.nestY = m.yMilli;
    } else {
      g.eggsX = m.xMilli;
      g.eggsY = m.yMilli;
    }
  }
  return g;
}
