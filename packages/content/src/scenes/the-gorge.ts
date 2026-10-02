import { GORGE_LEVELS } from "../gorge-levels.js";
import type { GuideScene } from "../scene-types.js";

/**
 * THE GORGE's rehearsal: a row of bubbles, each wanting shots, and a pair
 * that can only fill them by talking.
 *
 * Nothing falls in it but what the bubbles give back, and the film is the
 * first level and only that (`GORGE_LEVELS[0]`): four bubbles in any order,
 * the rule and its one mistake. The count under each, which only player 1 is
 * shown (`showsGorgeTally`); the colour each wants, which only player 2 is;
 * a bubble picked and fed; **a wrong colour taking a shot back out**, the
 * film's one authored mistake, which costs nothing but the shot; then the
 * rest fed one by one until the level is clear. The ring and its tap are the
 * guide's prose: no act yet puts a thumb on a boss's own handle
 * (`docs/queue.md`).
 *
 * The bubbles stand where `installGorge` hangs them, centred, so every
 * column is a world column (`worldCol`). **The seed is chosen**, 19, because
 * it rolls the row 2 red, 1 red, 1 cyan, 1 cyan over columns 3 to 6 — both
 * colours and a count over one, which is everything the page has to show.
 * The cannon starts under the cyan in the middle.
 */
export const THE_GORGE: GuideScene = {
  ticks: 2520,
  bpm: 120,
  seed: 19,
  entries: [],
  boss: { kind: "gorge", levels: GORGE_LEVELS.slice(0, 1) },
  acts: [
    { tick: 630, control: "cannon", worldCol: 3 },
    { tick: 810, control: "fireRed" },
    { tick: 1080, control: "fireCyan" },
    { tick: 1260, control: "fireRed" },
    { tick: 1320, control: "fireRed" },
    { tick: 1500, control: "cannon", worldCol: 4 },
    { tick: 1620, control: "fireRed" },
    { tick: 1740, control: "cannon", worldCol: 5 },
    { tick: 1860, control: "fireCyan" },
    { tick: 1980, control: "cannon", worldCol: 6 },
    { tick: 2100, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "EACH BUBBLE WANTS SHOTS", anchor: { at: "boss" } },
    {
      tick: 180,
      seat: 1,
      text: "ONLY PLAYER 1 SEES THE COUNT",
      anchor: { at: "boss", part: "tally" },
    },
    { tick: 360, seat: 2, text: "ONLY PLAYER 2 SEES COLOUR", anchor: { at: "boss" } },
    {
      tick: 540,
      seat: 1,
      text: "PLAYER 1 PICKS A BUBBLE",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 720,
      seat: 2,
      text: "PLAYER 2 FIRES ITS COLOUR",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 990,
      seat: 2,
      text: "WRONG COLOUR · ONE COMES OUT",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 1440,
      seat: 1,
      text: "FULL · PICK THE NEXT",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 2160, seat: 1, text: "ALL FULL · LEVEL CLEAR", anchor: { at: "boss" } },
  ],
};
