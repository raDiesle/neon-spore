import type { Pose, PoseGroup } from "./pose-kit.js";
import { BOSS_GROUPS } from "./poses-bosses.js";
import { CASING_GROUP } from "./poses-casing.js";
import { FIELD_GROUPS } from "./poses-field.js";
import { FIELD_CONTROL_GROUP } from "./poses-field-controls.js";
import { HOLD_GROUP } from "./poses-hold.js";
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
 *
 * **Two categories since 18 September 2026.** THE GAME is the sheet as it
 * was; BOSSES is one group per boss, every state of it, held to the
 * simulation's own phase tables by `test/boss-states.test.ts`
 * (`poses-bosses.ts`). `POSE_GROUPS` is still the flat list of every group,
 * for everything that walks the poses without caring which category one is
 * in — the test that builds them all, the VERSUS slot map, `poseNamed`.
 */
export interface PoseCategory {
  title: string;
  note: string;
  groups: PoseGroup[];
}

const GAME_GROUPS: PoseGroup[] = [
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
  HOLD_GROUP,
  VERSUS_GROUP,
  SURFACE_GROUP,
  LAYER_GROUP,
  CASING_GROUP,
  ROUND_GROUP,
];

export const POSE_CATEGORIES: PoseCategory[] = [
  {
    title: "THE GAME",
    note: "the controls, the mechanics, the creatures, the surfaces — what a wave is made of",
    groups: GAME_GROUPS,
  },
  {
    title: "BOSSES",
    note: "every boss, every state it can be in, in the order the simulation numbers them — bosses.md §11; a group with no cards names the states still owed",
    groups: BOSS_GROUPS,
  },
];

export const POSE_GROUPS: PoseGroup[] = POSE_CATEGORIES.flatMap((c) => c.groups);

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
