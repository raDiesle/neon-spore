import type { GuideScene } from "../scene-types.js";

/**
 * THE COIL's rehearsal: the shield is stuck open, and the lane decides.
 *
 * **The fault and the creature are one lesson, not two.** The shield arming
 * itself every beat is what makes a coil hard: a dome comes off wherever the
 * plate is standing while the shield is armed, and on this wave it is always
 * armed — so the plate has stopped being a thing player 2 *aims* and become a
 * thing that is standing somewhere. A film played without the fault would show
 * a pair of controls behaving, which is the one thing this wave is not.
 *
 * **And the ward only reaches as far as it can see** (`coilWardReaches`). A
 * body falling in the lane between the plate and a dome takes the whole reach,
 * so the dome is not opened, not lit and not touched. That is the half a pair
 * cannot guess: it is a rule about *nothing happening*, and nothing happening
 * is exactly what a rehearsal is for.
 *
 * So the film is one press and three arrivals. She slides into the rock's
 * column and stays there; everything after that is the field coming to her.
 *
 * 1. Player 1 watches the dome come up with nobody pressing anything. GUARD is
 *    dead on his panel and stays dead — the whole wave, for him, is the bolt
 *    and the calling.
 * 2. The coil crosses her column with the rock still falling between them, and
 *    **nothing happens at all**. This is the page that cannot be taught any
 *    other way.
 * 3. Her own shield turns the rock away — she never asked for that either —
 *    and the lane is clear. The coil goes to the wall, turns, comes back, and
 *    this time the dome comes off, because there is nothing left in the way.
 * 4. What came out ran for the wall furthest from her and landed there. The
 *    shared page last, at the bar, where the price is.
 */
export const THE_COIL: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  malfunction: { kind: "shield" },
  entries: [
    { beat: 0, col: 6, kind: "coil", color: null },
    // In the column the plate is going to stand in, timed so that it is
    // somewhere between the two on the beat the dome crosses — which is the
    // whole of the second page. Three rows a beat is the slowest tier that
    // gets there and is answered inside one.
    { beat: 4, col: 1, kind: "meteorFast", color: null },
  ],
  // One press in the whole film, and it is not a trigger. She goes to the
  // column the rock is in and stays there; everything after that is the field
  // arriving at her.
  acts: [{ tick: 300, control: "shield", col: 1 }],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "THE SHIELD ARMS ITSELF",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 210, seat: 2, text: "A ROCK BELOW HOLDS IT SHUT", anchor: { at: "body" } },
    { tick: 570, seat: 2, text: "THE LANE CLEARS, IT OPENS", anchor: { at: "body" } },
    { tick: 870, seat: 1, text: "THE HULL PAYS FOR THE DOME", anchor: { at: "health" } },
  ],
};
