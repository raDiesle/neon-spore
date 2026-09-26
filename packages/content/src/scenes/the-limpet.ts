import type { GuideScene } from "../scene-types.js";

/**
 * THE LIMPET's rehearsal: the shield is held, and standing still is the
 * mistake.
 *
 * The fault fires a body at the shield and it sticks for the placement's
 * `beats`; a shield that has not been in a new column for
 * `harpoonStillBeats` loses the round (`sim/harpoon.ts`). So `faults` is
 * authored on the film the way it is on the wave — THE JAM's reason — and the
 * film is short on the beat map: one placement, landing on beat 3.
 *
 * **The split is the word.** Player 2 holds the shield and the body holds it
 * too; player 1 cannot move it and is shown MOVE SHIELD! under his dial
 * (`render/duty-harpoon.ts`). So the pages go: the navigator's shield taken,
 * the pilot's word, the navigator's thumb walking it a column a beat — and
 * then the thumb stops, and the one shared page is what that costs.
 *
 * The rocks the wave carries are left out, for the checklist's reason: a page
 * with two lessons in it teaches neither. The one arrival here is due after
 * the loop ends and never falls; it is there because a field with nothing
 * left to spawn is a cleared wave, and a cleared wave rests instead of
 * failing (`sim/wave-end.ts`).
 */
export const THE_LIMPET: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  faults: [{ kind: "limpet", at: 2, beats: 14 }],
  entries: [{ beat: 20, col: 2, kind: "meteor", color: null }],
  acts: [
    { tick: 150, control: "shield", col: 4 },
    { tick: 210, control: "shield", col: 5 },
    { tick: 270, control: "shield", col: 4 },
    { tick: 330, control: "shield", col: 3 },
    { tick: 390, control: "shield", col: 2 },
    { tick: 450, control: "shield", col: 3 },
    { tick: 510, control: "shield", col: 4 },
    { tick: 570, control: "shield", col: 5 },
    // The last move. A beat and a half later the round is lost, under the
    // page that says so.
    { tick: 630, control: "shield", col: 4 },
  ],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "THE LIMPET HOLDS THE SHIELD",
      anchor: { at: "ship", control: "shield" },
    },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 SAYS MOVE SHIELD",
      anchor: { at: "ship", control: "shield" },
    },
    {
      tick: 450,
      seat: 2,
      text: "A NEW COLUMN EVERY BEAT",
      anchor: { at: "control", control: "shield" },
    },
    { tick: 660, seat: 2, text: "PARKING IT LOSES THE WAVE", anchor: { at: "hit" } },
  ],
};
