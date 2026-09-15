import type { GuideScene } from "../scene-types.js";

/**
 * THE LEAK's rehearsal: the thumb stays down and the ring never closes.
 *
 * The wave takes no button away — every one of them still works, and a tap is
 * the bolt it always was. What is gone is the **hold**: the cannon lobe fills
 * nothing all wave, because the wave is played on STANDARD 5, the rung whose
 * hold fills nothing (`sim/lance.ts`, `content/control-sets-table.ts`). Prose
 * can say that, and the wave's three strings do.
 * What prose cannot do is show it, because the whole of it is two pictures a
 * sentence turns into one — a ring that does not close under a thumb that is
 * not moving, and then the same thumb lifting with an ordinary bolt going out.
 * Read as one, that is a dead trigger. Watched in that order, it is a lost
 * weapon on a panel that is working, which is the wave.
 *
 * **The film quotes THE LANCE's, and it is meant to be read beside it.** The
 * same three cyan in column two on beats nought, one and two; the same slide
 * under them before anything else; the same page one, in the same words. What
 * the pair is being shown is an absence, and an absence is only visible
 * against the shape it is missing from — a new figure here would have made
 * this a rehearsal about a new problem rather than about a missing answer,
 * which is the argument `waves/act-9.ts` already makes about the wave itself.
 *
 * Four pages, and the middle two are the whole of it. She holds from beat six,
 * and the page stands until beat nine and a half — past beat nine, which is
 * where `lancePrimeBeats` would have had the lobe full and the column alight.
 * Nothing happens, and the page is long enough that nothing happening is the
 * thing being watched rather than a delay. Then the lift, and one bolt: the
 * simulation owes it, because the press starts a hold and the lift fires the
 * shot the thumb was always owed, and a fault that swallowed the press would
 * have been a dead trigger after all.
 *
 * The last page is his, and it is the arithmetic the first three add up to —
 * three bodies is three taps now, so the column he is standing in is one he
 * will be standing in for a while, and the next one has to be said early. That
 * is the pilot's half of the wave (`waves/act-9.ts`'s `p1` string), and the
 * two taps under it are what it costs.
 */
export const THE_LEAK: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  // Nothing is authored here about the lobe, and that is the change of 15
  // September 2026: this used to carry `malfunction: { kind: "leak" }`, and the
  // fact is the *panel's* now — `sceneScript` reads it off the wave being
  // rehearsed, so a film of this wave fills nothing without an author having
  // remembered to say so (`content/scene-script.ts`).
  entries: [
    { beat: 0, col: 2, color: "cyan" },
    { beat: 1, col: 2, color: "cyan" },
    { beat: 2, col: 2, color: "cyan" },
  ],
  acts: [
    // THE LANCE's own opening, to the tick: under the column before anything
    // else, because a slide afterwards is what would reset a fill — on a wave
    // where there is no fill to reset, and the pair does not know that yet.
    { tick: 90, control: "cannon", col: 3 },
    { tick: 120, control: "cannon", col: 2 },
    // Five beats down, where three would have been a lance. The lift is the
    // next page's picture, so it lands a beat and a half after that page opens.
    { tick: 360, control: "fireCyan", until: 660 },
    // And the two the one bolt did not take.
    { tick: 840, control: "fireCyan" },
    { tick: 930, control: "fireCyan" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "GET UNDER THEM FIRST",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 240,
      seat: 2,
      text: "HOLD IT · NOTHING FILLS",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 570,
      seat: 2,
      text: "LET GO AND IT FIRES ONCE",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 750,
      seat: 1,
      text: "THREE CYAN IS THREE SHOTS",
      anchor: { at: "control", control: "cannon" },
    },
  ],
};
