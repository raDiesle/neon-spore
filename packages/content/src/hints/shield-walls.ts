import type { HintLine } from "../hint-types.js";
import { aimAndFire, CANNON, FIRE, GUARD, SHIELD, tell } from "./lines.js";

/**
 * **The shield waves' hints, second half** — the fences, and the bodies the
 * shield opens rather than stops: THE FENCE to THE CRAWLER. `shield.ts` says
 * how they are written; split from it at the length ceiling.
 */

/** THE FENCE: a wall the width of the field, with its gap over the shield. */
export const FENCE_HINTS: readonly HintLine[] = [
  tell(1, "KEEP THE SHIELD IN THE GAP"),
  { seat: 2, text: "THE GAP IS IN THE MIDDLE", anchor: SHIELD },
  { seat: 2, text: "STAY THERE · DO NOT MOVE", anchor: SHIELD, acts: false },
];

/** THE GAP: the opening moves, and only player 1 sees where. */
export const GAP_HINTS: readonly HintLine[] = [
  tell(1, "SAY WHERE THE GAP IS"),
  tell(2, "ASK WHERE THE GAP IS"),
  { seat: 2, text: "SHIELD WHERE YOU HEAR", anchor: SHIELD },
];

/** THE CUT: no gap at all, only a crack in a colour player 1 sees. */
export const CUT_HINTS: readonly HintLine[] = [
  tell(1, "NO GAP · SHOOT THE CRACK"),
  { seat: 1, text: "CANNON UNDER THE CRACK", anchor: CANNON },
  tell(1, "SAY THE CRACK'S COLOUR"),
  { seat: 2, text: "FIRE THE COLOUR YOU HEAR", anchor: CANNON },
];

/** THE CLASP: shots bounce off it, and the shield is what opens it. */
export const CLASP_HINTS: readonly HintLine[] = [
  tell(2, "SHOTS BOUNCE OFF ITS SHELL"),
  { seat: 2, when: "shieldOff", text: "SHIELD UNDER IT", anchor: SHIELD },
  { seat: 1, when: "shieldOn", text: "PRESS SHIELD · IT OPENS", anchor: GUARD },
  { seat: 1, when: "offColumn", text: "CANNON UNDER IT TOO", anchor: CANNON },
  { seat: 2, text: "THEN FIRE ITS COLOUR", anchor: FIRE },
];

/** THE CRYSTAL: only its middle breaks, and only with the shield under it. */
export const CRYSTAL_HINTS: readonly HintLine[] = [
  tell(1, "ONLY ITS MIDDLE BREAKS"),
  { seat: 2, when: "shieldOff", text: "SHIELD UNDER THE CRAFT", anchor: SHIELD },
  { seat: 1, when: "offColumn", text: "CANNON UNDER ITS MIDDLE", anchor: CANNON },
  { seat: 1, text: "SHIELD AND SHOT, ONE BEAT", anchor: GUARD },
  { seat: 2, when: "onColumn", text: "FIRE AS THE SHIELD GOES UP", anchor: CANNON },
];

/** THE VOLLEY: a shot only chips it, and a shield sends it back up. */
export const VOLLEY_HINTS: readonly HintLine[] = [
  {
    seat: 2,
    text: "A SHOT ONLY CHIPS IT",
    anchor: { at: "control", control: "fireRed" },
    acts: false,
  },
  { seat: 2, when: "shieldOff", text: "SHIELD UNDER IT", anchor: SHIELD },
  { seat: 1, when: "shieldOn", text: "PRESS SHIELD · IT GOES BACK", anchor: GUARD },
  tell(1, "THREE TIMES · A SHIELD EACH"),
  { seat: 2, text: "SHELL OFF? THEN SHOOT IT", anchor: FIRE },
];

/** THE CAROM: it turns at the wall; the cannon opens it, the shield ends it. */
export const CAROM_HINTS: readonly HintLine[] = [
  tell(1, "IT TURNS AT THE WALL"),
  ...aimAndFire({ fire: "YOUR COLOUR CRACKS IT" }),
  { seat: 1, text: "THEN SHIELD WHAT FALLS OUT", anchor: GUARD },
];

/**
 * THE CRAWLER: it walks the ship and never falls, and its rings cycle red,
 * cyan, shield and suck (`sim/crawler-part.ts`) — a line for each answer.
 */
export const CRAWLER_HINTS: readonly HintLine[] = [
  tell(2, "IT WALKS · IT NEVER FALLS"),
  { seat: 1, text: "CANNON UNDER A COLOUR RING", anchor: CANNON },
  { seat: 2, text: "FIRE THE RING'S COLOUR", anchor: CANNON },
  { seat: 1, text: "SHIELD RING · PRESS SHIELD", anchor: GUARD },
  { seat: 1, text: "AMBER RING · PRESS SUCK", anchor: { at: "control", control: "intake" } },
];
