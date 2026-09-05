import type { GuideScene } from "../scene-types.js";

/**
 * THE THROB's rehearsal: the wave where firing on sight is the miss.
 *
 * A throb is half a coloured body and half shield plating, and it turns
 * clockwise the whole way down (`throbTurnMilli` — one turn every
 * `throbSpinBeats`, with the colour square to the cannon for half of it). The
 * matching colour kills it on that half and nothing at all reaches the other
 * one. Everything before this wave rewards firing the moment the cannon is
 * under something, and this is the wave that takes that away.
 *
 * So the film fires **twice**, both times in the body's own colour: once into
 * the plating, which shows the shot being swallowed, and once on the call.
 * Neither is staged — `throbStruck` asks `throbFaces` at the moment of impact,
 * and the second shot is authored at a tick whose turn has the colour out.
 *
 * **The split is a turn rather than a picture**, which is why the pages are
 * arranged the way they are. Both screens show the same turning body; what one
 * of them has and the other has not is the *cannon*, so player 1 is the one
 * who can watch the seam come round without also having to be ready to fire,
 * and player 2 is the one who has to let a moment go past with the right
 * colour already loaded. The wave's own guide says it in one line each — *say
 * the colour, then call the turn*, *load early and hold for the call* — and
 * the film is those two sentences in order.
 */
export const THE_THROB: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, kind: "throb", color: "red" }],
  acts: [
    { tick: 330, control: "cannon", col: 3 },
    { tick: 360, control: "cannon", col: 4 },
    { tick: 390, control: "cannon", col: 5 },
    // Beat 9, and `9 % 4` is 1 — a beat with the plating square to the cannon,
    // and the bolt arrives inside the same beat. The colour is the body's own
    // one, which is the whole of what this page is for: the ammunition is
    // right and the half is wrong, and the shot is still lost.
    { tick: 550, control: "fireRed" },
    // Beat 12 has the colour out (`12 % 4` is 0, the middle of the window).
    // The last such beat before the body reaches the hull, which is why the
    // page waits rather than firing a beat and a half in: the call is the
    // lesson and there is exactly one turn left to call.
    { tick: 730, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THROB · HALF OF IT IS ARMOUR", anchor: { at: "body" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 CALLS THE TURN",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 460,
      seat: 2,
      text: "ARMOUR · THE SHOT IS LOST",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 640,
      seat: 2,
      text: "COLOUR OUT · NOW IT LANDS",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
