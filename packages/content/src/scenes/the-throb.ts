import type { GuideScene } from "../scene-types.js";

/**
 * THE THROB's rehearsal: the wave where the trigger that just worked is the
 * miss.
 *
 * A throb is red down one side and cyan down the other, and it turns clockwise
 * the whole way down (`throbTurnMilli` — one turn every `throbSpinBeats`, each
 * half square to the cannon for half of it). Whichever half is pointing at the
 * cannon is the colour that kills it. Everything before this wave lets a pair
 * agree a colour once and keep it; this is the wave that takes that away.
 *
 * So the film fires **twice into the same half**, once in each colour: the
 * first is the colour the body was authored in, which is the wrong one by the
 * time the bolt arrives, and the second is the colour that is actually round.
 * Neither is staged — `throbStruck` asks `throbColorAt` at the moment of
 * impact, and both presses are authored at ticks whose turn has cyan out.
 *
 * **The split is a turn rather than a picture**, which is why the pages are
 * arranged the way they are. Both screens show the same turning body; what one
 * of them has and the other has not is the *cannon*, so player 1 is the one
 * who can watch the seam come round without also having to be ready to fire,
 * and player 2 is the one who has to change trigger on the call. The wave's
 * own guide says it in one line each — *say which colour is facing you*, *fire
 * the colour that was just called* — and the film is those two sentences in
 * order.
 */
export const THE_THROB: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, kind: "throb", color: "red" }],
  acts: [
    { tick: 510, control: "cannon", col: 3 },
    { tick: 540, control: "cannon", col: 4 },
    { tick: 570, control: "cannon", col: 5 },
    // Both bolts arrive inside one cyan window. `throbSpinBeats` is 3 and each
    // half holds the cannon for half a turn, so the body authored red has its
    // cyan side round over beats 12.75 to 14.25 — ticks 765 to 855 at this
    // tempo. The first press is red, the trigger that was right a moment ago
    // and is wrong now; the second is cyan, at the same place on the turn.
    { tick: 755, control: "fireRed" },
    { tick: 795, control: "fireCyan" },
  ],
  steps: [
    // Seven beats — one whole turn of the body later than the four it used
    // to be, so every bolt below keeps its place on the spin — and the page
    // holds with the throb on row six, in the middle of the screen, where
    // the owner asked for the explained enemy to stand when a tutorial stops.
    // Not eight: the two bolts have to land before the body does.
    { tick: 0, seat: 1, text: "THROB · RED SIDE, CYAN SIDE", anchor: { at: "body" } },
    {
      tick: 420,
      seat: 1,
      text: "PLAYER 1 CALLS WHICH FACES",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 620,
      seat: 2,
      text: "IT TURNED · RED IS WASTED",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 800,
      seat: 2,
      text: "CYAN IS ROUND · CYAN LANDS",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
