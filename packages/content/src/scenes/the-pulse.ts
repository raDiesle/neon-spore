import { pulseBarSteps, pulseBars } from "../pulse-steps.js";
import type { GuideScene } from "../scene-types.js";

/**
 * THE PULSE's rehearsal: four buttons each, the same four, and two of them
 * arrive as a shape only the other seat can name.
 *
 * Its own four-bar chart rather than the round's own COLD START, which is
 * thirty-two bars and eighty seconds. A rehearsal is a picture of the rules and
 * a stage is a song; what the pair has to be shown here is one arrival pressed
 * on the beat and one arrival named across the room, and that is four bars.
 *
 * The bars are the sparsest shape the notation has — one body, then three
 * beats of nothing — because the mistake this round is built around is waiting
 * to be sure. A page with room in it is what makes *press it as it lands*
 * readable as an instruction rather than as an apology.
 *
 * The last two bars carry the veil, one each way round, which is the whole
 * reason the round needs two people: bar three is grey on the pilot's screen
 * and bar four is grey on the navigator's, so each of them is once the one who
 * has to say a word and once the one who has to take one.
 */
const REHEARSAL_BARS = [
  "S  .  .   .  .  .   .  .  .   .  .  .",
  "B  .  .   .  .  .   .  .  .   .  .  .",
  "M1 .  .   .  .  .   .  .  .   .  .  .",
  "P2 .  .   .  .  .   .  .  .   .  .  .",
];

export const THE_PULSE: GuideScene = {
  ticks: 1320,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: {
    kind: "pulse",
    stages: [
      { name: "REHEARSAL", steps: pulseBarSteps(REHEARSAL_BARS), notes: pulseBars(REHEARSAL_BARS) },
    ],
  },
  acts: [
    // Both seats press every arrival: the four buttons are the same four on
    // each phone, and what differs is only which of them a screen can name.
    // Step 0 is due four beats after the stage opens — the count-in every
    // cabinet gives — and a step is 25 ticks, so the four notes land 300 ticks
    // apart (`sim/pulse-chart.ts`).
    { tick: 240, control: "pulse1Slick" },
    { tick: 240, control: "pulse2Slick" },
    { tick: 540, control: "pulse1Bulb" },
    { tick: 540, control: "pulse2Bulb" },
    { tick: 840, control: "pulse1Meteor" },
    { tick: 840, control: "pulse2Meteor" },
    { tick: 1140, control: "pulse1Pod" },
    { tick: 1140, control: "pulse2Pod" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "PRESS IT AS IT LANDS",
      anchor: { at: "control", control: "pulse1Slick" },
    },
    {
      tick: 300,
      seat: 2,
      text: "THE SAME FOUR ARE YOURS",
      anchor: { at: "control", control: "pulse2Bulb" },
    },
    {
      tick: 600,
      seat: 1,
      text: "GREY · THEY MUST NAME IT",
      anchor: { at: "control", control: "pulse1Meteor" },
    },
    {
      tick: 900,
      seat: 2,
      text: "SAY IT EARLY, SAY IT ONCE",
      anchor: { at: "control", control: "pulse2Pod" },
    },
  ],
};
