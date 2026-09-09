import type { GuideScene } from "../scene-types.js";

/**
 * THE MAGNET's rehearsal: the column the body is in is the one place a shot
 * cannot come from.
 *
 * Everything since THE ROCK has taught the pair one motion — muzzle under it,
 * fire — and this body is that motion refused. A bolt climbing the magnet's own
 * column arrives square underneath, meets the plate slung there and does
 * nothing (`sim/magnet.ts`). What reaches a pole is a shot that arrives
 * sideways, and the only thing in the game that turns a bolt is the pilot's
 * hand held on a body from somewhere else.
 *
 * So the film opens on the pilot's screen with the wrong answer already drawn —
 * the cannon where every wave before this one taught them to put it — and the
 * page after it carries the muzzle away and puts a finger on the body. That
 * order is the lesson: the hold is not a convenience here, it is the aim.
 *
 * The last two pages are the navigator's, and they are one sentence in two
 * halves. The side is the pilot's to choose and the pole's colour follows from
 * it, so the page about the side comes first and points at what the hand is
 * holding; the page about the trigger comes second and points at the lobe. A
 * navigator who fires before hearing the side is firing at a coin.
 */
export const THE_MAGNET: GuideScene = {
  ticks: 960,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "magnet", color: "red" }],
  acts: [
    { tick: 390, control: "cannon", col: 1 },
    { tick: 450, grip: 1, col: 3, until: 900 },
    { tick: 810, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "NEVER STAND UNDER IT", anchor: { at: "body" } },
    {
      tick: 300,
      seat: 1,
      text: "STAND ASIDE AND HOLD IT",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 540, seat: 2, text: "IT COMES IN FROM THE LEFT", anchor: { at: "held" } },
    {
      tick: 720,
      seat: 2,
      text: "THE LEFT POLE IS RED",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
