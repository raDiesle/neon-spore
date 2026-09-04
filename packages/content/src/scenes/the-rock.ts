import type { GuideScene } from "../scene-types.js";

/**
 * THE ROCK's rehearsal: the first thing in the game a shot cannot answer.
 *
 * A rock cannot be shot. What answers one is the shield — and on this wave's
 * panel that is the trigger alone. THE ROCK is played on STANDARD 3, which is
 * the rung where player 1 gains the trigger and nobody has the strip under the
 * plate yet (`control-sets-table.ts`), so the plate stands where it has always
 * stood and the rock is authored to arrive in that column. One new thing, and
 * the whole of it is *when*: the guard is a window, not a wall, and a trigger
 * pressed early is a rock that lands anyway.
 *
 * **The coupling is a wave later, on purpose.** The sentence this film used to
 * open — neither of you can do it alone — belongs to TWO ROCKS now, which is
 * where player 2 gains the strip and the plate becomes something that has to
 * be carried into a column somebody else called out (`two-rocks.ts` holds the
 * choreography that used to be here). Handing a pair both halves of a defence
 * on the beat they meet the thing it defends against was the owner's own
 * objection to the old ladder.
 *
 * The trigger is late for the reason it is late next door: a page that fired
 * early would be teaching the failure the wave is built around. It opens,
 * holds a still field while the rock comes down, and only then does the hand
 * go to the lobe.
 */
export const THE_ROCK: GuideScene = {
  ticks: 960,
  bpm: 120,
  // Column 3 of the seven a wave is authored in, which is the middle of the
  // field and therefore the column the plate rests in before anybody has moved
  // it (`midCol`). Nothing on this panel could carry it anywhere else.
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "meteor", color: null }],
  acts: [{ tick: 850, control: "guard" }],
  steps: [
    { tick: 0, seat: 1, text: "ROCK · CANNOT BE SHOT", anchor: { at: "body" } },
    // Player 2's screen, pointing at the plate on the hull rather than at a
    // button: there is no button for it yet, and what this page has to say is
    // that the thing exists and is already standing in the way.
    {
      tick: 240,
      seat: 2,
      text: "THE PLATE IS ALREADY THERE",
      anchor: { at: "ship", control: "guard" },
    },
    {
      tick: 660,
      seat: 1,
      text: "FIRE IT AS IT LANDS",
      anchor: { at: "control", control: "guard" },
    },
  ],
};
