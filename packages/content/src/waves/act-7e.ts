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
 * **THE THROAT's wave is the four things its mouth can be set to eat**, one
 * kind at a time at first and then two at once: red slicks, cyan bulbs, rocks
 * and pods, so every one of the four buttons has a body to be pressed for. The
 * mouth replaces the cannon and the shield, so anything that reaches the hull
 * is a hit — the arrivals are spaced eight beats apart to begin with, the
 * time a carry and a colour change take, and closer once the pair has both.
 * Sixteen bodies, four of them pods, against five rings, so a pair that lets a few through still
 * has the swallows to finish it (`sim/throat-suck.ts`).
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
    id: "theBalloon",
    name: "THE BALLOON",
    guide: {
      scene: "theBalloon",
    },
    entries: [
      { beat: 0, col: 3, kind: "balloon", color: null },
      { beat: 6, col: 8, kind: "balloon", color: null },
      { beat: 16, col: 7, kind: "balloon", color: null },
      { beat: 24, col: 0, kind: "balloon", color: null },
      { beat: 26, col: 10, kind: "balloon", color: null },
      { beat: 36, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonAgain",
    name: "BALLOONS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "balloon", color: null },
      { beat: 8, col: 3, kind: "choir", color: "cyan" },
      { beat: 14, col: 4, kind: "balloon", color: null },
      { beat: 22, col: 9, kind: "choir", color: "cyan" },
      { beat: 30, col: 8, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonSpread",
    name: "BALLOONS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "balloon", color: null },
      { beat: 5, col: 0, kind: "choir", color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 15, col: 9, kind: "balloon", color: null },
      { beat: 21, col: 2, kind: "choir", color: "cyan" },
      { beat: 26, col: 10, color: "red" },
    ],
  },
  {
    id: "theBalloonReach",
    name: "BALLOONS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "balloon", color: null },
      { beat: 6, col: 7, kind: "choir", color: "red" },
      { beat: 11, col: 2, kind: "meteorMedium", color: null },
      { beat: 17, col: 7, kind: "balloon", color: null },
      { beat: 22, col: 0, kind: "choir", color: "red" },
      { beat: 28, col: 8, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theBalloonPair",
    name: "BALLOON AND CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 3, kind: "balloon", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 0, kind: "choir", color: "red" },
      { beat: 19, col: 5, color: "cyan" },
      { beat: 19, col: 8, color: "cyan" },
      { beat: 25, col: 8, kind: "echo", color: "red" },
      { beat: 30, col: 4, kind: "balloon", color: null },
      { beat: 36, col: 3, color: "red" },
      { beat: 36, col: 7, color: "red" },
    ],
  },
  {
    id: "theBalloonBreathe",
    name: "EASY BALLOONS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 7, col: 3, kind: "balloon", color: null },
      { beat: 14, col: 1, color: "cyan" },
      { beat: 22, col: 9, kind: "choir", color: "red" },
      { beat: 30, col: 1, color: "red" },
      { beat: 37, col: 10, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theBalloonRecall",
    name: "BALLOON RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 0, kind: "balloon", color: null },
      { beat: 12, col: 1, color: "red" },
      { beat: 17, col: 3, kind: "gyre", color: null },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 0, kind: "balloon", color: null },
      { beat: 33, col: 6, kind: "gyre", color: null },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theBalloonBend",
    name: "BALLOONS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 0, kind: "balloon", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 16, col: 4, kind: "choir", color: "cyan" },
      { beat: 21, col: 8, kind: "balloon", color: null },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "cyan" },
      { beat: 32, col: 8, kind: "choir", color: "red" },
      { beat: 38, col: 7, kind: "balloon", color: null },
      { beat: 43, col: 0, color: "cyan" },
      { beat: 43, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theBalloonPeak",
    name: "BALLOON PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 8, kind: "balloon", color: null },
      { beat: 8, col: 0, color: "cyan" },
      { beat: 8, col: 10, color: "cyan" },
      { beat: 12, col: 3, kind: "choir", color: "red" },
      { beat: 20, col: 3, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 24, col: 10, kind: "balloon", color: null },
      { beat: 28, col: 1, kind: "choir", color: "red" },
      { beat: 32, col: 0, color: "red" },
      { beat: 32, col: 10, color: "red" },
      { beat: 40, col: 2, kind: "balloon", color: null },
      { beat: 44, col: 4, color: "red" },
      { beat: 44, col: 7, color: "red" },
      { beat: 48, col: 6, kind: "choir", color: "cyan" },
    ],
    pods: [
      { beat: 16, col: 2, row: 3, kind: "purge" },
      { beat: 36, col: 0, row: 3, kind: "purge" },
    ],
  },
  {
    id: "theBaton",
    name: "THE BATON",
    guide: {
      scene: "theBaton",
    },
    entries: [],
    boss: { kind: "baton" },
    bossType: "normal",
  },
  {
    id: "theUndertow",
    name: "THE UNDERTOW",
    guide: {
      scene: "theUndertow",
    },
    entries: [
      { beat: 54, col: 2, color: "red" },
      { beat: 62, col: 8, color: "cyan" },
      { beat: 70, col: 0, color: "cyan" },
      { beat: 78, col: 10, color: "red" },
      { beat: 86, col: 3, color: "red" },
      { beat: 94, col: 7, color: "cyan" },
    ],
    boss: { kind: "undertow" },
    bossType: "normal",
  },
];
