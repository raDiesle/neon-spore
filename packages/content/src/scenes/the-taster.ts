import type { GuideScene } from "../scene-types.js";

/**
 * THE TASTER's rehearsal: the colour you keep firing is the colour that
 * stops working.
 *
 * Nothing falls in it. The fan is a fixture across the top of the field and
 * the wave's own arrivals are left out, because every one of them is a shot
 * the ledger would count and the film's whole arithmetic is the ledger
 * (`sim/spend.ts`): three reds at nothing, tasted, and the first blade sets
 * red; a fourth red into it, which only thickens it — the film's one
 * authored mistake; two cyans to take it off, a layer and then the blade;
 * the cannon slid under the next one, over column 6, which no authored
 * column reaches (`atBoss`, `sim/boss-answer.ts`); one cyan taking that
 * one; and the fan, two blades down, growing three at once — **all of them
 * red**, because the pair has spent four red to three cyan and the fan reads
 * nothing else. Both seats see every blade and its edge; player 1 is shown
 * the column the crest opens next (`showsTasterNext`), player 2 the two
 * counts on the ridge (`showsTasterTally`), and the film ends on the counts.
 *
 * **The counts are never level**, on purpose: a dead heat is decided by the
 * seeded rng (`setEdges`), and a film whose colour turned on the seed would
 * be a film about the seed. Four to three holds red through every set the
 * film shows, so the seed matters to nothing. The three reds have to be in
 * the muzzle before the first blade sets on beat 5 (`tasterGrowBeats`), a
 * bolt takes a beat to reach the crest, and the cannon will not fire twice
 * inside half a beat — so the first red is the first page's, and the other
 * two are the second's, close together.
 *
 * Every column but one is authored: the fan opens from the middle outward
 * (`tasterOrder`), the middle is where the cannon starts, and the second
 * blade is the one the strip asks the boss for. No page is anchored at
 * `retries` and the film takes no hit — the fan does nothing to the hull.
 * The hurrying, the crest cut and the beam are the guide's prose.
 */
export const THE_TASTER: GuideScene = {
  ticks: 1920,
  bpm: 120,
  // Written and proved with no shot grid; on the game's half-beat one
  // the tongue thickens twice instead of once (`scene-types.ts` `chargeBeats`).
  chargeBeats: 0,
  seed: 1,
  entries: [],
  boss: { kind: "taster" },
  acts: [
    { tick: 90, control: "fireRed" },
    { tick: 185, control: "fireRed" },
    { tick: 215, control: "fireRed" },
    { tick: 630, control: "fireRed" },
    { tick: 810, control: "fireCyan" },
    { tick: 990, control: "fireCyan" },
    { tick: 1170, control: "cannon", col: 3, atBoss: true },
    { tick: 1350, control: "fireCyan" },
  ],
  steps: [
    {
      tick: 0,
      seat: 2,
      text: "A BLADE GROWS · FIRE RED",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 180,
      seat: 2,
      text: "TWICE MORE · IT TASTES THEM",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 420, seat: 1, text: "THE EDGE SETS RED · SAY IT", anchor: { at: "boss" } },
    {
      tick: 600,
      seat: 2,
      text: "RED AGAIN · IT THICKENS",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 780,
      seat: 2,
      text: "CYAN · ONE LAYER COMES OFF",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 960,
      seat: 2,
      text: "CYAN AGAIN · STRUCK OFF",
      anchor: { at: "control", control: "fireCyan" },
    },
    // PLAYER 1 HOLDS THE NEXT ONE stood here. The field says his column now —
    // `CARRY` / `MOVE` on the cannon while the one he is in has nothing that can
    // be answered (`boss-cue-read-b.ts`) — so the page takes the half no cue may
    // carry, and in this fight it is the trap itself: the ledger counted the
    // colour of every shot before it got anywhere, the gaps included
    // (`taster-shot.ts`, `sim/spend.ts`).
    {
      tick: 1140,
      seat: 1,
      text: "EVERY SHOT FEEDS THE COUNT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1320,
      seat: 2,
      text: "THE OTHER COLOUR · ALWAYS",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 1500, seat: 1, text: "THREE GROW AT ONCE · ALL RED", anchor: { at: "boss" } },
    {
      tick: 1680,
      seat: 2,
      text: "PLAYER 2 SEES BOTH COUNTS",
      anchor: { at: "boss", part: "tally" },
    },
  ],
};
