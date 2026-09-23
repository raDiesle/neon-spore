import type { GuideScene } from "../scene-types.js";

/**
 * THE DIASTOLE's rehearsal: a count said out loud, and then two of them.
 *
 * Two chambers hang above the top of the field, one lane either side of the
 * middle. The left is player 1's and beats in threes; the right is player 2's
 * and beats in fives; each seat sees only its own beating true and the other
 * as a still grey mass. A chamber can only be hurt on one of its own
 * contractions — so the shot is hers and the count is his, and the fight is
 * him saying it (`sim/diastole.ts`).
 *
 * The film is the rule's two halves in the order the wave hands them over.
 * First the one count: he says every three, she fires red on it, twice, and
 * the left loses two of its three. That wakes the right, and from then on
 * nothing single lands at all — the only answer is the beam standing in the
 * bridge column on a beat both chambers contract on, which three against five
 * makes once in fifteen. So the cannon goes to the middle, she holds red, and
 * the beam lands on the fifteenth beat of the new count and takes one hit off
 * each. The page under the hold is long on purpose: a fill is three beats and
 * the beat it is judged on is the one the pair counted to, so the page has to
 * hold the thumb going down and the column burning both, or it teaches a hold
 * that does nothing (`lance-burn.ts`, `beamBeat`).
 *
 * **The cannon is aimed at the boss, not authored.** The left chamber hangs
 * over column 4 on the eleven the game ships, which no authored column
 * reaches (`mapCol`), and the bridge over 5; `atBoss` asks the boss where the
 * cannon has to stand this phase (`sim/boss-answer.ts`), so the same act
 * lands under the chamber in phase `one` and in the bridge in phase `two`.
 *
 * **Every tick here is a count against the boss's own clock.** Phase `one` is
 * anchored on the film's first beat, so the left contracts on 12 and 15 —
 * sixty ticks a beat, a bolt about seventy to the top — and the right wakes
 * on the beat after the second hit, 16, which puts the coincidence on 31. A
 * hold from tick 1710 tops out inside beat 31; `scene-diastole.test.ts` watches
 * the hits land rather than trusting the arithmetic.
 */
export const THE_DIASTOLE: GuideScene = {
  ticks: 1980,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "diastole" },
  acts: [
    { tick: 450, control: "cannon", col: 2, atBoss: true },
    { tick: 660, control: "fireRed" },
    { tick: 840, control: "fireRed" },
    { tick: 1050, control: "cannon", col: 3, atBoss: true },
    // Held to the last tick: the beam lands at 1859 and a lift after it would
    // be a page about letting go, which no beam wants.
    { tick: 1710, control: "fireRed", until: 1980 },
  ],
  steps: [
    // Both pages are about the same chamber seen from the two seats: his
    // keeps a count, hers is grey. A ring on the hull pointed at neither.
    { tick: 0, seat: 1, text: "THE LEFT BEATS IN THREES", anchor: { at: "boss", part: "left" } },
    {
      tick: 180,
      seat: 2,
      text: "GREY ON PLAYER 2'S SCREEN",
      anchor: { at: "boss", part: "left" },
    },
    {
      tick: 360,
      seat: 1,
      text: "PLAYER 1 SAYS EVERY THREE",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 540,
      seat: 2,
      text: "PLAYER 2 FIRES RED ON THREE",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 960,
      seat: 1,
      text: "BOTH BEAT · CANNON TO MIDDLE",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1500,
      seat: 2,
      text: "PLAYER 2 HOLDS RED · ON 15",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
