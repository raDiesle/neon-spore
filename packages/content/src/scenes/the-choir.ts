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
 * The shake is two moves inside a window; the rub is both seats scrubbing the
 * mark in the middle of the field at once (`sim/choir-gesture.ts`,
 * `sim/choir-rub.ts`). It shows the shake first, because it is what the pair
 * should reach for, and the rub after it as the thing that is there when a
 * phone will not answer — and the one a desk has.
 *
 * **Nothing draws a ghost hand for either.** A shake is not a hand anywhere on
 * the screen, and the rub's mark answers each turn itself — the stroke it
 * lights, and the seat that turned (`render/choir-rub.ts`). A hand over it
 * would only cover it.
 *
 * **Every page points at the membrane, the rub included.** The mark is drawn
 * only while a membrane is on the field, so a page anchored at it loses its
 * words the instant the gesture works. The body is the thing that is there
 * for all of it, and it is also what the words are *about*.
 *
 * **The cannon goes under it on the pilot's page, before the merge is shot.**
 * THE LID's film makes the same move for the same reason: firing is the
 * navigator's and aiming is not, so a page that showed only the shot would
 * teach half an order. It is `atBody` rather than a column, which is
 * what keeps this page right whatever lane the wave author put the membrane in
 * (`sim/scene-aim.ts`).
 *
 * **The last page is the half-made gesture.** One move made, the window shut,
 * and the thing sings: the wave's own sentence is *the one where the
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
    // Twice, inside the window, which is the gesture: the first arms the pair
    // and sets them glowing, the second closes them (`sim/choir-gesture.ts`).
    { tick: 90, shake: true },
    { tick: 150, shake: true },
    // Under the membrane's own lane, which is where the merge stays.
    { tick: 240, control: "cannon", col: 2, atBody: true },
    { tick: 540, control: "fireRed" },
    // The rub, both seats at once on the mark in the middle: a turn every
    // quarter second from each, and the eighth made together, on tick 930,
    // draws them in (`sim/choir-rub.ts`).
    { tick: 780, drag: "choirRub", hand: 1, until: 960 },
    { tick: 780, drag: "choirRub", hand: 2, until: 960 },
    // And the pair finishing what the gesture opened, on the pilot's own page.
    // It is the point of the gesture rather than a second lesson: a membrane
    // is a thing nothing can shoot, and what the rub makes is a bulb the
    // navigator can. It also leaves the field clear for the page below.
    { tick: 960, control: "cannon", col: 2, atBody: true },
    { tick: 1020, control: "fireCyan" },
    // And the one that is not finished: one turn made together, then both
    // thumbs off. The window shuts two beats after it, and the membrane sings.
    { tick: 1230, drag: "choirRub", hand: 1, until: 1290 },
    { tick: 1230, drag: "choirRub", hand: 2, until: 1290 },
  ],
  steps: [
    // The membrane is answered on its top rows, so what this page holds on
    // is what the gesture made of it: the slick it opened into, on row six
    // in the middle of the screen, seven and a half beats in.
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 SHAKES THE PHONE",
      anchor: { at: "body" },
    },
    {
      tick: 450,
      seat: 2,
      text: "PLAYER 2 FIRES ITS COLOUR",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 660,
      seat: 1,
      text: "BOTH PLAYERS RUB THE MIDDLE",
      anchor: { at: "body" },
    },
    // Opens a beat before the third membrane arrives, so the page before
    // holds on the field the pilot cleared and not on a body that has
    // nothing to do with it.
    {
      tick: 1080,
      seat: 1,
      text: "HALF A RUB LOSES THE WAVE",
      anchor: { at: "hit" },
    },
  ],
};
