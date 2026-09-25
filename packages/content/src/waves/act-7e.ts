import type { Wave } from "../wave-types.js";

/**
 * The fifth page of act seven, cut off `act-7c.ts` when THE THROAT and THE
 * BATON landed on it within an hour of each other and took it seventeen lines
 * over the 250-line ceiling.
 *
 * **It opens on THE UNDERTOW and ends on THE CURTAIN since 19 September 2026**,
 * when the page sat eight lines under the ceiling with six §6.1/§6.2
 * guide-line lanes still queued against it — a guide line is the one thing in
 * a wave file that gets longer when it gets truer, so the next of those lanes
 * would have paid for the seam rather than wanted it (`docs/queue.md`). THE
 * UNDERTOW came over from `act-7c.ts` on 18 September 2026; THE LEDGER and THE
 * SURGE went on to what is now `act-7g.ts` the same day; THE TASTER and THE
 * SINEW went on to what is now `act-7f.ts` the next day, which took the letter
 * the LEDGER page had been using and pushed that page on — a page in front of
 * it cannot take the letter after it without playing THE TASTER and THE SINEW
 * later than the game has always played them, since they were this page's own
 * last two waves.
 *
 * **It took the letter `e` on 20 September 2026**, when THE BATON (and a
 * wave since removed) needed a page of their own between `act-7c.ts` and this one and every
 * page from here on shifted up a letter (`docs/queue.md`'s *Act seven has no
 * room* entry).
 *
 * **`7e` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order of
 * the game. It started one wave long, holds six, and sits 52 lines under the
 * ceiling as of 20 September 2026 — so the next §6.1/§6.2 guide line queued
 * against it is paid for on this page rather than by another seam
 * (`docs/queue.md`).
 *
 * **THE THROAT is the only wave in this game authored to be *eaten*.** The
 * gullet hangs from the top down to `throatMouthRow` with its mouth in authored
 * column 3 — `midCol` of whatever field is played — and every arrival on it is
 * one of two things: a gum for player 1 to fling into that mouth, or a body the
 * throat will swallow and heal off if the pair leaves it standing there. So the
 * middle column is not kept clear; it is
 * *stocked*, on purpose, with the bodies whose answer is a cannon shot and the
 * ones whose answer is a hand.
 *
 * The gums are authored one lane either side of the mouth at first and out at
 * the walls later, for the arithmetic rather than the difficulty: a gum falls
 * a row a beat, so one dropped in authored column 2 is on the mouth's row five
 * beats later and a swipe from there crosses `gumFlingCols` into the mouth on
 * the next beat; one at the wall gives three beats of flight and a moved mouth.
 *
 * **Nothing is placed against the inhale's own count**: which beat the tube tightens on depends on when the pair
 * chokes its second ring, a beat nobody can know at authoring time.
 *
 * **THE GORGE's arrivals are what the pair must answer without missing.** The
 * sack swallows every shot that reaches the top of the field, so the cost of
 * a body on this wave is the shot fired at where it *was*: rocks for the
 * shield, so the cannon can stay on its column, and a few slicks and bulbs
 * of both colours — some in the middle column on purpose, where a body
 * standing in the fill takes the bead meant for the intake. The design's
 * *let them reach the hull* is not authored, because a hull hit fails the
 * wave (`sim/wave-fail.ts`); what is authored is a field the restraint is
 * against.
 *
 * **THE CURTAIN's wave is empty**: what falls is
 * the core's own fire, from where and when the pair left it bare (`sim/curtain-step.ts`).
 */
export const WAVES_ACT_7E: Wave[] = [
  {
    id: "theUndertow",
    name: "THE UNDERTOW",
    guide: {
      scene: "theUndertow",
    },
    entries: [
      { beat: 54, col: 1, color: "red" },
      { beat: 62, col: 5, color: "cyan" },
      { beat: 70, col: 0, color: "cyan" },
      { beat: 78, col: 6, color: "red" },
      { beat: 86, col: 2, color: "red" },
      { beat: 94, col: 4, color: "cyan" },
    ],
    boss: { kind: "undertow" },
    bossType: "normal",
  },
  {
    id: "theThroat",
    name: "THE THROAT",
    guide: {
      scene: "theThroat",
    },
    entries: [
      { beat: 2, col: 4, kind: "gum", color: null },
      { beat: 8, col: 3, color: "red" },
      { beat: 12, col: 2, kind: "gum", color: null },
      { beat: 18, col: 3, kind: "meteor", color: null },
      { beat: 22, col: 6, kind: "gum", color: null },
      { beat: 26, col: 1, color: "cyan" },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 34, col: 0, kind: "gum", color: null },
      { beat: 40, col: 5, color: "red" },
      { beat: 44, col: 3, kind: "gum", color: null },
      { beat: 50, col: 2, kind: "meteor", color: null },
      { beat: 54, col: 6, kind: "gum", color: null },
      { beat: 60, col: 4, color: "red" },
      { beat: 64, col: 0, kind: "gum", color: null },
      { beat: 70, col: 3, color: "cyan" },
      { beat: 76, col: 2, kind: "gum", color: null },
    ],
    boss: { kind: "throat" },
    bossType: "normal",
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    guide: {
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 1, kind: "meteor", color: null },
      { beat: 28, col: 5, kind: "meteor", color: null },
      { beat: 34, col: 3, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 6, kind: "meteor", color: null },
      { beat: 52, col: 3, color: "cyan" },
      { beat: 60, col: 2, kind: "meteor", color: null },
      { beat: 66, col: 4, color: "red" },
      { beat: 74, col: 3, kind: "meteor", color: null },
      { beat: 82, col: 1, color: "cyan" },
    ],
    boss: { kind: "gorge" },
    bossType: "normal",
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    guide: {
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
];
