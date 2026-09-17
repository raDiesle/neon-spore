import type { GuideScene } from "../scene-types.js";

/**
 * THE UNDERTOW's rehearsal: the floor bows, and the pair answers it downward.
 *
 * Nothing falls in it. The boss is a fixture in the hull and the field stays
 * empty, so the film is the pushes and the two answers, in the order the
 * fight asks them: a first lobe nobody touches, whose breach widens 100 a beat
 * with no plate on it, reaches `undertowWideMilli` on its fourth beat and puts
 * **a second lobe up next door**, both of which then withdraw and leave two
 * columns scarred (`scarHull`); a second the cannon is
 * slid under while the plate is still bowing and the maw is opened over as it
 * comes through — a maw already open on the beat the lobe stands takes it
 * that beat (`through` → `undertowTake`), which is the guide's *open the maw
 * as the lobe comes through*; a third that bows under the plate, because a
 * shield standing on the column keeps the maw out of it as well as stopping
 * it widening, so player 2 has to move off before player 1 can answer; and
 * the first pair, four columns apart, where the maw takes the near one and
 * the plate stands on the far one.
 *
 * Where a lobe comes up is the seeded rng's and not an author's, so the
 * cannon acts say `atBoss` and `bossAnswerCol` reads the first breach at the
 * moment the thumb goes down. The shield's column is authored, and that is
 * why the seed is 36: the far lobe of a pair has to stand in a column
 * `mapCol` reaches — 3 and 7 are the one pair that does — and this seed puts
 * a single under the plate first, so the third lesson comes for free.
 *
 * Every page not on a control is on the hull, since the boss has no body to
 * anchor a page to. The bow is drawn on player 1's screen alone
 * (`showsUndertowBow`), which is the first page.
 */
export const THE_UNDERTOW: GuideScene = {
  ticks: 2400,
  bpm: 120,
  seed: 36,
  entries: [],
  boss: { kind: "undertow" },
  acts: [
    { tick: 1110, control: "cannon", col: 3, atBoss: true },
    { tick: 1240, control: "intake" },
    { tick: 1410, control: "cannon", col: 3, atBoss: true },
    { tick: 1440, control: "shield", col: 0 },
    { tick: 1600, control: "intake" },
    { tick: 1770, control: "cannon", col: 3, atBoss: true },
    { tick: 1965, control: "intake" },
    { tick: 2140, control: "shield", col: 4 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "ONLY PLAYER 1 SEES THE BOW", anchor: { at: "hull" } },
    { tick: 180, seat: 1, text: "A PLATE BOWS FOUR BEATS", anchor: { at: "hull" } },
    { tick: 360, seat: 2, text: "A LOBE STANDS · NOBODY MOVES", anchor: { at: "hull" } },
    { tick: 540, seat: 2, text: "LEFT ALONE · IT WIDENS", anchor: { at: "hull" } },
    { tick: 720, seat: 2, text: "A SECOND LOBE · BOTH SCAR", anchor: { at: "hull" } },
    {
      tick: 1020,
      seat: 1,
      text: "PLAYER 1 SLIDES UNDER IT",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1200,
      seat: 1,
      text: "MAW OPEN AS IT COMES THROUGH",
      anchor: { at: "control", control: "intake" },
    },
    // This page said PLAYER 2 MOVES THE PLATE OFF until 17 September 2026: the
    // fight writes CARRY over the plate and MOVE under it exactly while it
    // stands in the column the maw is coming for (`decisions.md` #34). The
    // plate at 1440 is hers and both neighbours are his, so the page keeps her
    // screen and says the reason instead of the verb. MAW OPEN AS IT COMES
    // THROUGH above stays: its subject is the beat, not the gesture.
    {
      tick: 1380,
      seat: 2,
      text: "THE COLUMN IS HIS TO REACH",
      anchor: { at: "control", control: "shield" },
    },
    {
      tick: 1560,
      seat: 1,
      text: "THE MAW TAKES IT AGAIN",
      anchor: { at: "control", control: "intake" },
    },
    { tick: 1740, seat: 2, text: "TWO AT ONCE · FOUR APART", anchor: { at: "hull" } },
    {
      tick: 1920,
      seat: 1,
      text: "THE MAW TAKES THE NEAR ONE",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 2100,
      seat: 2,
      text: "PLAYER 2 PLATES THE FAR ONE",
      anchor: { at: "control", control: "shield" },
    },
  ],
};
