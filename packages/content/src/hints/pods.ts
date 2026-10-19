import type { HintLine } from "../hint-types.js";
import {
  aimAndFire,
  BODY,
  CANNON,
  catchPod,
  FIRE,
  GUARD,
  HELD,
  HUSK,
  INTAKE,
  POD,
  SHIELD,
  tell,
} from "./lines.js";

/**
 * **The pod and maw waves' hints** — SALVAGE to THE LEAK: a pod shot loose
 * and swallowed, and the shots that do something other than kill. Written as
 * `standard-2.ts` says; a pod's lines are `catchPod`'s, said once for all.
 */

/** SALVAGE: a pod, shot loose by one and swallowed under the other's cannon. */
export const SALVAGE_HINTS: readonly HintLine[] = [
  ...catchPod(),
  { seat: 2, when: "podHangs", text: "ITS RING IS ITS CLOCK", anchor: POD, acts: false },
];

/** CATCH AND AIM: a hand on a body takes every shot, so the cannon can wait under the pod. */
export const CATCH_AND_AIM_HINTS: readonly HintLine[] = [
  ...catchPod(),
  {
    seat: 1,
    when: ["free", "podHangs", "podOn"],
    text: "NOW HOLD THE BODY, ANYWHERE",
    anchor: BODY,
  },
  { seat: 2, when: "held", text: "ANY COLUMN · FIRE ITS COLOUR", anchor: FIRE },
  { seat: 1, when: "held", text: "LET GO, OR THE POD STAYS UP", anchor: HELD },
];

/**
 * THE HUSK: one pod is hollow, and only player 2 is shown which — every husk
 * in it is drawn hollow on player 2's screen (`showsHuskMark`).
 */
export const HUSK_HINTS: readonly HintLine[] = [
  ...catchPod("SUCK ONLY THE ONE THEY NAME", "SAY: SUCK IT, OR LEAVE IT"),
  { seat: 2, when: "seesIt", text: "THIS ONE IS HOLLOW · SAY SO", anchor: HUSK, acts: false },
  { seat: 1, when: "toldIt", text: "YOURS LOOK ALIKE · ASK THEM", anchor: POD, acts: false },
];

/** THE MORSEL: a hit only makes it limp, and limp it is the maw's. */
export const MORSEL_HINTS: readonly HintLine[] = [
  { seat: 1, when: ["offColumn", "whole"], text: "MOVE CANNON UNDER IT", anchor: CANNON },
  {
    seat: 1,
    when: ["onColumn", "whole"],
    text: "TELL PLAYER 2: FIRE!",
    anchor: CANNON,
    acts: false,
  },
  { seat: 2, when: ["onColumn", "whole"], text: "HIT IT · IT ONLY GOES LIMP", anchor: FIRE },
  {
    seat: 2,
    when: ["offColumn", "whole"],
    text: "WAIT FOR THE CANNON",
    anchor: CANNON,
    acts: false,
  },
  { seat: 1, when: "limp", text: "LIMP: SUCK IT AS IT LANDS", anchor: INTAKE },
  { seat: 2, when: "limp", text: "TELL PLAYER 1: SUCK!", anchor: BODY, acts: false },
];

/** THE SEEDER: killed, it hangs a pod where it died. */
export const SEEDER_HINTS: readonly HintLine[] = [
  ...aimAndFire({ fire: "KILL IT · IT LEAVES A POD" }),
  tell(1, "ITS POD IS YOURS TO CATCH"),
];

/** THE LANCE: three in one column, and a held trigger is one beam through them. */
export const LANCE_HINTS: readonly HintLine[] = [
  ...aimAndFire({
    move: "CANNON UNDER THE THREE",
    say: "TELL PLAYER 2: HOLD IT",
    fire: "HOLD ITS COLOUR · DON'T TAP",
  }),
  tell(1, "ONE BEAM TAKES ALL THREE"),
];

/** THE LEAK: the same three, and a held trigger fills nothing — one tap, one shot. */
export const LEAK_HINTS: readonly HintLine[] = [
  ...aimAndFire({
    move: "CANNON UNDER THE THREE",
    say: "TELL PLAYER 2: THREE SHOTS",
    fire: "TAP IT ONCE FOR EACH",
  }),
  tell(2, "HOLDING FIRES NOTHING HERE"),
];

/**
 * THE MOULT: rock and pod by turns all the way down, answered as what it is
 * when it lands — and only player 2 is shown what it turns into next.
 */
export const MOULT_HINTS: readonly HintLine[] = [
  { seat: 1, text: "PARK IT · IT COMES TO YOU", anchor: CANNON },
  { seat: 1, when: "cargo", text: "A POD AS IT LANDS: SUCK", anchor: INTAKE },
  { seat: 1, when: "shell", text: "A ROCK AS IT LANDS: SHIELD", anchor: GUARD },
  { seat: 2, when: "shell", text: "A POD NEXT · SAY WHEN", anchor: BODY, acts: false },
  { seat: 2, when: "cargo", text: "A ROCK NEXT · SAY WHEN", anchor: BODY, acts: false },
  { seat: 2, when: ["shell", "shieldOff"], text: "SHIELD UNDER IT, IN CASE", anchor: SHIELD },
];
