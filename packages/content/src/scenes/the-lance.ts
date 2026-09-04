import type { GuideScene } from "../scene-types.js";

/**
 * THE LANCE's rehearsal: one shot instead of three.
 *
 * The wave trades the maw for the lance — they are the same opening, and one
 * empties the other — and the lance is the only control in the game that is
 * paid for in *stillness*. Player 1 holds it and the lobe fills for as long as
 * the cannon does not move; a shot fired off a full one leaves slower and goes
 * straight through every body of its own colour rather than stopping at the
 * first.
 *
 * **The wave had no guide at all until this film.** It carries a panel of its
 * own, so the maw a pair has used since SALVAGE is simply gone and a control
 * nothing had ever mentioned is in its place. `waves.test.ts` did not catch it
 * because the lance is a mechanic with `reach: "run"` — on from the first wave
 * to the last, carried by no wave's entries, so no wave *introduces* it and the
 * rule that asks for a guide could never fire.
 *
 * Four pages, and the middle two are the price. He gets under the column
 * first, because sliding a column afterwards empties the lobe; then he holds
 * and does nothing, which is the whole of the mechanic and the one thing a
 * still picture cannot show. The lobe reaches full as the last page opens, and
 * the shot on it takes all three.
 */
export const THE_LANCE: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 0, col: 2, color: "red" },
    { beat: 1, col: 2, color: "red" },
    { beat: 2, col: 2, color: "red" },
  ],
  acts: [
    { tick: 350, control: "cannon", col: 3 },
    { tick: 390, control: "cannon", col: 2 },
    // The thumb goes down and never comes up: `lancePrimeBeats` is three, so
    // the lobe is full a hundred and eighty ticks later, and the film ends
    // while it is still held. A lift would be a page about letting go, which
    // is the one thing this wave never wants anybody to do.
    { tick: 590, control: "lance" },
    { tick: 850, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "THREE REDS, ONE COLUMN", anchor: { at: "body" } },
    {
      tick: 260,
      seat: 1,
      text: "GET UNDER THEM FIRST",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 500,
      seat: 1,
      text: "HOLD IT · DO NOT MOVE",
      anchor: { at: "control", control: "lance" },
    },
    {
      tick: 760,
      seat: 2,
      text: "ONE SHOT TAKES ALL THREE",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
