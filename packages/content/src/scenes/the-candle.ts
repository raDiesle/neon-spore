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
 * the fight has and the page that says what it costs; the cannon slid back
 * under the glow and two clean dims, the last of which stops it; then
 * the pilot's thumb pulling the flame down off the wick, which is the one
 * thing the last step answers to; and the beam held on its column into the
 * smoke, the one light it cannot eat, putting it out
 * — two black beats, then the field lit again.
 *
 * Where the glow drifts and turns is the seeded rng's and not an author's,
 * so every slide under it says `atBoss` and `bossAnswerCol` reads the glow's
 * column at the moment the thumb goes down. The one slide that is not under
 * it is the mistake — the cannon put on the faced column on purpose — and
 * that column is authored, which is why the seed is 8: it faces **the field's
 * column 3** for eight beats running from the moment it starts eating, and
 * that column is one an authored strip can reach; and it drifts between the
 * field's 5 and 6 the whole film, so the glow is never far from the middle of
 * the screen.
 *
 * **The act at 1185 says `col: 2`, and the two numbers are the same column.**
 * An act is authored on seven columns and the field has eleven, so a film's
 * numbers go through `mapCol` before the world sees them — and `mapCol(2)` is
 * 3. Every other number in this block is the field's, because that is what the
 * boss reports and what a person watching counts. A lane read the doc against
 * the act, took 3 against 2 for an off-by-one and went looking for a shot that
 * is never eaten; `scene-candle.test.ts` answers that question now rather than
 * leaving it to be asked again.
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
  // Written and proved with no shot grid; on the game's half-beat one
  // the glow is never dimmed, fed or put out (`scene-types.ts` `chargeBeats`).
  chargeBeats: 0,
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
    { tick: 1830, drag: "candleWick", by: 1890, until: 1920 },
    { tick: 1945, control: "cannon", col: 3, atBoss: true },
    { tick: 1950, control: "fireCyan", until: 2200 },
  ],
  steps: [
    // The one light left, and the page is round it: the field going black is
    // the flame's doing, and a ring on the hull said only *somewhere down
    // here*.
    { tick: 0, seat: 2, text: "THE FIELD GOES BLACK", anchor: { at: "boss" } },
    // PLAYER 2 FIRES · IT DIMS stood here. The field says her verb on the
    // glow, so what is left is the half a cue may never carry: red and cyan
    // both take a step off it, and the beam does too (`candleStruck`). The
    // dark is difficulty enough without a colour rule on top of it.
    {
      tick: 240,
      seat: 2,
      text: "EITHER COLOUR DIMS IT",
      anchor: { at: "control", control: "fireRed" },
    },
    // PLAYER 1 FOLLOWS came off this page on 19 September 2026: the field
    // writes MOVE on the cannon the whole time it is out from under the glow
    // (`boss-cue-read-m.ts`), which is the following. What no cue states is
    // why it keeps happening — the light does not stay still.
    {
      tick: 420,
      seat: 1,
      text: "IT DRIFTS EVERY FEW BEATS",
      anchor: { at: "control", control: "cannon" },
    },
    // PLAYER 2 FIRES WHERE HE SAYS stood here, and both halves are now the
    // field's: her verb stands on the glow, and it goes quiet while the
    // cannon is anywhere else. So the page takes the count instead, which a
    // cue may never carry — five steps, and the halo is the whole of them.
    {
      tick: 600,
      seat: 2,
      text: "FIVE HITS PUT IT OUT",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 780,
      seat: 2,
      text: "ONE MORE · IT STARTS EATING",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 960,
      seat: 1,
      text: "ONLY PLAYER 1 SEES ITS FACE",
      anchor: { at: "boss", part: "face" },
    },
    {
      tick: 1140,
      seat: 2,
      text: "SHOT FROM ITS FACE · EATEN",
      anchor: { at: "control", control: "fireRed" },
    },
    // This page said PLAYER 1 SLIDES CLEAR OF IT until 17 September 2026. The
    // field writes CARRY over the cannon and MOVE under it whenever it is out
    // from under the glow (`decisions.md` #34, `boss-cue-read-m.ts`), so the
    // verb came out — but the page did not, because the slide at 1410 is his
    // and the pages either side are hers: take the page away and his screen
    // is never shown on the beat he acts. What is left is the half a cue may
    // never carry, which is the column and who says it.
    {
      tick: 1320,
      seat: 1,
      text: "PLAYER 1 CALLS ITS COLUMN",
      anchor: { at: "control", control: "cannon" },
    },
    // PLAYER 2 FIRES · CLEAR stood here. The verb is the field's, and what
    // it cannot say is the clearing: the flame is turned somewhere else this
    // beat, and only the seat that sees the cone knows it.
    {
      tick: 1500,
      seat: 2,
      text: "OFF ITS FACE · IT DIMS",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 1680,
      seat: 2,
      text: "ONE MORE · IT STOPS",
      anchor: { at: "control", control: "fireRed" },
    },
    // One page for the two gestures the last step is, and it is player 1's:
    // the flame is a handle on his picture and the beam is a word he says to
    // her, which is this fight's own sentence and not a second page.
    {
      tick: 1860,
      seat: 1,
      text: "PULL IT DOWN · THEN BURN",
      anchor: { at: "handle", target: "candleWick" },
    },
    // The wick he has just pulled the flame off, where the light comes back.
    { tick: 2130, seat: 1, text: "TWO BLACK BEATS · THEN LIGHT", anchor: { at: "boss" } },
  ],
};
