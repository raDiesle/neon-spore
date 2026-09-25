import type { GuideScene } from "../scene-types.js";

/**
 * THE FLIP's rehearsal: a screen that turns, shown by turning and then by
 * being believed.
 *
 * **The fault is a picture and nothing else** — no body moves, no control
 * changes, the simulation holds one bit saying whose screen is folded
 * (`sim/flip.ts`) — so the prose this wave carried could only *assert* that
 * a field would become its own mirror. A rehearsal is the screen itself,
 * and the first page simply lets it happen: a cyan body comes down the
 * pilot's second column, and on the sixth beat it is against the far wall
 * instead, on the same row, still falling, with the walls lit to say so
 * (`render/field-flip.ts`, `guide-film.ts`'s `seatLayout`). Nothing is said
 * about a mirror. The body jumps.
 *
 * Then the wave's whole answer, in three pages: the navigator's screen,
 * which did not turn, saying the column; the pilot carrying the cannon to
 * *that* number and not to the one their eyes give them, and the shot
 * landing; and the one column the fold leaves where it was, the middle,
 * shot on sight to say the mirror has a centre.
 *
 * **And the cost, last, on the pilot's own page.** A third body comes down
 * the sixth column and is drawn in the second, and this time the pilot slides
 * to where it looks — the honest mistake the whole wave is built to draw out
 * — and fires at an empty column. The navigator's page shows the body still
 * falling where it really is, under nobody's cannon; the hull takes it, and
 * the retries page says which number was believed. The film takes exactly the
 * hit it points at, which is what `scenes.test.ts` reads as a film playing
 * the way it was written.
 *
 * Three bodies, two of them shot, in the order the columns teach: the one the
 * navigator called, the one that stayed put, the one the eyes were trusted
 * on.
 */
export const THE_FLIP: GuideScene = {
  ticks: 2280,
  bpm: 120,
  seed: 1,
  // The pilot's screen, from the sixth beat to the end of the loop — the wave's
  // own seat and beat (`waves/act-10.ts`).
  faults: [{ kind: "flip", seat: 1, at: 6 }],
  entries: [
    { beat: 2, col: 1, color: "cyan" },
    { beat: 12, col: 3, color: "red" },
    { beat: 20, col: 5, color: "red" },
  ],
  acts: [
    // Their one: the cannon goes where the navigator said, which on the
    // pilot's screen is under nothing at all — and the bolt lands.
    { tick: 780, control: "cannon", col: 1 },
    { tick: 840, control: "fireCyan" },
    // The middle, which is the middle on both screens.
    { tick: 1020, control: "cannon", col: 3 },
    { tick: 1140, control: "fireRed" },
    // The eyes: the body is in the sixth column and drawn in the second, and
    // the cannon goes to the second. Nothing is there to hit.
    { tick: 1320, control: "cannon", col: 1 },
    { tick: 1380, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "BEAT SIX · YOUR FIELD TURNS", anchor: { at: "body" } },
    { tick: 540, seat: 2, text: "YOURS IS TRUE · SAY ONE", anchor: { at: "body" } },
    {
      tick: 720,
      seat: 1,
      text: "THEIR ONE · NOT YOUR FIVE",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 960,
      seat: 1,
      text: "ONLY THE MIDDLE STAYED PUT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1200,
      seat: 1,
      text: "LOOKS LIKE ONE · SLIDE THERE",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 1500, seat: 2, text: "IT IS FIVE · NOBODY SAID SO", anchor: { at: "body" } },
    { tick: 1740, seat: 1, text: "BELIEVED · IT WAS THE FIVE", anchor: { at: "hit" } },
  ],
};
