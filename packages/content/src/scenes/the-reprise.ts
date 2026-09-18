import type { GuideScene } from "../scene-types.js";

/**
 * THE REPRISE's rehearsal: a stretch of wave falls seen, and then falls
 * again with nothing drawn.
 *
 * Three bodies, one at each wall and one in the middle — the shape the wave
 * itself opens on, and the shortest sentence two people can hold — fall seen
 * and are taken. On the twelfth beat the field goes dark and the tear at the
 * top counts them; the same three come back down the same columns at the
 * same spacing, and the pair answers from what it said. The navigator's
 * half is the column and the pilot's is the gap, so the two blind kills are
 * a page each: the cannon slid to a column that was said, and slid again
 * three beats on because three beats were counted. A kill is drawn whole
 * over a body nothing drew (`render/unseen.ts`), which is how the page can
 * show a shot landing on an empty field.
 *
 * The third body is the one nobody said, and it is the cost: the cannon
 * stays where it is, the tear shuts behind the last body sent, and the body
 * falls the rest of the way unseen to the hull. It is the last page because
 * the hull stops the world, and it is eleven beats after the tear shuts
 * because a body falls a row a beat — the page before it says so, since the
 * screen in those beats is a field with nothing on it.
 *
 * Nothing here is the seed's: the columns and gaps are authored and the
 * echo replays them exactly, which is the boss. `test/scene-reprise.test.ts`
 * is the receipt that the two kills after the dark are of bodies nothing
 * drew, and that the one that lands is too.
 */
export const THE_REPRISE: GuideScene = {
  ticks: 2160,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 2, col: 1, color: "red" },
    { beat: 5, col: 3, color: "cyan" },
    { beat: 8, col: 5, color: "red" },
  ],
  boss: { kind: "reprise", beat: 12 },
  acts: [
    { tick: 200, control: "cannon", col: 1 },
    { tick: 260, control: "fireRed" },
    { tick: 380, control: "cannon", col: 3 },
    { tick: 440, control: "fireCyan" },
    { tick: 560, control: "cannon", col: 5 },
    { tick: 620, control: "fireRed" },
    { tick: 860, control: "cannon", col: 1 },
    { tick: 920, control: "fireRed" },
    { tick: 1100, control: "cannon", col: 3 },
    { tick: 1160, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "SEEN ONCE · SAY THE COLUMNS", anchor: { at: "hull" } },
    {
      tick: 240,
      seat: 2,
      text: "FIRE AND SAY WHERE IT WAS",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 420,
      seat: 1,
      text: "COUNT THE GAPS BETWEEN THEM",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 720, seat: 1, text: "DARK · THE TEAR COUNTS THEM", anchor: { at: "hull" } },
    {
      tick: 900,
      seat: 2,
      text: "SAID · SLIDE AND FIRE BLIND",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1080,
      seat: 1,
      text: "THREE BEATS ON · THE MIDDLE",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 1260, seat: 2, text: "THE THIRD · NOBODY SAID IT", anchor: { at: "hull" } },
    { tick: 1500, seat: 1, text: "UNSEEN · STILL FALLING", anchor: { at: "hull" } },
    { tick: 1860, seat: 1, text: "UNSAID · IT LANDS ANYWAY", anchor: { at: "retries" } },
  ],
};
