import type { GuideScene } from "../scene-types.js";

/**
 * THE SURGE's rehearsal: three holds on one bulb, and the two that count are
 * the ones both thumbs come off together.
 *
 * A ribbed bulb hangs over the middle with a seam round it, and a thumb on
 * it from either seat charges it a step a beat; two thumbs, two steps. Along
 * the seam are notches, each a mark on a gauge, and the only gesture that
 * counts is **both thumbs off the glass inside one beat of each other with
 * the pressure at the notch** (`sim/surge-hand.ts`). Inside the notch's band
 * it vents and the notch stays open, the bulb a row lower; over the band it
 * bursts and throws gums; under it, or one hand alone, the charge is lost.
 * The pilot sees the band and not the pressure; the navigator the pressure
 * and not the band (`render/view-role-clocks.ts`) — the one boss in the game
 * that is beaten by letting go.
 *
 * **The film is three holds.** The first is the lesson: one thumb, then the
 * other, the field slowing as the pressure comes into the band (`surgeNear`
 * opens THE SLOW), a count, and both off eight ticks apart at the notch —
 * the first notch vents. The second is the mistake: the pilot's thumb off
 * alone, the navigator's still on and the pressure still climbing under it,
 * and when the second lift comes more than a beat later the charge is lost.
 * The third is the first again against the band the vent moved up the
 * gauge, and the second notch vents. Nothing is rolled: the pressure is
 * arithmetic and the band is the notch's, so every lift below is at a
 * number the film can name.
 *
 * **The one handle both seats hold.** `surgeBulb` is one `DragTarget` for
 * either thumb, so each act says whose hand it is (`SceneAct.hand`) — the
 * first film that has to — and the bulb is carried nowhere: the thumb lands
 * and the lift is the gesture, so every carry is one command at its tick.
 * Each thumb is shown by the grip mark on the bulb's flank
 * (`render/surge-grip.ts`), the pilot's at the left, the navigator's at the
 * right, which is how each seat sees the other's come off.
 *
 * **And the two pages the field took over.** The grip marks say `HOLD` to a
 * thumb that is off, which they have since they shipped, and `LIFT` to one that
 * is on inside the band, which is new (`render/surge-word.ts`). So the page that
 * said *thumb on it* was a duplicate before this entry and says what no word on
 * one thumb can instead — the two of them feed one number, and each seat is
 * shown half of the seam — and the page that said *off on his word* says the
 * tolerance. What stays written is everything with a number in it: the
 * count, the band moving up the gauge, the lift alone, the burst. The field
 * says none of those, because the band is the pilot's picture and the pressure
 * is the navigator's, and a word derived from either is one seat's gauge read
 * out on the other's glass.
 *
 * **What is prose.** The burst and its gums, and the eversion at the fifth
 * notch: a burst is a hold gone wrong in the other direction and the film
 * has one wrong hold already, and the gums would put three ordinary bodies
 * on a field about a bulb. The last two pages say both. The film takes no
 * hit and points at no retries.
 */
export const THE_SURGE: GuideScene = {
  ticks: 2040,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "surge" },
  acts: [
    // The lesson: the pilot's thumb, then the navigator's, and both off at
    // 1100 — the first notch is at 900 with a band of 250 either side.
    { tick: 120, drag: "surgeBulb", hand: 1, by: 121, until: 520 },
    { tick: 190, drag: "surgeBulb", hand: 2, by: 191, until: 528 },
    // The mistake: the pilot lets go at 800, the navigator holds on for two
    // beats more, and the second lift is a beat and a half late — lost.
    { tick: 720, drag: "surgeBulb", hand: 1, by: 721, until: 970 },
    { tick: 730, drag: "surgeBulb", hand: 2, by: 731, until: 1100 },
    // And again, at the second notch: 1350, and both off at 1400.
    { tick: 1140, drag: "surgeBulb", hand: 1, by: 1141, until: 1580 },
    { tick: 1150, drag: "surgeBulb", hand: 2, by: 1151, until: 1588 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      // `HOLD` has stood on this seat's own grip mark since the marks shipped
      // (`render/surge-word.ts`), so the opening page says the thing a word on
      // one thumb cannot: the two of them feed one number, and each seat is
      // shown half of the seam.
      text: "BOTH THUMBS FEED ONE GAUGE",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 180,
      seat: 2,
      text: "YOURS TOO · SAY THE NUMBER",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 360,
      seat: 1,
      text: "IT SLOWS · THE BAND · COUNT",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 540,
      seat: 2,
      text: "OFF TOGETHER · A NOTCH OPENS",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 720,
      seat: 1,
      text: "AGAIN · THE BAND IS HIGHER",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 900,
      seat: 1,
      text: "LET GO ALONE · IT IS LOST",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 1080,
      seat: 2,
      text: "ONCE MORE · TOGETHER",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 1260,
      seat: 1,
      text: "WAIT FOR THE SLOW · COUNT",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 1440,
      seat: 2,
      // `LIFT` stands on the mark of whichever thumb is on, so what is left to
      // write is the tolerance — and it was also the one page in this film that
      // named a seat by a pronoun.
      text: "WITHIN A BEAT OF EACH OTHER",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 1620,
      seat: 2,
      text: "OVER THE BAND, IT BURSTS",
      anchor: { at: "handle", target: "surgeBulb" },
    },
    {
      tick: 1800,
      seat: 1,
      text: "FIVE, AND IT TURNS OUT",
      anchor: { at: "handle", target: "surgeBulb" },
    },
  ],
};
