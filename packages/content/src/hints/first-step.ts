import type { HintLine } from "../hint-types.js";

const CANNON = { at: "ship", control: "cannon" } as const;

/**
 * FIRST STEP: a column and a colour, one per person — the lesson its film
 * taught, on the real enemy.
 *
 * While the cannon is not under it, player 1 is told to move it and player 2
 * to wait; once it is, player 2 is told to fire and player 1 to say so, out
 * loud. Talking is the control scheme, and the first thing the game teaches
 * is that one of them has to tell the other. Both of player 1's lines stand on
 * the cannon, and the film's companion ring comes up round the body over it
 * the moment there is one (`render/guide-tide-companion.ts`) — so *under* is
 * shown as well as said.
 */
export const FIRST_STEP_HINTS: readonly HintLine[] = [
  { seat: 1, when: "offColumn", text: "MOVE CANNON UNDER ENEMY", anchor: CANNON },
  { seat: 1, when: "onColumn", text: "TELL PLAYER 2: FIRE!", anchor: CANNON, acts: false },
  {
    seat: 2,
    when: "onColumn",
    text: "FIRE RED NOW",
    anchor: { at: "control", control: "fireRed" },
  },
  { seat: 2, when: "offColumn", text: "WAIT FOR THE CANNON", anchor: CANNON, acts: false },
];
