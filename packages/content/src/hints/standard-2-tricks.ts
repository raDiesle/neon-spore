import type { HintLine } from "../hint-types.js";
import { aimAndFire, BODY, CANNON, FIRE, tell } from "./lines.js";

/**
 * **The two-button waves' hints, second half** — THE THROB to THE WISP, each
 * a body with one trick, on STANDARD 2. `standard-2.ts` says how they are
 * written; split from it at the length ceiling.
 */

/** THE THROB: red down one side, cyan down the other, and turning. */
export const THROB_HINTS: readonly HintLine[] = [
  { seat: 1, when: "offColumn", text: "MOVE CANNON UNDER IT", anchor: CANNON },
  tell(1, "SAY THE SIDE FACING DOWN"),
  { seat: 2, when: "onColumn", text: "FIRE THE SIDE FACING DOWN", anchor: BODY },
  tell(2, "IT TURNS · ASK AGAIN"),
];

/** THE RECOIL: a hit throws it back a column, in the other colour. */
export const RECOIL_HINTS: readonly HintLine[] = [
  tell(1, "A HIT THROWS IT A COLUMN"),
  tell(2, "AFTER A HIT, IT FLIPS COLOUR"),
  ...aimAndFire(),
];

/** THE GYRE: six on a wheel, right for a beat at a time. */
export const GYRE_HINTS: readonly HintLine[] = [
  tell(1, "SIX ON A TURNING WHEEL"),
  { seat: 1, text: "CANNON WHERE ONE WILL BE", anchor: CANNON },
  tell(2, "AGREE A BEAT OUT LOUD"),
  { seat: 2, text: "FIRE ON THE AGREED BEAT", anchor: CANNON },
];

/** THE LURE: only player 2 sees the frame that says it is not real. */
export const LURE_HINTS: readonly HintLine[] = [
  tell(2, "A FRAME MEANS LURE · SAY SO"),
  { seat: 2, text: "FIRE ONLY AT REAL ONES", anchor: FIRE },
  tell(1, "ASK PLAYER 2 IF IT IS REAL"),
  { seat: 1, text: "MOVE CANNON TO A REAL ONE", anchor: CANNON },
];

/** THE RIND: three layers, so the cannon stays for three shots. */
export const RIND_HINTS: readonly HintLine[] = [
  { seat: 2, when: "onColumn", text: "COUNT THEM DOWN OUT LOUD", anchor: BODY, acts: false },
  ...aimAndFire({ say: "STAY UNDER IT · ALL THREE", fire: "SAME COLOUR, THREE TIMES" }),
];

/** THE DART: only player 2 sees which way it jumps next. */
export const DART_HINTS: readonly HintLine[] = [
  tell(2, "SAY WHICH WAY IT GOES"),
  tell(1, "ASK WHERE IT IS GOING"),
  { seat: 1, text: "STAND WHERE IT IS GOING", anchor: CANNON },
  { seat: 2, when: "onColumn", text: "FIRE ITS COLOUR NOW", anchor: FIRE },
];

/** THE COUNT: only player 1 sees the blades, and it opens on zero. */
export const COUNT_HINTS: readonly HintLine[] = [
  tell(1, "COUNT THE BLADES DOWN ALOUD"),
  { seat: 1, when: "offColumn", text: "MOVE CANNON UNDER IT", anchor: CANNON },
  { seat: 2, text: "FIRE ON ZERO, NOT BEFORE", anchor: FIRE },
  tell(2, "AN EARLY SHOT SHUTS IT"),
];

/**
 * THE GHOST: only player 2 sees it. Player 1's lines hold wherever the cannon
 * is and stand on it, since a line that went away under the ghost, or a ring
 * round it, would say what he is not shown.
 */
export const GHOST_HINTS: readonly HintLine[] = [
  tell(2, "ONLY YOU SEE IT · SAY WHERE"),
  { seat: 2, when: "onColumn", text: "FIRE ITS COLOUR NOW", anchor: FIRE },
  { seat: 2, when: "offColumn", text: "SAY LEFT OR RIGHT", anchor: CANNON, acts: false },
  { seat: 1, text: "ASK WHICH COLUMN IT IS IN", anchor: CANNON, acts: false },
  { seat: 1, text: "MOVE CANNON WHERE YOU HEAR", anchor: CANNON },
];

/** THE WISP: only player 2 sees it, and the square it jumps to next. */
export const WISP_HINTS: readonly HintLine[] = [
  tell(2, "SAY THE SQUARE IT JUMPS TO"),
  { seat: 1, text: "ASK WHERE IT JUMPS NEXT", anchor: CANNON, acts: false },
  { seat: 1, text: "BE THERE BEFORE IT IS", anchor: CANNON },
  {
    seat: 2,
    when: "onColumn",
    text: "EITHER COLOUR KILLS IT",
    anchor: { at: "control", control: "fireRed" },
  },
];
