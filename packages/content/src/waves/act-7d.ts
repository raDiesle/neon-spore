import type { Wave } from "../wave-types.js";

/**
 * The fourth page of act seven, cut off `act-7c.ts` on 20 September 2026,
 * when that page held eight waves at 241 of 250 lines with no room for a
 * ninth and no letter of its own to give one: `act-7c.ts` is not the last
 * page of act seven, so the overflow could not simply take the next free
 * letter without playing every later wave out of order. Every page from `7d`
 * on shifted up one letter instead — the standing convention
 * `docs/queue.md`'s *Act seven has no room* entry settled, the same move
 * `act-7e.ts` (as `act-7d.ts`, the day before) made for THE TASTER and THE
 * SINEW.
 *
 * **`7d` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order
 * of the game.
 */
export const WAVES_ACT_7D: Wave[] = [
  {
    id: "theBaton",
    name: "THE BATON",
    guide: {
      scene: "theBaton",
    },
    entries: [
      { beat: 14, col: 0, color: "red" },
      { beat: 19, col: 6, color: "cyan" },
      { beat: 25, col: 1, color: "red" },
      { beat: 31, col: 5, kind: "meteor", color: null },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 42, col: 0, color: "red" },
      { beat: 47, col: 1, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 57, col: 6, color: "red" },
      { beat: 62, col: 0, kind: "meteor", color: null },
      { beat: 67, col: 1, color: "cyan" },
      { beat: 72, col: 5, color: "red" },
      { beat: 77, col: 6, kind: "meteor", color: null },
      { beat: 82, col: 0, color: "cyan" },
      { beat: 87, col: 1, color: "red" },
      { beat: 92, col: 5, kind: "meteor", color: null },
      { beat: 97, col: 6, color: "cyan" },
      { beat: 102, col: 0, color: "red" },
    ],
    boss: { kind: "baton" },
    bossType: "normal",
  },
];
