import type { SpawnEntry } from "@neon-spore/sim";
import { firstOfKind, fresh, guard, type Pose, run, POSE_TPB as TPB, ward } from "./pose-kit.js";
import { fallSeconds } from "./poses-surface.js";

/**
 * THE VOLLEY, warded three times by a hand that never misses.
 *
 * It belongs to the CASINGS group next door — a ball of stone is the thing
 * this body *wears*, and a ward takes a sector of it off — and it is its own
 * file only because `poses-casing.ts` is at the line ceiling. `CASING_POSES`
 * lists it there, so the sheet and the group are unchanged.
 *
 * **The shell is the readout, and the readout changes on a ward.** A pose
 * held on a whole ball shows `creature:volley` a third of the question: what
 * a candidate stone or seam looks like *shut*. What the slot is about is the
 * same shell losing a sector, cracking, and standing as a skeleton with the
 * body burning inside it — three states, each reached by the shield doing
 * its work. So the pose keeps a hand on the world (`Pose.hand`): the shield
 * is parked in the ball's lane and the guard is pressed on every beat, which
 * is the pair playing it perfectly, and every ward in the creature's life
 * happens where somebody can see it.
 *
 * Held for a whole life rather than replayed on the event clock: a fall, three
 * climbs and three falls is a picture longer than six seconds, and the
 * moment the third ward frees the body is the one the creature exists for.
 * The window is a tile that follows the ball up and down its lane
 * (`firstOfKind` follows the drawn body), wide enough that the climb — three
 * rows a beat — stays in it.
 */

const COL = 5;

/** A fall, three climbs of two beats and three more falls from mid-field,
 * with a beat of empty lane after — about two and a half falls' worth. */
function volleyLifeSeconds(): number {
  return fallSeconds() * 2.5;
}

export const VOLLEY_POSE: Pose = {
  name: "VOLLEY · WARDED THREE TIMES",
  note: "A basketball of meteor coming down one lane with the shield parked under it and the guard pressed on every beat. Each ward throws it back up the field and takes one sector of the stone off; the rim and the four seams stay whole, so what is left after two is a ball-shaped skeleton with the body burning inside it. The third ward frees the body.",
  lookAt:
    "the ball's stone and the four seams on it — whether the seams read as paint on a rock, a cut into one, or the body inside showing through, and how the shell wears as sectors go",
  crop: "tile",
  at: firstOfKind("volley"),
  // Wider than the default 3.4: a volley stands half again over a rock's
  // radius, and a ward carries it three rows a beat, which a tighter window
  // loses between frames.
  span: 4.5,
  cadenceSeconds: volleyLifeSeconds(),
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "volley", color: "red" };
    const w = fresh([entry]);
    // One beat: the ball is on the field, whole. The shield is parked now so
    // the pair opens on a lane already answered and never sees the guard
    // slide into place under a body it was meant to be waiting for.
    run(w, TPB, [ward(0, COL)]);
    return w;
  },
  hand: (w) => {
    // The trigger goes in one tick after every beat boundary, which is what
    // `WARD · DEFLECTED` does inside `build`: whichever beat the ball lands on
    // is a beat the window was open.
    if (w.tick % TPB !== 1) return [];
    if (!w.creatures.some((c) => c.kind === "volley")) return [];
    return [guard(w.tick)];
  },
};
