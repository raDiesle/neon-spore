import type { HintLine } from "../hint-types.js";
import { BODY, CANNON, FIRE, SECRET, tell } from "./lines.js";

/**
 * **The touch waves' hints** — the blisters, and the bodies answered by a
 * finger on the field rather than a button: THE BLISTER to THE CHOIR. Written
 * as `standard-2.ts` says. A blister in these waves is either seat's
 * (`blisterByOf`), drawn swelling on both screens, so both are told the
 * gesture, and that one of them has to say it is theirs.
 */

/** A blister wave: both seats told `verb`, on the blister, and to say who takes it. */
function blister(verb: string): HintLine[] {
  return ([1, 2] as const).flatMap((seat): HintLine[] => [
    { seat, text: verb, anchor: SECRET },
    { seat, text: "EITHER OF YOU: SAY WHO", anchor: SECRET, acts: false },
  ]);
}

export const BLISTER_HINTS: readonly HintLine[] = blister("WHEN IT RISES, DO AS IT SAYS");
export const TAP_BLISTERS_HINTS: readonly HintLine[] = blister("TAP IT WHEN IT RISES");
export const HOLD_BLISTERS_HINTS: readonly HintLine[] = blister("PRESS AND HOLD IT A BEAT");
export const SWIPE_BLISTERS_HINTS: readonly HintLine[] = blister("SWIPE THE WAY ITS ARROW SAYS");
export const TURN_BLISTERS_HINTS: readonly HintLine[] = blister("DRAG IT ROUND, A FULL TURN");
export const RUB_BLISTERS_HINTS: readonly HintLine[] = blister("RUB IT TILL IT GIVES");
export const COMBO_BLISTERS_HINTS: readonly HintLine[] = blister("TAP IT, THEN SWIPE IT");
export const LEVER_BLISTERS_HINTS: readonly HintLine[] = blister("PULL ITS KNOB DOWN · HOLD IT");

/** THE WEIGHT: one blister neither seat can knock down alone. */
export const HOLD_TOGETHER_HINTS: readonly HintLine[] = [
  { seat: 1, text: "HOLD IT · PLAYER 2 TOO", anchor: SECRET },
  { seat: 2, text: "HOLD IT · PLAYER 1 TOO", anchor: SECRET },
  tell(1, "BOTH ON ONE BEAT · IT GOES"),
  tell(2, "LEFT ALONE, IT ENDS THE WAVE"),
];

/** THE BEATBOX: only player 1 sees its number, and player 2 taps it out. */
export const BEATBOX_HINTS: readonly HintLine[] = [
  tell(1, "ONLY YOU SEE ITS NUMBER"),
  tell(1, "COUNT THE TAPS · SAY STOP"),
  { seat: 2, text: "TAP IT ONCE A BEAT", anchor: BODY },
  tell(2, "STOP WHEN YOU HEAR STOP"),
];

/**
 * THE MINE: one seat sees it, and the other presses its square. The first mine
 * is player 2's to see, and it has gone off or been pressed before the second
 * comes, so that is the split the lesson has.
 */
export const MINE_HINTS: readonly HintLine[] = [
  { seat: 2, when: "seesIt", text: "ONLY YOU SEE IT · SAY SQUARE", anchor: SECRET, acts: false },
  { seat: 1, when: "toldIt", text: "PRESS THE SQUARE YOU HEAR", anchor: { at: "hit" } },
];

/** THE BALLOON: no shot touches it; a handle each, held together. */
export const BALLOON_HINTS: readonly HintLine[] = [
  tell(1, "NO SHOT TOUCHES IT"),
  { seat: 1, text: "PULL THE LEFT HANDLE", anchor: { at: "handle", target: "balloonLeft" } },
  { seat: 2, text: "PULL THE RIGHT HANDLE", anchor: { at: "handle", target: "balloonRight" } },
  tell(2, "BOTH HOLD TILL IT GIVES"),
];

/** THE LID: the cannon under it first, then the cord held open. */
export const LID_HINTS: readonly HintLine[] = [
  { seat: 1, when: "offColumn", text: "CANNON FIRST, THEN THE CORD", anchor: CANNON },
  {
    seat: 1,
    when: "onColumn",
    text: "PULL IT AND KEEP PULLING",
    anchor: { at: "handle", target: "lidString" },
  },
  { seat: 2, text: "FIRE WHILE THEY ARE OPEN", anchor: FIRE },
];

/** THE CHOIR: player 1 shakes it loose, and both rub its middle. */
export const CHOIR_HINTS: readonly HintLine[] = [
  { seat: 1, text: "SHAKE THE PHONE", anchor: BODY },
  { seat: 2, text: "FIRE ITS COLOUR", anchor: FIRE },
  { seat: 1, text: "RUB THE MIDDLE · BOTH OF YOU", anchor: BODY },
  { seat: 2, text: "RUB THE MIDDLE · BOTH OF YOU", anchor: BODY },
  tell(1, "HALF A RUB LOSES THE WAVE"),
];
