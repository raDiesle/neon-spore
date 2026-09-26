import type { GuideScene } from "../scene-types.js";

/**
 * THE LEECH's rehearsal: the cannon is held, and standing still is the
 * mistake.
 *
 * THE LIMPET's film on the other half of the ship (`scenes/the-limpet.ts`),
 * because the fault is the same one aimed elsewhere (`sim/harpoon.ts`): a
 * body sticks to the cannon for the placement's `beats`, and a cannon that
 * has not been in a new column for `harpoonStillBeats` loses the round.
 *
 * **The split is the word, the other way round.** Player 1 holds the cannon
 * and the body holds it too; player 2 cannot move it and is shown MOVE
 * CANNON! under the dial (`render/duty-harpoon.ts`). So the pages go: the
 * pilot's cannon taken, the navigator's word, the pilot's thumb walking it a
 * column a beat — and then the thumb stops, and the one shared page is what
 * that costs.
 *
 * The rocks the wave carries are left out, for the checklist's reason: a page
 * with two lessons in it teaches neither. The one arrival here is due after
 * the loop ends and never falls; it is there because a field with nothing
 * left to spawn is a cleared wave, and a cleared wave rests instead of
 * failing (`sim/wave-end.ts`).
 */
export const THE_LEECH: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  faults: [{ kind: "leech", at: 2, beats: 14 }],
  entries: [{ beat: 20, col: 2, kind: "meteor", color: null }],
  acts: [
    { tick: 150, control: "cannon", col: 4 },
    { tick: 210, control: "cannon", col: 5 },
    { tick: 270, control: "cannon", col: 4 },
    { tick: 330, control: "cannon", col: 3 },
    { tick: 390, control: "cannon", col: 2 },
    { tick: 450, control: "cannon", col: 3 },
    { tick: 510, control: "cannon", col: 4 },
    { tick: 570, control: "cannon", col: 5 },
    // The last move. A beat and a half later the round is lost, under the
    // page that says so.
    { tick: 630, control: "cannon", col: 4 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "THE LEECH HOLDS THE CANNON",
      anchor: { at: "ship", control: "cannon" },
    },
    {
      tick: 240,
      seat: 2,
      text: "PLAYER 2 SAYS MOVE CANNON",
      anchor: { at: "ship", control: "cannon" },
    },
    {
      tick: 450,
      seat: 1,
      text: "A NEW COLUMN EVERY BEAT",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 660, seat: 1, text: "PARKING IT LOSES THE WAVE", anchor: { at: "hit" } },
  ],
};
