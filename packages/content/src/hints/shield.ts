import type { HintLine } from "../hint-types.js";
import { aimAndFire, CANNON, GUARD, HELD, RADAR, SHIELD, shieldIt, tell } from "./lines.js";

/**
 * **The shield waves' hints, first half** — THE ROCK to THE VEER: rocks, the
 * torch and the limpet, where the shield is the answer and the cannon is not.
 * Written as `standard-2.ts` says: the film's words where they were already an
 * instruction, turned into one where they were a narration, and nothing said
 * to a seat that it is not shown.
 */

/** THE ROCK: the first thing a shot cannot answer, and both halves of the shield. */
export const ROCK_HINTS: readonly HintLine[] = [
  tell(1, "A ROCK · NO SHOT TOUCHES IT"),
  ...shieldIt(),
];

/** THE HAND: two rocks at once against one shield, and a finger to hold one. */
export const HAND_HINTS: readonly HintLine[] = [
  tell(1, "TWO AT ONCE · ONE SHIELD"),
  { seat: 1, when: "free", text: "HOLD ONE BACK WITH A FINGER", anchor: { at: "body" } },
  { seat: 1, when: "held", text: "CARRY IT A COLUMN OVER", anchor: HELD },
  ...shieldIt({ move: "SHIELD UNDER THE LOWER ONE" }),
];

/** ONE LAST CHANCE: the shield pushes a body back once, and only a shot ends it. */
export const ONE_LAST_CHANCE_HINTS: readonly HintLine[] = [
  ...aimAndFire(),
  { seat: 1, when: "shieldOn", text: "SHIELD PUSHES IT BACK ONCE", anchor: GUARD },
  tell(2, "ONCE ONLY · THEN SHOOT IT"),
];

/** TORCH: only player 1's strip says where it is coming. */
export const TORCH_HINTS: readonly HintLine[] = [
  { seat: 1, text: "CALL THE TORCH'S COLUMN", anchor: RADAR, acts: false },
  { seat: 2, text: "ASK WHERE THE TORCH IS", anchor: RADAR, acts: false },
  ...shieldIt({ move: "SHIELD WHERE YOU HEAR" }),
];

/** THE CROSSING: a rock walks across the lane, and only player 1's strip shows it. */
export const CROSSING_HINTS: readonly HintLine[] = [
  { seat: 1, text: "AN ARROW: A ROCK WILL CROSS", anchor: RADAR, acts: false },
  { seat: 1, text: "CANNON UNDER AN ENEMY", anchor: CANNON },
  { seat: 2, text: "ASK IF THE COLUMN IS CLEAR", anchor: RADAR, acts: false },
  { seat: 2, text: "FIRE ON A CLEAR COLUMN", anchor: CANNON },
];

/** THE LIMPET: a body stuck to the shield, and standing still loses the wave. */
export const LIMPET_HINTS: readonly HintLine[] = [
  { seat: 2, text: "A NEW COLUMN EVERY BEAT", anchor: SHIELD },
  { seat: 2, text: "PARKING IT LOSES THE WAVE", anchor: SHIELD, acts: false },
  { seat: 1, text: "TELL PLAYER 2: MOVE SHIELD", anchor: GUARD, acts: false },
  ...shieldIt(),
];

/** HEAVY ROCKS: the same rock, faster, with less time to be under it. */
export const WARD_HINTS: readonly HintLine[] = [
  tell(1, "ROCKS FALL AT FIVE SPEEDS"),
  ...shieldIt({ move: "BE UNDER IT EARLY" }),
];

/** THE VEER: it steps aside as it falls, and only player 1 sees which way. */
export const VEER_HINTS: readonly HintLine[] = [
  tell(1, "THE ARROW IS ITS NEXT STEP"),
  tell(2, "ASK WHICH WAY IT STEPS"),
  { seat: 2, text: "KEEP THE SHIELD UNDER IT", anchor: SHIELD },
  { seat: 1, when: "shieldOn", text: "PRESS SHIELD AS IT LANDS", anchor: GUARD },
];
