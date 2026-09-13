import type { GuideScene } from "../scene-types.js";

/**
 * THE HANDOVER's rehearsal: the panels trade while the pair is watching.
 *
 * **The fault is a change of picture, so the film is the only honest way to
 * say it.** The three lines of prose this wave carried had to *assert* that the
 * band in front of you would become the other one — and a rehearsal simply lets
 * it happen: the same phone, the same corner plate saying whose it is, and the
 * other seat's half arriving underneath it on the beat the count runs out
 * (`render/handover.ts`, where a page learned it is a device and not a panel).
 *
 * So the film is four pages and one trade. The first two are the pair's own
 * hands — the pilot carrying the cannon onto a body, the navigator firing the
 * colour that answers it — and the lip of the band counts down through the
 * second of them, which is the warning both phones get. The last two are the
 * same two screens after the trade: the pilot's phone holding RED and CYAN, the
 * navigator's holding the strip, each with its own thumb on a button it has
 * never pressed. Nothing is said about the trade; it is done.
 *
 * **The window is open for the rest of the loop, deliberately.** Ten beats from
 * the sixth, which outlasts the film: a page holds on its last frame, and a
 * page whose panel changed halfway through its own hold would be a picture the
 * pair reads the words against twice. What says the panels come home is the
 * plate on the lip, counting *out* of the window the whole time — and the loop
 * itself, which starts again with both of them in their own hands.
 *
 * Three red bodies in two columns, every one of them answered: the film takes
 * no hit, which is what `scenes.test.ts` reads as a film that still plays the
 * way it was written.
 */
export const THE_HANDOVER: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  // The trade on the sixth beat of the wave, a page and a half in, so the pair
  // has played their own halves before it lands. The wave itself names nine
  // and eight; a rehearsal is shorter than a wave and says so in its own
  // numbers (`sim/handover.ts` takes both off the fault's arm).
  malfunction: { kind: "handover", at: 6, beats: 10 },
  entries: [
    { beat: 0, col: 2, color: "red" },
    { beat: 6, col: 2, color: "red" },
    { beat: 12, col: 4, color: "red" },
  ],
  acts: [
    // A beat and a half into each page, never at the top of one: a pair reading
    // "player 1 moves cannon" while the cannon is already moving has been shown
    // the answer instead of asked the question.
    { tick: 90, control: "cannon", col: 2 },
    { tick: 330, control: "fireRed" },
    // Traded. The commands are unchanged — the simulation knows nothing about
    // this fault — and what moved is the screen each thumb is drawn on.
    { tick: 570, control: "fireRed" },
    { tick: 780, control: "cannon", col: 4 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 MOVES CANNON",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 240,
      seat: 2,
      text: "PLAYER 2 FIRES RED",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 480,
      seat: 1,
      text: "PLAYER 1 HOLDS RED NOW",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 690,
      seat: 2,
      text: "PLAYER 2 MOVES THE CANNON",
      anchor: { at: "control", control: "cannon" },
    },
  ],
};
