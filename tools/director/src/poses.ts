import type { PoseGroup } from "./pose-kit.js";
import { FIELD_GROUPS } from "./poses-field.js";
import { MECHANIC_POSES } from "./poses-mechanics.js";
import { CONTROL_POSES } from "./poses-ship.js";

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
];
