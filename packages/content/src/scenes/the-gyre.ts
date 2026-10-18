import type { GuideScene } from "../scene-types.js";

/**
 * THE GYRE's rehearsal: the column you were told is the right one for a single
 * beat.
 *
 * Six bodies bolted round a turning wheel, red and cyan alternating. It stops
 * falling in the middle of the field and walks a diamond there, turning faster
 * the longer it is up — so a column said out loud is true for one beat and a
 * colour said out loud is true for two positions round the rim.
 *
 * **The film has no brake in it.** THE GYRE is played on STANDARD 2 since the
 * owner moved it into the arc, straight after THE BROOD (18 October 2026), and
 * that rung has no SUCK — the page that slowed the wheel went with it. What is
 * left is the wave's other half: agree the beat, then be in the column.
 */
export const THE_GYRE: GuideScene = {
  ticks: 1620,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "gyre", color: null }],
  acts: [
    { tick: 1320, control: "cannon", col: 2 },
    // At a tick a cyan mount comes over column 2, unslowed, on both shot
    // grids (`test/scene-grid.test.ts`) with beats to spare either side. The
    // beat is hers and the column is his, and neither is worth anything on
    // its own.
    { tick: 1380, control: "fireCyan" },
  ],
  steps: [
    // Twelve beats: the wheel falls to the middle of the field and starts its
    // walk, and the page holds with the hub on row nine and the highest
    // mount on row seven — the whole wheel in the middle of the screen. The
    // middle is `rows / 2` (`gyreRestRow`), a row lower and a beat later since
    // 18 October 2026, when the ship was cut a tile shorter (`rows` 15 to 16).
    { tick: 0, seat: 1, text: "GYRE · SIX ON A WHEEL", anchor: { at: "body" } },
    // The walk, to a moment the top of the wheel is no higher than row
    // seven.
    { tick: 720, seat: 2, text: "IT TURNS · CALL THE BEAT", anchor: { at: "body" } },
    {
      tick: 1230,
      seat: 2,
      text: "FIRE ON THE AGREED BEAT",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
