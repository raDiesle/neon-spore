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
 * Every page not on a control is on the breach it is about
 * (`render/caption-anchor-boss-e.ts`, 21 September 2026): `plate` for the two
 * about the bow, `lobe` for the two about one standing, and the boss itself —
 * every breach it is pushing at — for the two about a pair. They were all on
 * the hull, which is the middle of the plating and never where the seed put
 * the lobe. The bow is drawn on player 1's screen alone (`showsUndertowBow`),
 * which is the first page, and the anchor is told by the same predicate.
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
    {
      tick: 0,
      seat: 1,
      text: "ONLY PLAYER 1 SEES THE BOW",
      anchor: { at: "boss", part: "plate" },
    },
    { tick: 180, seat: 1, text: "THE HULL BOWS FOUR BEATS", anchor: { at: "boss", part: "plate" } },
    {
      tick: 360,
      seat: 2,
      text: "A LOBE STANDS · NOBODY MOVES",
      anchor: { at: "boss", part: "lobe" },
    },
    { tick: 540, seat: 2, text: "LEFT ALONE · IT WIDENS", anchor: { at: "boss", part: "lobe" } },
    { tick: 720, seat: 2, text: "A SECOND LOBE · BOTH SCAR", anchor: { at: "boss" } },
    // Three pages here said a verb the fight now writes itself, 18 September
    // 2026 (`boss-cue-read-j.ts`): the slide, and the maw twice. All three
    // kept their tick, their seat and their anchor, because every one of them
    // is the only page of its seat over an act of its seat and a deleted one
    // would hand the ghost hand to the other screen (`new-tutorial`, *take the
    // verb out, not always the page*).
    //
    // This one says the reason the cannon has anywhere to be: the maw and the
    // beam both fire straight up the column the carriage is in
    // (`undertow-press.ts`, `lance-burn.ts`), and a cue may never name a
    // column.
    {
      tick: 1020,
      seat: 1,
      text: "THE MAW REACHES ONE COLUMN",
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
    // The beat after her plate was in his way, which is the moment the split
    // bites: neither seat is drawn the other's carriage (`showsCannon`,
    // `showsShield`), so the column he needs is a sentence she has to say. The
    // page said THE MAW TAKES IT AGAIN, which was the film narrating its own
    // verb a second time.
    {
      tick: 1560,
      seat: 1,
      text: "PLAYER 1 IS SHOWN NO SHIELD",
      anchor: { at: "control", control: "intake" },
    },
    { tick: 1740, seat: 2, text: "TWO AT ONCE · FOUR APART", anchor: { at: "boss" } },
    // Why the last lesson divides at all — one carriage, two lobes, four
    // columns apart. The cue says `OPEN` on the one he is under and nothing
    // about the other, because *which* is the pair's own sentence; the page
    // below answers it on her screen.
    {
      tick: 1920,
      seat: 1,
      text: "PLAYER 1 CANNOT REACH BOTH",
      anchor: { at: "control", control: "intake" },
    },
    {
      tick: 2100,
      seat: 2,
      text: "THE SHIELD TAKES THE FAR ONE",
      anchor: { at: "control", control: "shield" },
    },
  ],
};
