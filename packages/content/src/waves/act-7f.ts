import type { Wave } from "../wave-types.js";

/**
 * The sixth page of act seven, cut off `act-7e.ts` on 19 September 2026, when
 * that page sat eight lines under the ceiling with six §6.1/§6.2 guide-line
 * lanes still queued against it: a guide line is the one thing in a wave file
 * that gets longer when it gets truer, so the next of those lanes to land
 * would have paid for the seam rather than asked for it (`docs/queue.md`).
 *
 * **It took the letter `e` on 19 September 2026 and the page ahead of it
 * became `act-7f.ts`**, rather than appending after it, because THE TASTER
 * and THE SINEW were that page's own last two waves at the time and the order
 * of the waves is the order of the game: that page (THE LEDGER onward)
 * already came *after* them in that order, so a page appended past it would
 * have played them seven waves later than the game has always played them.
 *
 * **It moved again on 20 September 2026**, to `act-7f.ts`, when `act-7c.ts`
 * hit the same shape of overflow: THE DIASTOLE and THE BATON — `act-7c.ts`'s
 * own last two waves — needed a page of their own between it and this one,
 * so this page and every page after it shifted up a letter, the way
 * `docs/queue.md`'s *Act seven has no room* entry names as the standing
 * convention for exactly this shape of overflow.
 *
 * **THE TASTER's arrivals are the colours it is counting.** The fan reads what
 * the pair has fired over the last thirty beats, so every body under it costs
 * a shot in a colour the boss will then grow armour in — which makes this the
 * one wave where a body answered *without* firing is worth something. Rocks
 * for the shield, and three slicks and three bulbs, evenly split and
 * alternating, so the lean is a decision the pair makes rather than one the
 * wave makes for them. Nothing is placed against the fan's own count, for THE
 * DIASTOLE's reason: which beat a blade sets its edge on depends on when the
 * pair sheared the last one, a beat nobody can know at authoring time.
 */
export const WAVES_ACT_7F: Wave[] = [
  {
    id: "theTaster",
    name: "THE TASTER",
    guide: {
      scene: "theTaster",
    },
    entries: [
      { beat: 16, col: 1, kind: "meteor", color: null },
      { beat: 24, col: 5, kind: "meteor", color: null },
      { beat: 30, col: 3, color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 44, col: 6, kind: "meteor", color: null },
      { beat: 50, col: 2, color: "red" },
      { beat: 56, col: 4, color: "cyan" },
      { beat: 64, col: 3, kind: "meteor", color: null },
      { beat: 72, col: 1, color: "cyan" },
      { beat: 80, col: 5, color: "red" },
    ],
    boss: { kind: "taster" },
    bossType: "normal",
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    guide: {
      scene: "theSinew",
    },
    entries: [
      { beat: 16, col: 1, color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 34, col: 2, kind: "meteor", color: null },
      { beat: 42, col: 4, color: "red" },
      { beat: 52, col: 0, color: "cyan" },
      { beat: 60, col: 6, kind: "meteor", color: null },
      { beat: 70, col: 1, color: "cyan" },
      { beat: 80, col: 5, color: "red" },
    ],
    boss: { kind: "sinew" },
    bossType: "normal",
  },
];
