import type { GuideScene } from "../scene-types.js";

/**
 * THE GORGE's rehearsal: the sack eats every shot, and the pair feeds one
 * part of it on purpose.
 *
 * Nothing falls in it but what the sack gives back. The boss is a fixture
 * across the top of the field and the wave's own arrivals are left out, so
 * the film is the rule and its two mistakes, in the order the fight teaches
 * them: a shot at nothing, swallowed and hanging as a bead — the stray the
 * rest of the film pays for; the count under each intake, which only player
 * 1 is shown (`showsGorgeTally`); a column picked and filled in one colour;
 * **a wrong colour taking a bead back out**, which is the film's one
 * authored mistake and costs nothing but the bead; four of one colour going
 * clear and two more piercing it for good; a second column filled the same
 * way, and the sack, twice pierced, **spitting the stray back** down its own
 * column as a body of its colour — which is broken by its own colour, the
 * game's one colour rule (`bosses.md` §11.23) — with the cannon slid under it
 * first.
 *
 * The sack does not move and its intakes stand where `installGorge` puts
 * them, so every column is authored: 2 for the intake over column 3, 4 for
 * the one over 7, 3 for the middle, which is where the cannon starts and
 * where the stray goes. The seed matters to nothing here — the rng is asked
 * only for a mouth's colour, and the film ends two ruptures short of a mouth.
 * The mouth and the beam are the guide's prose; the film is the restraint.
 *
 * No page is anchored at `retries` and the film takes no hit: the spat body
 * is broken two thirds of the way down the field. The page about the spat
 * body is the film's longest, seven beats: a page about a body holds with
 * that body around the middle of the screen (`scene-pages.test.ts`), and
 * the sack spits from the top.
 */
export const THE_GORGE: GuideScene = {
  ticks: 3240,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "gorge" },
  acts: [
    { tick: 270, control: "fireRed" },
    { tick: 630, control: "cannon", col: 2 },
    { tick: 810, control: "fireCyan" },
    { tick: 870, control: "fireCyan" },
    { tick: 930, control: "fireCyan" },
    { tick: 1170, control: "fireRed" },
    { tick: 1350, control: "fireCyan" },
    { tick: 1410, control: "fireCyan" },
    { tick: 1590, control: "fireCyan" },
    { tick: 1650, control: "fireCyan" },
    { tick: 1830, control: "cannon", col: 4 },
    { tick: 2010, control: "fireRed" },
    { tick: 2070, control: "fireRed" },
    { tick: 2130, control: "fireRed" },
    { tick: 2190, control: "fireRed" },
    { tick: 2280, control: "fireRed" },
    { tick: 2340, control: "fireRed" },
    { tick: 2910, control: "cannon", col: 3 },
    { tick: 3090, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "A SACK HANGS · IT EATS SHOTS", anchor: { at: "boss" } },
    {
      tick: 180,
      seat: 2,
      text: "PLAYER 2 FIRES · IT IS EATEN",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 360,
      seat: 1,
      text: "ONLY PLAYER 1 SEES THE COUNT",
      anchor: { at: "boss", part: "tally" },
    },
    {
      tick: 540,
      seat: 1,
      text: "PLAYER 1 PICKS A COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 720,
      seat: 2,
      text: "PLAYER 2 FILLS IT · CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 1080,
      seat: 2,
      text: "WRONG COLOUR · A BEAD LEAVES",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1260,
      seat: 2,
      text: "FOUR CYAN · IT GOES CLEAR",
      anchor: { at: "control", control: "fireCyan" },
    },
    // ONE MORE · IT BURSTS stood here. From the beat the fourth bead goes in,
    // the field says PIERCE on her screen and PINCH on his
    // (`render/boss-cue-read-n.ts`), so the page's verb is the field's twice
    // over. What no cue may carry is the count and the clock under it: two
    // shots (`gorgeVentShots`) inside `gorgeVentBeats`, eight, the only
    // warning the pair gets (`config-gorge.ts`) and the whole reason his
    // other thumb is on the lobe.
    {
      tick: 1500,
      seat: 2,
      text: "TWO SHOTS IN EIGHT BEATS",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 1740,
      seat: 1,
      text: "PLAYER 1 PICKS THE NEXT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1920,
      seat: 2,
      text: "FOUR RED · THEN TWO MORE",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 2400, seat: 2, text: "TWO BURST · IT SPITS ONE OUT", anchor: { at: "body" } },
    {
      tick: 2820,
      seat: 1,
      text: "PLAYER 1 SLIDES UNDER IT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 3000,
      seat: 2,
      text: "ITS OWN COLOUR BREAKS IT",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
