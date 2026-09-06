import type { GuideScene } from "../scene-types.js";

/**
 * THE CUT's rehearsal: a wall with no way through, and the crack that is the
 * only place a shot goes through it.
 *
 * A fence with no gaps used to be cuttable anywhere — point the cannon at the
 * dome, fire, done — which made the wall with no answer the easiest one in the
 * game. The owner replaced it with a breaking point: *instead there is a
 * crack, in the colour of a slick or a bulb, immediately visible for player 1.
 * Related to colour, the cannon breaks the crack. Only on this position can
 * you shoot the cannon and break through.*
 *
 * That turns one thumb into three hands. The crack is drawn on the pilot's
 * screen alone, the cannon under it is the pilot's to slide, and both triggers
 * belong to the navigator — so the pilot has to say **a column and a colour**,
 * and the navigator has to load the one that was said. Neither of them opens
 * the wall alone, and a wall nobody opens lands on the ship.
 *
 * Three pages, one wall each, and each page is one of the three things that
 * have to happen in order: see it, get under it, fire the colour it wants.
 * Nothing here is about finding a gap, because there is not one — that is THE
 * FENCE and THE GAP, two waves earlier, and a film that taught both answers at
 * once would teach neither.
 */
export const THE_CUT: GuideScene = {
  ticks: 1860,
  bpm: 120,
  seed: 1,
  // Solid walls, cracked red in the middle column — which is where the dome
  // and the cannon both already stand, so the film is about the *order* the
  // two hands go in rather than about crossing the field under a falling wall.
  entries: [
    { beat: 1, col: 3, kind: "fence", color: null, gaps: [], cracksRed: [3] },
    { beat: 11, col: 3, kind: "fence", color: null, gaps: [], cracksRed: [3] },
    { beat: 21, col: 3, kind: "fence", color: null, gaps: [], cracksRed: [3] },
  ],
  // The cannon first and the trigger after it, on every page: a bolt fired
  // before the muzzle is under the crack is a shot spent on solid wire, and
  // the order is the thing the pair has to get right.
  acts: [
    { tick: 240, control: "cannon", col: 3 },
    { tick: 360, control: "fireRed" },
    { tick: 840, control: "cannon", col: 3 },
    { tick: 960, control: "fireRed" },
    { tick: 1440, control: "cannon", col: 3 },
    { tick: 1560, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "NO GAP HERE, ONLY A CRACK", anchor: { at: "body" } },
    {
      tick: 600,
      seat: 1,
      text: "PLAYER 1 TAKES THE CRACK",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1200,
      seat: 2,
      text: "PLAYER 2 FIRES ITS COLOUR",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
