import type { GuideScene } from "../scene-types.js";

/**
 * THE CANDLE's rehearsal: the field goes black, and the pair fights by the
 * light of its own shots.
 *
 * Nothing falls in it. The boss is a glow at the top of an unlit field, so
 * the film is the dark arriving and the five steps that put the glow out,
 * in the order the fight asks for them: a flash that dims it a step, seen as
 * three lit columns on player 2's screen alone (`showsCandleMuzzle`); the
 * glow drifting a column and the cannon slid under it; two more dims, the
 * second of which brings it down to two and turns it to **eat** — the cone
 * onto the column it faces drawn on player 1's screen alone
 * (`showsCandleFace`); a shot fired from that column, swallowed at the
 * muzzle and put back on the glow (`candleFed`), which is the one mistake
 * the fight has and the page that says what it costs; the cannon slid clear
 * of the faced column and two clean dims, the last of which stops it; and
 * the beam held on its column, the one light it cannot eat, putting it out
 * — two black beats, then the field lit again.
 *
 * Where the glow drifts and turns is the seeded rng's and not an author's,
 * so every slide under it says `atBoss` and `bossAnswerCol` reads the glow's
 * column at the moment the thumb goes down. The one slide that is not under
 * it is the mistake — the cannon put on the faced column on purpose — and
 * that column is authored, which is why the seed is 8: it faces column 3 for
 * eight beats running from the moment it starts eating, and 3 is one of the
 * seven columns an authored strip reaches; and it drifts between 3 and 6 the
 * whole film, so the glow is never far from the middle of the screen.
 *
 * On player 2's pages the cannon slides under the glow a moment before she
 * fires. That is player 1 doing his half — the glow moves every three beats
 * and a shot from under yesterday's column lights nothing — and on her
 * screen it is what the game looks like: the cannon goes where he puts it.
 *
 * Every page not on a control is on the hull, since the boss has no body to
 * anchor a page to.
 */
export const THE_CANDLE: GuideScene = {
  ticks: 2400,
  bpm: 120,
  seed: 8,
  entries: [],
  boss: { kind: "candle" },
  acts: [
    { tick: 330, control: "fireRed" },
    { tick: 510, control: "cannon", col: 3, atBoss: true },
    { tick: 645, control: "cannon", col: 3, atBoss: true },
    { tick: 690, control: "fireCyan" },
    { tick: 825, control: "cannon", col: 3, atBoss: true },
    { tick: 870, control: "fireRed" },
    { tick: 1185, control: "cannon", col: 2 },
    { tick: 1230, control: "fireRed" },
    { tick: 1410, control: "cannon", col: 3, atBoss: true },
    { tick: 1545, control: "cannon", col: 3, atBoss: true },
    { tick: 1590, control: "fireCyan" },
    { tick: 1725, control: "cannon", col: 3, atBoss: true },
    { tick: 1770, control: "fireRed" },
    { tick: 1945, control: "cannon", col: 3, atBoss: true },
    { tick: 1950, control: "fireCyan", until: 2200 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "THE FIELD GOES BLACK", anchor: { at: "hull" } },
    {
      tick: 240,
      seat: 2,
      text: "PLAYER 2 FIRES · IT DIMS",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 420,
      seat: 1,
      text: "IT DRIFTS · PLAYER 1 FOLLOWS",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 600,
      seat: 2,
      text: "PLAYER 2 FIRES WHERE HE SAYS",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 780,
      seat: 2,
      text: "ONE MORE · IT STARTS EATING",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 960, seat: 1, text: "ONLY PLAYER 1 SEES ITS FACE", anchor: { at: "hull" } },
    {
      tick: 1140,
      seat: 2,
      text: "SHOT FROM ITS FACE · EATEN",
      anchor: { at: "control", control: "fireRed" },
    },
    // This page said PLAYER 1 SLIDES CLEAR OF IT until 17 September 2026. The
    // fight writes CARRY over the cannon and MOVE under it the moment he is
    // standing in the column it is eating (`decisions.md` #34), so the verb
    // came out — but the page did not, because the slide at 1410 is his and
    // the pages either side are hers: take the page away and his screen is
    // never shown on the beat he acts. What is left is the half a cue may
    // never carry, which is the column and who says it.
    {
      tick: 1320,
      seat: 1,
      text: "PLAYER 1 CALLS ITS COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1500,
      seat: 2,
      text: "PLAYER 2 FIRES · CLEAR",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 1680,
      seat: 2,
      text: "ONE MORE · IT STOPS",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1860,
      seat: 2,
      text: "THE BEAM PUTS IT OUT",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 2130, seat: 1, text: "TWO BLACK BEATS · THEN LIGHT", anchor: { at: "hull" } },
  ],
};
