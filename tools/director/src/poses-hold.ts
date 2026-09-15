import { clingIsStuck, TO_THE_END } from "@neon-spore/sim";
import { fresh, type Pose, type PoseGroup, run, POSE_TPB as TPB, until } from "./pose-kit.js";

/**
 * The two bodies that hold a control and **lose the round if it stands still**
 * — THE LIMPET on the plate, THE LEECH on the cannon (`sim/harpoon.ts`).
 *
 * THE GUM sits on the ON THE FIELD sheet because it is answered by a hand on
 * the field itself, in the air; these two are answered by the controls the band
 * already has, moved, so they are a sheet of their own.
 *
 * **Both poses are on the seat *without* the control**, which is where the
 * words are: MOVE SHIELD! and MOVE CANNON! go under that seat's dial and over
 * the body, with the square, the code and the timer
 * (`render/harpoon-mark.ts`). Until 15 September 2026 the reason was a
 * different one — a row of fuse lights shown to one screen only — and the
 * fuse went with the creature; the seat is the same seat because the thing it
 * has that the other one has not is still a panel to read the fault off.
 */

function clung(kind: "limpet" | "leech"): Pose["build"] {
  return () => {
    // A pencil across the whole wave, which is what a fault brush places with
    // no length written (`sim/fault-placed.ts`). There is no lane and no fall
    // to set up: the body is fired straight onto the control.
    const w = fresh([], [], null, {}, 0, [{ kind, at: 0, beats: TO_THE_END }]);
    until(w, `a ${kind} on its control`, (x) => x.creatures.some(clingIsStuck));
    // Half a beat in, which is a body that has arrived and a timer the pair has
    // had time to read, and well inside the beat and a half that loses it.
    run(w, TPB / 2);
    return w;
  };
}

const LIMPET_STUCK: Pose = {
  name: "LIMPET · ON THE PLATE",
  note: "A limpet fired at the plate from the thing at the top of the field and clamped on where the plate stood. A plate that has not been in a new column for a beat and a half loses the round, a heavy hit on the hull at its column. Player 1's screen — the seat that cannot move the plate, which is why the word is theirs to say.",
  lookAt:
    "the line running back to the lantern, and the square, the code, the timer and MOVE SHIELD! stacked over the body",
  crop: "ship",
  role: "p1",
  build: clung("limpet"),
};

const LEECH_STUCK: Pose = {
  name: "LEECH · ON THE CANNON",
  note: "The same body on the cannon's swelling, needles in. Player 1 answers it by walking the cannon and player 2, who cannot, is the seat with the word. Player 2's screen.",
  lookAt:
    "the four-pointed body on the cannon's swelling, the cannon glowing toward its danger colour under it, and MOVE CANNON! over it",
  crop: "ship",
  role: "p2",
  build: clung("leech"),
};

export const HOLD_GROUP: PoseGroup = {
  title: "A BODY ON A CONTROL",
  note: "the two faults that fire a body at a control and lose the round if it stands still — bestiary.md, THE LIMPET and THE LEECH",
  poses: [LIMPET_STUCK, LEECH_STUCK],
};
