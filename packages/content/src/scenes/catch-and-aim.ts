import type { GuideScene } from "../scene-types.js";

/**
 * CATCH AND AIM's rehearsal: the hand aims, so the cannon does not have to.
 *
 * THE HAND taught that a finger held on something falling slows it
 * (docs/spec/assists.md 6.4). This is the other half of that gesture, and it
 * belongs to one seat: while **player 1's** hand is on a body, every shot the
 * cannon puts out steers into it from whatever column it left the muzzle in
 * (`sim/lock.ts`). The column stops being something the pair has to say out
 * loud; the colour does not.
 *
 * **The pod is what pins the cannon, and the film has no lesson without it.**
 * Nothing else in this game makes the cannon's *position* matter for anything
 * but a shot: a body can be answered on any beat before it lands, so a pair
 * asked why they did not simply slide the strip would be right. A wreck cannot
 * — it sinks, and it is caught by the maw of a cannon already standing under
 * it (`sim/pods.ts`). So the cannon is on the left because it has to be, the
 * body is on the right because that is where it arrived, and the hand is the
 * only thing that reaches both.
 *
 * **The last page is the cost, and it is the reason this film has four.** A
 * lock takes *every* shot, not the next one — so while the hand is down there
 * is no way to shoot anything else, and the pod cannot be freed until player 1
 * lets go. That is not a wrinkle to be smoothed over in the guide's prose: it
 * is the one thing a pair will get wrong on their first wreck, and it is
 * cheaper to watch it than to read it.
 */
export const CATCH_AND_AIM: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  // One body and one pod, as far apart as seven columns go. Two bodies would
  // make it a wave about keeping up; one is enough to make it a wave about
  // where the shot goes.
  entries: [{ beat: 2, col: 6, color: "cyan" }],
  pods: [{ beat: 0, col: 1, row: 3 }],
  acts: [
    // A beat and a half after the page opens, which is every film's rule: a
    // pair reading "go to the pod" while the cannon is already there has been
    // shown the answer rather than asked the question.
    { tick: 90, control: "cannon", col: 1 },
    // Thirty ticks after its own page, and that is the anchor's exception —
    // `held` has no subject until the hand is down (`the-hand.ts` makes the
    // same allowance for the same reason).
    { tick: 270, grip: 1, col: 6, until: 660 },
    { tick: 480, control: "fireCyan" },
    // And the cost: the hand comes off, and only then will a shot go anywhere
    // but into the body it was holding.
    { tick: 700, control: "fireRed" },
    { tick: 930, control: "intake" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 GOES TO THE POD", anchor: { at: "pod" } },
    { tick: 240, seat: 1, text: "AND HOLDS THE BODY TOO", anchor: { at: "held" } },
    {
      tick: 420,
      seat: 2,
      text: "THE SHOT FINDS HIS HAND",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 620,
      seat: 1,
      text: "LET GO · THEN THE POD",
      anchor: { at: "control", control: "intake" },
    },
  ],
};
