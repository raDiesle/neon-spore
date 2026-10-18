import type { GuideScene } from "../scene-types.js";

/**
 * HOLD AND AIM's rehearsal: the hand aims, so the cannon does not have to.
 *
 * THE MAGNET cannot be answered from under it, and the only thing in the game
 * that turns a bolt is player 1's hand held on a body (`sim/lock.ts`). The
 * owner moved THE MAGNET into the arc on 18 October 2026 and asked for the
 * aim to be taught before it, so this is that lesson on its own: CATCH AND
 * AIM's film with the pod taken out, since STANDARD 2 has no maw to catch one
 * with.
 *
 * **The cannon never moves.** The body arrives five columns away from it and
 * is shot from there, which is the whole lesson — the column stops being
 * something the pair has to say out loud, and the colour does not.
 */
export const HOLD_AND_AIM: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  // One body, as far from the cannon as the field goes. Two would make it a
  // wave about keeping up; one is enough to make it a wave about where the
  // shot goes.
  entries: [{ beat: 0, col: 6, color: "cyan" }],
  acts: [
    // Thirty ticks after its own page — `held` has no subject until the hand
    // is down (`catch-and-aim.ts` makes the same allowance for the same
    // reason).
    { tick: 450, grip: 1, col: 6, until: 840 },
    { tick: 660, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THE CANNON IS FAR AWAY", anchor: { at: "body" } },
    { tick: 420, seat: 1, text: "PLAYER 1 HOLDS THE BODY", anchor: { at: "held" } },
    {
      tick: 600,
      seat: 2,
      text: "THE SHOT GOES TO THE HAND",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
