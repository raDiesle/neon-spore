import type { GuideScene } from "../scene-types.js";

/**
 * THE VOLLEY's rehearsal: a ward that works is not a body that is gone.
 *
 * The wave shipped with three lines of prose, as THE CAROM did two entries
 * before it and for the same reason — what the pair has to learn is a *shape*,
 * and a shape does not read off a line of text. It is the worse of the two to
 * describe, because the thing being taught is that a control they already know
 * does something it has never done before: every warded body in this game so
 * far has been a rock, and a rock answered is a rock gone. The reflex the pair
 * has built is *ward it, and stop looking at it*, and this creature is written
 * to charge for it.
 *
 * **One volley and nothing else.** The wave sends two of them, a plain body and
 * a rock between them; a film with any of that in it would be teaching the
 * shape and the traffic at once, and the shape is the whole of it.
 *
 * **It runs long, and that is the creature rather than an indulgence.** Three
 * wards is what the shell costs, each one is seven beats of climb and fall, and
 * a film that showed one of them would be a film about a ball that comes back —
 * which is the *setup*, not the lesson. Nothing waits on the end of a page
 * (`docs/spec/briefings.md`): a seat reads its own page, presses REPLAY or
 * NEXT, and the longest of these is under nine seconds.
 *
 * **The first page spends a shot on purpose.** A whole volley is `isWardable`,
 * so the cannon leaves a crater and nothing else — and the navigator's page at
 * the end is the same button killing what falls out of the shell. That is the
 * pair of pages the wave is: the shot that does nothing, and then the shot that
 * is the entire answer.
 *
 * **The two halves of a ward are two pages, because they are two seats.** The
 * shield is the navigator's and the trigger is the pilot's, and a page that put
 * them together would be a page neither of them is holding.
 *
 * The column is authored and needs no resolving: a volley climbs and falls
 * down the one lane it arrived in (`sim/volley.ts`), which is what makes it
 * answerable at all.
 */
export const THE_VOLLEY: GuideScene = {
  ticks: 2040,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, kind: "volley", color: "red" }],
  acts: [
    { tick: 240, control: "fireRed" },
    { tick: 600, control: "shield", col: 3 },
    // Three, and the film is the count. The trigger is pressed about a third of
    // a beat before the ball reaches the dome, which is inside `guardWindowMs`
    // and is what a thumb waiting for it actually does.
    { tick: 820, control: "guard" },
    { tick: 1240, control: "guard" },
    { tick: 1660, control: "guard" },
    { tick: 1860, control: "fireRed" },
  ],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "A SHOT ONLY CHIPS IT",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 480,
      seat: 2,
      text: "HOLD THE LANE FOR IT",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 720,
      seat: 1,
      text: "YOUR WARD SENDS IT BACK",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 1140, seat: 1, text: "THREE IN ALL · A PLATE EACH", anchor: { at: "body" } },
    {
      tick: 1760,
      seat: 2,
      text: "THE SHELL IS OFF · SHOOT IT",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
