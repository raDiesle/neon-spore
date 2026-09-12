import { clingIsStuck, type SpawnEntry } from "@neon-spore/sim";
import { fresh, type Pose, type PoseGroup, run, POSE_TPB as TPB, until } from "./pose-kit.js";

/**
 * The two bodies that hold a control and **go off if it stands still** —
 * THE LIMPET on the plate, THE LEECH on the cannon (`sim/cling.ts`).
 *
 * Their gum cousin sits on the ON THE FIELD sheet because it is answered by
 * a hand landing on the field itself; these two are answered by
 * the controls the band already has, moved, so they are a sheet of their own.
 * Both poses are on the seat that is *shown the fuse* — the one without the
 * control — with the count run down to its loud last two, since that row of
 * lights is the thing this family adds to the picture and it is on one
 * screen only (`render/cling-fuse.ts`).
 */

/** The lane each falls in, two off the control it takes, so the arrival
 * along the plating from the lane is part of what the frame has behind it. */
const LANE = 3;

function clung(kind: "limpet" | "leech"): Pose["build"] {
  return () => {
    const entry: SpawnEntry = { beat: 0, col: LANE, kind, color: null };
    const w = fresh([entry]);
    until(w, `a ${kind} on its control`, (x) => x.creatures.some(clingIsStuck));
    // Three beats of the fuse gone, and half a beat into the fourth: two of
    // the five lights left, which is where the row starts pulsing.
    run(w, TPB * 3 + TPB / 2);
    return w;
  };
}

const LIMPET_STUCK: Pose = {
  name: "LIMPET · ON THE PLATE",
  note: "A limpet that fell two lanes over and took the plate where it stood. Three beats of standing still are gone and two are left; when the last goes it is a heavy hit on the hull at the plate's column. Player 1's screen — the seat that cannot move the plate and is the only one shown the count.",
  lookAt:
    "the row of lights over the body on the hull — two lit, three out — and the hooks turned down into the plating",
  crop: "ship",
  role: "p1",
  build: clung("limpet"),
};

const LEECH_STUCK: Pose = {
  name: "LEECH · ON THE CANNON",
  note: "The same body on the cannon's swelling, needles in. The count is player 2's to see and player 1's to answer by walking the cannon; a beat in a new column puts the count back and loosens it. Player 2's screen.",
  lookAt: "the four-pointed body on the cannon's swelling and the two lights left over it",
  crop: "ship",
  role: "p2",
  build: clung("leech"),
};

export const HOLD_GROUP: PoseGroup = {
  title: "A BODY ON A CONTROL",
  note: "the two bodies that take a control and go off if it stands still — bestiary.md, THE LIMPET and THE LEECH",
  poses: [LIMPET_STUCK, LEECH_STUCK],
};
