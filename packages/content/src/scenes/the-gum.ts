import type { GuideScene } from "../scene-types.js";

/**
 * THE GUM's rehearsal: a thumb on it, a flick sideways, and it is gone —
 * and, on a second drop nobody touches, what it does to the ship.
 *
 * What the pair has to learn is that this one is nobody's control and either
 * seat's hand: a swipe on the drop itself, left or right, and it flies out
 * of the field along its row. Both read off the picture: a thumb resting on
 * the first drop through most of a page while it goes on falling under the
 * finger (THE CAIRN's opening, for THE CAIRN's reason — a still thumb moves
 * nothing), then the same thumb carried right and the drop leaving by the
 * right wall. The second drop comes down with no hand on it and lands, and
 * the last page is the splash across the ship, which is the wave's sentence.
 *
 * **One gum at a time**, for THE CRYSTAL's reason: the wave sends three with
 * plain bodies between them, and the film is about the swipe and the price.
 * The second is authored to arrive once the first is off the field, so no
 * page has two drops on it and the eye is never asked which one.
 *
 * 120 to the minute, so both falls fit a film. The carry is authored on the
 * hold that is already running, THE HAND's arrangement, and `dir` rather
 * than a distance: how far a swipe is is `cfg.gripPushMilli`'s twin
 * (`sim/config-gum.ts`), read off the config by `scene-drag.ts`. The ghost
 * hand is the pilot's because `dragSeat` reads every carry as the pilot's;
 * the caption says the other seat could have done the same.
 */
export const THE_GUM: GuideScene = {
  ticks: 2040,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 1, kind: "gum", color: null },
    { beat: 15, col: 5, kind: "gum", color: null },
  ],
  acts: [
    // Half a beat after the page opens, so the page points at what is held.
    { tick: 450, grip: 1, col: 1, until: 720 },
    // The same hand, still down, carried right: the flick.
    { tick: 600, drag: "gripBody", dir: 1, by: 660, until: 720 },
  ],
  steps: [
    // Seven beats of fall, so the drop is around the middle of the screen
    // when the page comes to rest.
    { tick: 0, seat: 1, text: "NO SHOT TOUCHES IT", anchor: { at: "body" } },
    { tick: 420, seat: 2, text: "A STILL THUMB MOVES NOTHING", anchor: { at: "held" } },
    { tick: 660, seat: 1, text: "EITHER OF YOU · SWIPE IT OUT", anchor: { at: "held" } },
    { tick: 900, seat: 2, text: "NOBODY TAKES THIS ONE", anchor: { at: "body" } },
    // Fourteen beats after it appeared it is standing on the hull, and a beat
    // later the ship has taken it; the splash runs out over the page.
    { tick: 1740, seat: 1, text: "IT SPLASHES ACROSS THE SHIP", anchor: { at: "hit" } },
  ],
};
