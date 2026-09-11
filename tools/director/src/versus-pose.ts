import type { Pose } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";

/**
 * Which pose puts a slot's own animation on screen, so a candidate that
 * patches a shot or a shield draws the thing it changed without anybody
 * reaching for a pose picker first.
 *
 * Before this file existed the whole sheet opened on one fixed pose — a slick
 * falling — regardless of which slot was showing, so `cannon:shot` and
 * `shield:ward` sat beside their shipped look with no bullet and no ward ever
 * on the frame. `test/versus-pose.test.ts` builds every pose named here and
 * checks the state it is named after actually arrives, so a pose renamed out
 * from under this map fails loudly instead of quietly falling back to the
 * default. A slot with no row takes `DEFAULT_POSE_NAME`.
 *
 * **The map is rows and nothing else.** It carried a paragraph over every row
 * once, and three lanes landing slots on one afternoon each added a row and a
 * paragraph; a rebase that kept two of them put the trunk over the line
 * ceiling. The reason a slot is judged on a pose belongs on that pose, in the
 * docstring `poses-*.ts` already keeps for it — *which slots are judged here,
 * and why this state* — where the pose's own argument is, and where a lane
 * opening a slot is already writing. The test refuses a comment inside the
 * literal so the paragraphs cannot grow back. What a pose *is* — event-shaped
 * or continuous, and what that means for its cadence — is `pose-type.ts`'s
 * `cadenceSeconds`.
 *
 * A decided slot's row goes with its candidates — `bun run versus adopt` and
 * `drop` take it out (`tools/versus/pose-row.ts`), and the test refuses a row
 * whose slot has no candidate, because by 10 September 2026 the map carried
 * one for every slot that had ever closed. Its pose stays in the gallery: a
 * pose is a picture of the game and outlives the question it was drawn for.
 * `ship:hull-skin` never had a row: the hull is on every frame of every pose,
 * so a slot showing it needs no dedicated one.
 */
const SLOT_POSE: Record<string, string> = {
  "ship:body": "SHIP · MEETING THE PANEL",
  "creature:meteor": "METEOR · A SHOT ARRIVING",
  "creature:throb": "THROB · TURNING",
  "creature:mount": "GYRE · TURNING",
  "creature:rind": "RIND · SHEDDING",
  "creature:queen": "QUEEN · SHUT",
  "creature:recoil": "RECOIL · ONE BOUNCE SPENT",
  "creature:tether": "TETHER · PULLED",
};

/** The pose a slot gets when nothing in `SLOT_POSE` names it. */
const DEFAULT_POSE_NAME = "SLICK · FALLING";

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
