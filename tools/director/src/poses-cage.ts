import { recoilBouncesLeft } from "@neon-spore/sim";
import {
  aim,
  firstOfKind,
  fresh,
  type Pose,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";

/**
 * The pose a candidate for THE RECOIL's cage is judged on.
 *
 * Its own file rather than a fourteenth entry in `poses-bodies.ts`, which is
 * at the line ceiling; the seam is the same one as everything in there — a
 * body doing what a body does on its own — and `poses-versus.ts` lists it
 * with the rest.
 *
 * **One bounce spent, and the rest of the fall.** A whole cage is three
 * springs that all look alike, and a frame with nothing wrong with it shows
 * a candidate at its least informative: the count is the creature, and the
 * count is only visible once one rib differs from the others. So the pose
 * fires the one shot that spends a bounce and hands the world over on the
 * beat the body has been kicked back up its lane — one rib blown, two
 * standing, the frame under more strain than it arrived with — and then
 * lets it fall. No cadence: a cage that turns, or breathes, needs longer
 * than a replay window to be watched doing it, and what the body does on
 * its way down is the ordinary fall the pair already knows. `creature:recoil`
 * is judged here.
 */

/** Which column the body comes down. The middle of eleven, for the reason
 * `DART · THE RUN` gives: room either side inside the crop. */
const COL = 5;

export const RECOIL_POSE: Pose = {
  name: "RECOIL · ONE BOUNCE SPENT",
  note: "A red recoil, shot once with red: the shot did not kill it, it threw the body back up its lane a colour darker and blew one rib of the cage open. Two ribs stand, so two shots are left before the one that finishes it. It falls the rest of the way on its own.",
  lookAt:
    "the frame round the body — the two springs still standing and the one hanging burnt off the hoop, and whether any of it has a near side",
  crop: "tile",
  span: 5,
  at: firstOfKind("recoil"),
  build: () => {
    const w = fresh([{ beat: 0, col: COL, kind: "recoil", color: "red" }]);
    const whole = w.cfg.recoilBounces;
    runUntil(w, "a recoil with one bounce spent", [aim(0, COL), shoot(TPB * 2, "red")], (x) => {
      const c = x.creatures.find((k) => k.kind === "recoil");
      return c !== undefined && recoilBouncesLeft(c) === whole - 1;
    });
    // A beat on, so the body has finished its jump back up the lane and the
    // frame is standing round it again rather than mid-vent.
    run(w, TPB);
    return w;
  },
};
