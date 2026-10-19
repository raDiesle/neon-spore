import type { HintLine } from "../hint-types.js";
import { aimAndFire, BODY, CANNON, FIRE, HELD, tell } from "./lines.js";

/**
 * **The two-button waves' hints, first half** — CYAN to THE MAGNET, played on
 * STANDARD 2 (cannon, red, cyan). Each is its film's pages said on the live
 * field (`docs/spec/briefings.md`): the film's words where they were already
 * an instruction, and turned into one where they were a narration.
 *
 * **A line never tells a seat what it is not shown.** Where only one screen
 * sees the colour, the other seat's lines stand on the cannon or the body,
 * never on a fire button, which would say the colour by ringing it.
 */

/** CYAN: the second button, and the first being wasted on it. */
export const CYAN_HINTS: readonly HintLine[] = aimAndFire({
  say: "TELL PLAYER 2: CYAN!",
  fire: "FIRE CYAN · RED IS WASTED",
});

/** THE ECHO: the slowest thing on the field, taken before it divides. */
export const ECHO_HINTS: readonly HintLine[] = [
  tell(1, "IT SPLITS WHILE IT FALLS"),
  ...aimAndFire({ move: "BE UNDER IT EARLY", fire: "FIRE WHILE IT IS STILL ONE" }),
];

/** THE STRAND: player 2 sees which bead is lit, player 1 its colour. */
export const STRAND_HINTS: readonly HintLine[] = [
  tell(2, "ONE BEAD IS LIT · SAY WHICH"),
  tell(1, "SAY THE LIT BEAD'S COLOUR"),
  { seat: 1, text: "CANNON UNDER THE LIT BEAD", anchor: CANNON },
  { seat: 2, text: "FIRE THE COLOUR YOU HEARD", anchor: CANNON },
];

/** THE VEIL: player 1 sees inside the cloud, and what is inside turns. */
export const VEIL_HINTS: readonly HintLine[] = [
  tell(1, "SAY THE COLOUR INSIDE"),
  { seat: 1, when: "offColumn", text: "MOVE CANNON UNDER IT", anchor: CANNON },
  tell(2, "ASK THE COLOUR · IT TURNS"),
  { seat: 2, when: "onColumn", text: "ASK AGAIN, THEN FIRE", anchor: CANNON },
];

/** THE THIRD SHOT: a shell in two pieces, then the body's own colour. */
export const THIRD_SHOT_HINTS: readonly HintLine[] = [
  tell(1, "SHELL · A PIECE EACH SIDE"),
  { seat: 1, text: "ONE PIECE, ONE COLUMN", anchor: CANNON },
  { seat: 2, text: "ANY COLOUR CHIPS ONE OFF", anchor: { at: "control", control: "fireRed" } },
  { seat: 2, text: "ITS OWN COLOUR FINISHES IT", anchor: FIRE },
];

/** HOLD AND AIM: a hand on the body aims the shot, so the cannon stays. */
export const HOLD_AND_AIM_HINTS: readonly HintLine[] = [
  { seat: 1, when: "free", text: "HOLD THE ENEMY WITH A FINGER", anchor: BODY },
  { seat: 1, when: "held", text: "KEEP HOLDING · CANNON STAYS", anchor: HELD },
  { seat: 1, when: "held", text: "TELL PLAYER 2: FIRE!", anchor: HELD, acts: false },
  { seat: 2, when: "held", text: "FIRE · THE SHOT GOES TO IT", anchor: FIRE },
  { seat: 2, when: "free", text: "WAIT FOR THE HOLD", anchor: BODY, acts: false },
];

/** THE MAGNET: never from under it — from the side, through the hand. */
export const MAGNET_HINTS: readonly HintLine[] = [
  { seat: 1, when: "onColumn", text: "NEVER STAND UNDER IT", anchor: CANNON },
  { seat: 1, when: ["offColumn", "free"], text: "STAND ASIDE AND HOLD IT", anchor: BODY },
  { seat: 1, when: "held", text: "TELL PLAYER 2: FIRE!", anchor: HELD, acts: false },
  { seat: 2, when: "held", text: "THE SHOT HITS THE NEAR POLE", anchor: HELD, acts: false },
  { seat: 2, when: "held", text: "FIRE THE NEAR POLE'S COLOUR", anchor: HELD },
  { seat: 2, when: "free", text: "WAIT FOR THE HOLD", anchor: BODY, acts: false },
];
