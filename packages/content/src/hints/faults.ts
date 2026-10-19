import type { HintLine } from "../hint-types.js";
import { BODY, CANNON, FIRE, GUARD, SHIELD, tell } from "./lines.js";

/**
 * **The fault waves' hints** — THE LEECH to THE FLIP: a control taken, turned
 * or traded under the pair. Written as `standard-2.ts` says. A fault that comes
 * part-way in is taught once it has, so a line about it holds while it is in
 * force (`faultOn`), and the lesson counts the bodies that came after it
 * (`HINTS_ABOUT`). Where a screen is shown something false or nothing at all
 * — the dark, a folded field, a swapped key — no ring stands on the body or
 * on a colour, which would say what the screen is kept from.
 */

/** THE LEECH: it holds the cannon, and a cannon left in one column loses the wave. */
export const LEECH_HINTS: readonly HintLine[] = [
  { seat: 1, when: "faultOn", text: "MOVE IT A COLUMN EVERY BEAT", anchor: CANNON },
  { seat: 1, when: "faultOn", text: "PARKING IT LOSES THE WAVE", anchor: CANNON, acts: false },
  { seat: 2, when: "faultOn", text: "SAY: MOVE THE CANNON!", anchor: CANNON, acts: false },
  { seat: 2, when: ["faultOn", "onColumn"], text: "FIRE ITS COLOUR AS IT PASSES", anchor: FIRE },
];

/** THE CHOKE: nobody steers; only player 1 is shown where it walks next. */
export const CHOKE_HINTS: readonly HintLine[] = [
  { seat: 1, text: "THE LIGHT IS WHERE IT GOES", anchor: CANNON, acts: false },
  { seat: 1, when: "offColumn", text: "CALL IT AS IT COMES UNDER", anchor: CANNON, acts: false },
  { seat: 2, when: "onColumn", text: "FIRE ITS COLOUR NOW", anchor: FIRE },
  { seat: 2, when: "offColumn", text: "NOBODY STEERS · WAIT FOR IT", anchor: CANNON, acts: false },
];

/** THE DARK: the field goes out, and a finger dragged across it lights it. */
export const DARK_HINTS: readonly HintLine[] = [
  { seat: 1, when: "faultOn", text: "DRAG A FINGER TO LIGHT IT", anchor: CANNON },
  { seat: 1, when: "faultOn", text: "UNLIT, IT HITS THE SHIP", anchor: CANNON, acts: false },
  { seat: 2, when: "faultOn", text: "FIRE WHAT THE LIGHT FINDS", anchor: CANNON },
];

/**
 * THE COIL: the shield arms itself, a dome opens where it stands once the
 * column under it is clear, and player 1 is shown where the spark jumps.
 */
export const COIL_HINTS: readonly HintLine[] = [
  { seat: 1, text: "THE SHIELD ARMS ITSELF", anchor: GUARD, acts: false },
  { seat: 1, text: "SAY WHERE THE SPARK JUMPS", anchor: BODY, acts: false },
  { seat: 2, text: "PARK THE SHIELD IN ITS PATH", anchor: SHIELD },
  tell(2, "A ROCK BELOW HOLDS IT SHUT"),
];

/** THE JAM: the gun fires by itself up the cannon's column, red and cyan by turns. */
export const JAM_HINTS: readonly HintLine[] = [
  { seat: 1, when: "faultOn", text: "IT FIRES BY ITSELF · AIM IT", anchor: CANNON },
  { seat: 1, when: "faultOn", text: "NEVER STAND UNDER A LURE", anchor: CANNON },
  {
    seat: 2,
    when: "faultOn",
    text: "NO TRIGGER · COUNT ALOUD",
    anchor: { at: "control", control: "fireRed" },
    acts: false,
  },
  { seat: 2, when: "faultOn", text: "CALL EACH COLOUR IT LOADS", anchor: CANNON, acts: false },
];

/** THE CODEX: the key turns, and only player 1 is shown when red kills cyan. */
export const CODEX_HINTS: readonly HintLine[] = [
  { seat: 1, when: "swapped", text: "SWAPPED · SAY THE OTHER ONE", anchor: BODY, acts: false },
  { seat: 1, when: "plain", text: "TRUE NOW · SAY ITS COLOUR", anchor: BODY, acts: false },
  { seat: 1, when: "offColumn", text: "MOVE CANNON UNDER ENEMY", anchor: CANNON },
  { seat: 2, when: "onColumn", text: "FIRE WHAT PLAYER 1 SAYS", anchor: BODY },
  { seat: 2, when: "offColumn", text: "WAIT FOR THE CANNON", anchor: CANNON, acts: false },
];

/**
 * THE HANDOVER: for a while the panels trade phones. A line's seat is the
 * panel's, which goes with it (`render/handover.ts`), so player 1's lines are
 * on the phone holding the strip — the other person's, while it is traded.
 */
export const HANDOVER_HINTS: readonly HintLine[] = [
  { seat: 1, when: ["faultOn", "offColumn"], text: "YOU MOVE THE CANNON NOW", anchor: CANNON },
  { seat: 1, when: ["faultOn", "onColumn"], text: "SAY: FIRE!", anchor: CANNON, acts: false },
  { seat: 2, when: ["faultOn", "onColumn"], text: "YOU FIRE NOW · ITS COLOUR", anchor: FIRE },
  { seat: 2, when: ["faultOn", "offColumn"], text: "SAY WHERE IT IS", anchor: BODY, acts: false },
];

/** THE FLIP: player 1's field turns into its mirror, and player 2's stays true. */
export const FLIP_HINTS: readonly HintLine[] = [
  { seat: 1, when: "faultOn", text: "YOUR FIELD IS A MIRROR NOW", anchor: CANNON, acts: false },
  { seat: 1, when: "faultOn", text: "GO WHERE YOU ARE TOLD", anchor: CANNON },
  { seat: 2, when: "faultOn", text: "YOURS IS TRUE · SAY COLUMNS", anchor: BODY, acts: false },
  { seat: 2, when: ["faultOn", "onColumn"], text: "FIRE ITS COLOUR NOW", anchor: FIRE },
];
