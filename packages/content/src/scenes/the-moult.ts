import type { GuideScene } from "../scene-types.js";

/**
 * THE MOULT's rehearsal: the answer you agreed on expires while it falls.
 *
 * Every other rehearsal in this file teaches a pair to find an answer. This one
 * has to teach them that finding it is not the end — the body turns over from a
 * rock to a cargo and back every five beats all the way down, and what it is on
 * the beat it reaches the ship is the whole of what happens (`sim/moult.ts`).
 *
 * So the film is **one body and no second thing**, which is the opposite of the
 * wave it opens. THE MOULT carries a plain rock at the top so the pair has
 * something whose answer keeps to measure against; a film has the pages for
 * that instead, and a second body in it would be a second thing to watch on the
 * one screen where the whole point is that nothing moves except the form.
 *
 * **It lands as a cargo, and that is authored rather than hoped for.** The turn
 * is `waveBeat` against `moultBeats` and nothing else, so an entry beat is an
 * answer: this one enters on beat 1 and is resolved on beat 15, which is inside
 * the second cargo stretch. The half the film shows is the half the pair does
 * not already have — every one of them arrives here knowing what a rock wants.
 *
 * **The cannon moves to a column the body is not in**, and then the body comes
 * to it. That is SALVAGE's lesson said again on a creature that is not a pod:
 * the last two rows steer one column a beat toward whatever column the cannon
 * is holding, so being parked somewhere beats being exactly right too late. A
 * film that put the cannon under the body would have taught a pair to track.
 */
export const THE_MOULT: GuideScene = {
  ticks: 1080,
  bpm: 120,
  seed: 1,
  // Column 3 of the seven a wave is authored in — the middle, so the steer at
  // the bottom can be seen going either way. One beat in, so the first page is
  // on the screen before anything falls.
  entries: [{ beat: 1, col: 3, kind: "moult", color: null, cargo: "ward" }],
  acts: [
    // Parked one column over, well before the body is near the ship: the point
    // is that the pilot chooses a place and stays in it.
    { tick: 700, control: "cannon", col: 4 },
    { tick: 730, control: "cannon", col: 4 },
    // The mouth, on the beat it lands. Nothing before it: a maw opened early
    // is a maw shut again by the time the cargo arrives.
    { tick: 1000, control: "intake" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "IT IS A ROCK · FOR NOW", anchor: { at: "body" } },
    { tick: 480, seat: 2, text: "ONLY YOU SEE WHAT IS NEXT", anchor: { at: "body" } },
    {
      tick: 660,
      seat: 1,
      text: "PARK IT · IT COMES TO YOU",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 890,
      seat: 1,
      text: "IT LANDS AS A POD · OPEN",
      anchor: { at: "control", control: "intake" },
    },
  ],
};
