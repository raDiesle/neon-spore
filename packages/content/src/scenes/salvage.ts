import type { GuideScene } from "../scene-types.js";

/**
 * SALVAGE's rehearsal: shooting something is only half of getting it.
 *
 * A pod is the one thing on the field that is neither a body nor a shot. It
 * hangs where it was left, a shot of either colour knocks it loose, and from
 * there it is a burning wreck that sinks and drifts — and the two halves of
 * catching one are on different phones. She frees it; he chases it and opens
 * the maw under it. Miss and nothing is punished: the pod simply breaks on the
 * skin, which is why this is the wave where a pair learns that some things are
 * worth going to get.
 *
 * **The last page is one page and not two**, and that is what the wave is. The
 * chase and the maw are a single moment — a wreck crosses the field in under
 * two seconds — so a film that gave the slide its own page and the mouth
 * another would be teaching a tempo the wave does not have. The hand slides
 * and presses inside one caption, which is what a thumb really does here.
 *
 * The homing is the simulation's and not a convenience: a wreck within
 * `podHomeTiles` of the hull walks toward whichever column the cannon is
 * standing in (`sim/pods.ts`). So being roughly right in time beats being
 * exactly right too late, and the film shows that rather than a cannon parked
 * on a number.
 */
export const SALVAGE: GuideScene = {
  ticks: 840,
  bpm: 120,
  seed: 1,
  // No arrivals at all. Everything else in the game is falling at the pair;
  // this is the one wave whose subject is standing still and waiting to be
  // fetched, and a body in the same film would be the thing the eye followed.
  entries: [],
  pods: [{ beat: 0, col: 3, row: 3 }],
  acts: [
    { tick: 370, control: "fireRed" },
    { tick: 540, control: "cannon", col: 4 },
    { tick: 570, control: "cannon", col: 4 },
    { tick: 600, control: "intake" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "POD · IT MENDS THE SHIP", anchor: { at: "pod" } },
    {
      tick: 280,
      seat: 2,
      text: "PLAYER 2 SHOOTS IT LOOSE",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 480,
      seat: 1,
      text: "CHASE IT · OPEN THE MAW",
      anchor: { at: "control", control: "intake" },
    },
  ],
};
