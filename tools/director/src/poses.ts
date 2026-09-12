import type { Pose, PoseGroup } from "./pose-kit.js";
import { CASING_GROUP } from "./poses-casing.js";
import { FIELD_GROUPS } from "./poses-field.js";
import { FIELD_CONTROL_GROUP } from "./poses-field-controls.js";
import { LAYER_GROUP } from "./poses-layers.js";
import { MECHANIC_POSES } from "./poses-mechanics.js";
import { ROUND_GROUP } from "./poses-rounds.js";
import { CONTROL_POSES } from "./poses-ship.js";
import { SURFACE_GROUP } from "./poses-surface.js";
import { VERSUS_GROUP } from "./poses-versus.js";

/**
 * Every state the STATES sheet draws, in reading order.
 *
 * Grouped the way the request for these pictures was phrased: the controls a
 * player's own hands work, the mechanics those hands add up to, the creatures
 * they are worked against, and the bosses. The hands first and the field
 * after them — a state is easier to read once you know which control answers
 * it.
 *
 * A state earns a row by being something the design *argues about*: the
 * shield being useless until it is triggered, one of the queen's two marks
 * being a lie. Those are the sentences a picture settles and a paragraph does
 * not. `pose-kit.ts` says what a pose is and why it is a run of the
 * simulation rather than a screenshot somebody took.
 */
export const POSE_GROUPS: PoseGroup[] = [
  {
    title: "CONTROLS",
    note: "what a player's own hands put the ship into — roles.md",
    poses: CONTROL_POSES,
  },
  {
    title: "MECHANICS",
    note: "what those hands add up to on the field — systems.md",
    poses: MECHANIC_POSES,
  },
  ...FIELD_GROUPS,
  FIELD_CONTROL_GROUP,
  VERSUS_GROUP,
  SURFACE_GROUP,
  LAYER_GROUP,
  CASING_GROUP,
  ROUND_GROUP,
];

/**
 * A pose by its name, for a page that shows one beside a row of its own — the
 * ON THE FIELD tab names the pose each control is pictured by. Throws on a
 * name nobody has, so a renamed pose fails the page's test rather than
 * leaving a row without its picture.
 */
export function poseNamed(name: string): Pose {
  const pose = POSE_GROUPS.flatMap((g) => g.poses).find((p) => p.name === name);
  if (pose === undefined) throw new Error(`no pose called ${name}`);
  return pose;
}
