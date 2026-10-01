import type { GuideScene } from "../scene-types.js";

/**
 * THE UNDERTOW's rehearsal: the floor bows, a lobe stands, and its colour says
 * who answers it.
 *
 * Rewritten for the rework of 1 October 2026, which asked the film for four
 * things and nothing else: the shield under a shield-coloured lobe, SUCK with
 * the cannon under a yellow one, a tall lobe tapped back down, and the burst
 * that loses the wave. Nobody is unseated any more and there is no pin, so the
 * pages that taught either went with them.
 *
 * Nothing falls in it. The boss is a fixture in the hull and the field stays
 * empty, so the film is three lobes in the order the fight raises them: the
 * first shield-coloured — player 2 slides the shield under it while it is
 * still bowing and player 1 arms it once it stands (`undertowAnswers`); the
 * second yellow, with the cannon slid under the bow and SUCK opened once it
 * stands; the third left alone. It grows tall after `undertowStandBeats`,
 * player 2 taps it back down (`undertowTapped`), it grows tall again, and
 * nobody taps it, so it bursts — the one page that says what a mistake costs.
 *
 * Where a lobe comes up is the seeded rng's and not an author's, so the
 * shield and cannon acts say `atBoss` (`bossAnswerCol` reads the first lobe
 * when the thumb goes down) and the tap is resolved by the runner onto the
 * tall lobe (`sim/scene-aim.ts`). The seed is 18 because it raises a
 * shield-coloured lobe first and a yellow one second, the order the pages
 * teach, and puts the third in a column away from the cannon, so nothing
 * answers it by accident.
 */
export const THE_UNDERTOW: GuideScene = {
  ticks: 2940,
  bpm: 120,
  seed: 18,
  entries: [],
  boss: { kind: "undertow" },
  acts: [
    { tick: 150, control: "shield", col: 3, atBoss: true },
    { tick: 400, control: "guard" },
    { tick: 600, control: "cannon", col: 3, atBoss: true },
    { tick: 840, control: "intake" },
    { tick: 1710, drag: "undertowTap", hand: 2, until: 1720 },
  ],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "CYAN LOBE · SHIELD UNDER IT",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 RAISES THE SHIELD",
      anchor: { at: "control", control: "guard" },
    },
    {
      tick: 480,
      seat: 1,
      text: "YELLOW · CANNON UNDER IT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 720,
      seat: 1,
      text: "SUCK TAKES A YELLOW LOBE",
      anchor: { at: "control", control: "intake" },
    },
    { tick: 1140, seat: 2, text: "LEFT STANDING · IT GROWS", anchor: { at: "boss", part: "lobe" } },
    {
      tick: 1620,
      seat: 2,
      text: "TALL · PLAYER 2 TAPS IT DOWN",
      anchor: { at: "boss", part: "lobe" },
    },
    { tick: 2160, seat: 2, text: "TALL AGAIN · NOBODY TAPS", anchor: { at: "boss", part: "lobe" } },
    { tick: 2640, seat: 1, text: "IT BURSTS · THE WAVE IS LOST", anchor: { at: "hit" } },
  ],
};
