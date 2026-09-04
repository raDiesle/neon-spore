import type { GuideScene } from "../scene-types.js";

/**
 * THE THROB's rehearsal: the wave where firing on sight is the miss.
 *
 * A throb swells and shrinks on the beat both players share, and only a shot
 * that arrives while it is open lands at all (`throbIsOpen` — one beat open in
 * every four). Everything before this wave rewards firing the moment the
 * cannon is under something, and this is the wave that takes that away.
 *
 * So the film fires **twice**: once while it is shut, which shows the shot
 * being swallowed, and once on the count. Neither is staged — `bullet-hit.ts`
 * reads `throbOpen` off the body at the moment of impact, and the second shot
 * is authored at the tick whose beat is an open one.
 *
 * **The split is a count rather than a picture**, which is why the pages are
 * arranged the way they are. Both screens show the same swelling body; what
 * one of them has and the other has not is the *cannon*, so player 1 is the
 * one who can watch the cycle without also having to be ready to fire, and
 * player 2 is the one who has to let a moment go past. The wave's own guide
 * says it in one line each — *call the beat it swells on*, *fire on the count,
 * not on sight* — and the film is those two sentences in order.
 */
export const THE_THROB: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, kind: "throb", color: null }],
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    // Beat 9 — `9 % 4` is 1, so it is shut, and the bolt arrives inside the
    // same beat. The shot is real and so is the nothing that happens.
    { tick: 550, control: "fireRed" },
    // Beat 12 is open. The last one before the body reaches the hull, which is
    // why the page waits rather than firing a beat and a half in: the count is
    // the lesson and there is exactly one number left to count to.
    { tick: 730, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THROB · IT OPENS AND SHUTS", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 CALLS THE BEAT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 460,
      seat: 2,
      text: "SHUT · THE SHOT IS LOST",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 640,
      seat: 2,
      text: "OPEN · NOW IT LANDS",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
