import type { GuideScene } from "../scene-types.js";

/**
 * THE SPOOL's rehearsal: a brake held at the wrong depth, a word from the
 * other screen, and the same brake held at the right one.
 *
 * The whole fight is one control and one number nobody is shown whole
 * (`sim/spool.ts`): the pilot has the brake and sees nothing of the rate, the
 * navigator sees how much line should be out against how much is and cannot
 * touch it. So the film is the one exchange the fight is made of, played
 * once wrong and once right — **shallow, too fast, slower, deeper, a rib**.
 *
 * **The seed decides the numbers and the acts are written against them.**
 * Each movement's rate is rolled off the rng (`spool-step.ts`), and this
 * seed's first two are 84 and 70 thousandths a beat. The pilot takes the
 * brake at the very top, where it pays at the fast end, 120, and the line
 * gains 36 a beat on where it should be — inside the zone through the grace
 * and three beats past it, and out on the sixth, so the first movement slips.
 * That is the first movement's slip and costs nothing but the movement
 * (`slipLine`), which is the one place in the fight a pair is allowed to
 * find the gesture by holding it wrong, so the film spends it on exactly that.
 * The second movement is met at 520 deep, 68 a beat against 70, and held
 * the whole leg: the rib eases.
 *
 * **One hand, taken once and never let go between.** The two acts meet on
 * one tick and the release is spelled before the grab (`sceneScript` sorts
 * stably), so the knob goes from the top straight down — a carry, not a hand
 * that let go and took hold again, which on this boss would be the fastest
 * line of all for no reason the page says.
 *
 * **No page says `HOLD`.** That word is the cue on the knob while a movement
 * pays and nobody has the brake (`render/boss-cue-read-za.ts`), and the hand
 * here is on the brake before the first zone opens, so the cue never stands
 * and no page teaches it. What the pages carry is what no cue says: whose
 * screen shows what, the word one seat says to the other, and which way the
 * knob goes for it. The rock that a later slip throws is prose — the first
 * movement is spared it, and a second slip to show it would be a film about
 * getting it wrong twice.
 */
export const THE_SPOOL: GuideScene = {
  ticks: 1320,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "spool" },
  acts: [
    // Taken at the top, a beat and a half into the first page and before the
    // zone opens: the fastest a held brake runs.
    { tick: 90, drag: "spoolBrake", toMilli: 0, until: 630 },
    // And carried down in the slip, before the second movement opens; let go
    // in the ease, where nothing pays, so the loop ends before a zone opens
    // on a brake nobody holds.
    { tick: 630, drag: "spoolBrake", toMilli: 520, by: 690, until: 1300 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "THE BRAKE IS YOURS",
      anchor: { at: "handle", target: "spoolBrake" },
    },
    {
      tick: 180,
      seat: 1,
      text: "SHALLOW LETS IT RUN FAST",
      anchor: { at: "handle", target: "spoolBrake" },
    },
    { tick: 360, seat: 2, text: "TOO MUCH LINE · SAY SLOWER", anchor: { at: "boss" } },
    {
      tick: 540,
      seat: 1,
      text: "SLOWER · CARRY IT DEEPER",
      anchor: { at: "handle", target: "spoolBrake" },
    },
    { tick: 900, seat: 2, text: "IN THE BAND · A RIB EASES", anchor: { at: "boss" } },
  ],
};
