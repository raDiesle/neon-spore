import type { Pose } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";

/**
 * Which pose puts a slot's own animation on screen, so a candidate that
 * patches a shot or a shield draws the thing it changed without anybody
 * reaching for a pose picker first.
 *
 * This is the confirmed half of the queue entry's third observation. Before
 * this file existed the whole sheet opened on one fixed pose — a slick
 * falling — regardless of which slot was showing, so `cannon:shot` and
 * `shield:ward` sat beside their shipped look with no bullet and no ward ever
 * on the frame: nobody had picked the pose that puts one there.
 * `test/versus-pose.test.ts` builds every pose named here and checks the
 * state it is named after actually arrives, the same guard `poses.test.ts`
 * holds on the whole gallery, so a pose renamed out from under this map fails
 * loudly instead of quietly falling back to the default.
 *
 * `ship:hull-skin` has no entry and takes `DEFAULT_POSE`: the hull is on
 * every frame of every pose, so no slot showing it needs a dedicated one.
 *
 * **Both cannon slots take `SHOT · BEING LAID` rather than `SHOT · IN
 * FLIGHT`, and the difference is the whole point of this map.** A pose is
 * built and then *stepped* by the pair with nobody pressing anything, so what
 * a slot gets to show is only what its world does on its own from the tick it
 * was handed over. `IN FLIGHT` is held thirty ticks after the press, so the
 * press, the opening working and the departure had all happened inside
 * `build` — the sheet showed a bolt already six tiles up a column and never
 * showed a shot *leaving*, which is the thing both cannon slots are about.
 * `BEING LAID` is held on the tick the charge lands in the muzzle instead,
 * with an empty queue and a one-beat rest, so the pair sees the mouth work,
 * the shot go and the bolt run the column, and then the wave clears and the
 * whole thing happens again roughly every 1.97 beats. Nobody triggers
 * anything, which was the complaint: two candidates that differ only while a
 * shot is being fired cannot be told apart on a page where no shot is ever
 * fired.
 */
const SLOT_POSE: Record<string, string> = {
  "cannon:shot": "SHOT · BEING LAID",
  "cannon:mouth": "SHOT · BEING LAID",
  "shield:ward": "WARD · DEFLECTED",
};

/** The pose a slot gets when nothing in `SLOT_POSE` names it. */
export const DEFAULT_POSE_NAME = "SLICK · FALLING";

const ALL_POSES: Pose[] = POSE_GROUPS.flatMap((g) => g.poses);

function findPose(name: string): Pose {
  const pose = ALL_POSES.find((p) => p.name === name);
  if (!pose) throw new Error(`versus-pose.ts names a pose that does not exist: ${name}`);
  return pose;
}

/** The pose the pair opens on for this slot — never chosen by the operator. */
export function poseForSlot(slot: string): Pose {
  return findPose(SLOT_POSE[slot] ?? DEFAULT_POSE_NAME);
}
