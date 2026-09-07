import type { GuideScene } from "../scene-types.js";

/**
 * THE CHOIR's rehearsal: the one gesture that is on no panel at all.
 *
 * **It is the wave in the game that can least afford a prose guide**, and it
 * shipped with one. Every other guide describes something a pair can find on
 * their own screen — a button, a strip, a cord hanging off a body. This one has
 * to teach a hand *shaking the device*, and a pair who do not read the words
 * carefully sit and watch a membrane reach the hull with both thumbs on
 * controls that cannot touch them.
 *
 * **Two gestures, in that order, and they are not alternatives to a reader.**
 * The shake is the whole thing in one move; the two arrows are the same thing
 * for a phone that reports no shake, and they are two trips because a swipe is
 * something a thumb does by accident (`sim/choir-gesture.ts`). So the film
 * shows the shake first, because it is what the pair should reach for, and the
 * arrows after it as the thing that is there when it will not work.
 *
 * **Nothing draws a ghost hand for either.** A shake is not a hand anywhere on
 * the screen, and an arrow is a switch a hand throws rather than a handle that
 * travels — its resting circle *is* its grab circle, so a thumb drawn on one
 * would be a thumb that never moves. The arrows say it themselves: with nothing
 * armed both pulse, and once one is out it goes dark while its partner keeps
 * pulsing on its own (`render/choir-arrows.ts`). That is already the film's
 * "next thing to do", and a hand over it would only cover it.
 *
 * **Every page points at the membrane, the arrows included**, and that is not
 * the caption drifting off its subject. An arrow is drawn only while a membrane
 * is on the field, so a page anchored at one loses its words the instant the
 * gesture works — half the page, on the page whose whole subject is the
 * gesture. The body is the thing that is there for all of it, and it is also
 * what the words are *about*: the arrows are how it opens, and what a pair has
 * to watch is the opening.
 *
 * **The cannon goes under it on the pilot's page, before the merge is shot.**
 * THE LID's film makes the same move for the same reason: firing is the
 * navigator's and aiming is not, so a page that showed only the shot would
 * teach half an order. It is `atBody` rather than a column, which is
 * what keeps this page right whatever lane the wave author put the membrane in
 * (`sim/scene-aim.ts`).
 *
 * **The last page is the half-made gesture.** One arrow carried, the window
 * shut, and the thing sings: the wave's own sentence is *the one where the
 * half-made gesture is worse than none at all*, and a film that never showed
 * the pilot being late would have left that sentence unearned.
 */
export const THE_CHOIR: GuideScene = {
  ticks: 1500,
  bpm: 120,
  seed: 1,
  // Three membranes, one per gesture and one for the lapse. Each arrives while
  // the page about it is up, so a page replayed on its own opens on an empty
  // field and watches the thing it is about come in — which is what a pair
  // meeting the wave sees.
  entries: [
    { beat: 0, col: 2, kind: "choir", color: "red" },
    { beat: 9, col: 2, kind: "choir", color: "cyan" },
    { beat: 18, col: 2, kind: "choir", color: "red" },
  ],
  acts: [
    { tick: 90, shake: true },
    // Under the membrane's own lane, which is where the merge stays.
    { tick: 240, control: "cannon", col: 2, atBody: true },
    { tick: 420, control: "fireRed" },
    // The two trips. Armed on the last message of the first carry and finished
    // on the last of the second, ninety ticks later — inside `choirWindowBeats`
    // with a beat to spare, which is what the pair has to say out loud.
    { tick: 780, drag: "choirLeft", until: 810 },
    { tick: 870, drag: "choirRight", until: 900 },
    // And the pair finishing what the gesture opened, on the pilot's own page.
    // It is the point of the gesture rather than a second lesson: a membrane
    // is a thing nothing can shoot, and what the two arrows make is a bulb the
    // navigator can. It also leaves the field clear for the page below.
    { tick: 960, control: "cannon", col: 2, atBody: true },
    { tick: 1020, control: "fireCyan" },
    // And the one that is not finished. The window shuts two beats later with
    // nothing to answer it, and the membrane sings.
    { tick: 1230, drag: "choirLeft", until: 1260 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 SHAKES THE PHONE",
      anchor: { at: "body" },
    },
    {
      tick: 300,
      seat: 2,
      text: "PLAYER 2 FIRES ITS COLOUR",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 660,
      seat: 1,
      text: "PLAYER 1 CARRIES BOTH ARROWS",
      anchor: { at: "body" },
    },
    {
      tick: 1140,
      seat: 1,
      text: "HALF A PULL COSTS THE HULL",
      anchor: { at: "health" },
    },
  ],
};
