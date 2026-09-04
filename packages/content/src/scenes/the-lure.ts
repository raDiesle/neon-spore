import type { GuideScene } from "../scene-types.js";

/**
 * THE LURE's rehearsal: the shot you are waiting for must never come.
 *
 * A lure wears another body's contour and its colour, and the only thing that
 * says otherwise is a corner frame that player 2 has and player 1 has not. So
 * the film shows the same body on the two phones, one page each: a target on
 * his screen, a lure on hers. That pair of pages is the wave, and it is the
 * reason the film is on two screens at all — this is the one thing a single
 * device cannot photograph.
 *
 * **The disguise is honest.** It wears a bulb and carries cyan, which is the
 * pairing an ordinary body would have (`kindForColor`), so there is no tell in
 * the picture and nothing for player 1 to have spotted. A lure authored in a
 * colour its shape never comes in would be a trap with the answer written on
 * it.
 *
 * Then the shot that goes nowhere — and it does not merely go nowhere, it
 * costs the hull where it stands — and then the body that was really worth the
 * column. Both are played: `bullet-hit.ts` charges a shot at a lure to the
 * ship, and the real arrival is an ordinary cyan bulb eight beats behind it.
 */
export const THE_LURE: GuideScene = {
  ticks: 1140,
  bpm: 120,
  seed: 1,
  entries: [
    // Column 3 is the middle, which is where the cannon already stands: the
    // first three pages are about *looking*, and a cannon sliding under the
    // decoy would be the film answering its own question early.
    { beat: 0, col: 3, kind: "lure", color: "cyan", wears: "bulb" },
    { beat: 8, col: 5, color: "cyan" },
  ],
  acts: [
    { tick: 510, control: "fireCyan" },
    { tick: 770, control: "cannon", col: 4 },
    { tick: 800, control: "cannon", col: 5 },
    { tick: 900, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "PLAYER 1 SEES A TARGET", anchor: { at: "body" } },
    { tick: 200, seat: 2, text: "PLAYER 2 SEES A LURE", anchor: { at: "body" } },
    // The film's one shared page, spent on the thing neither screen owns: a
    // bolt fired at a lure does not merely miss, it takes the hull for it
    // (`costHull`, `bullet-hit.ts`), two rows up and with no mark left on the
    // ship. That is the whole reason the corner frame is worth reading out
    // loud, and pointing at the bar is the only way to show a cost that leaves
    // nothing behind.
    { tick: 420, seat: 2, text: "FIRING AT IT COSTS HULL", anchor: { at: "health" } },
    {
      tick: 680,
      seat: 1,
      text: "THE REAL ONE IS ELSEWHERE",
      anchor: { at: "control", control: "cannon" },
    },
  ],
};
