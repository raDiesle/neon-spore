import type { Wave } from "../wave-types.js";

/**
 * The end of the tutorial arc: CATCH AND AIM, the shield held twice, and
 * FINALE, the arc's last wave. It held the first six bosses, back to back,
 * until `waves:order` placed the bosses among the units they follow
 * (`bossOrder`) and the acts after this one were cut again in play order on
 * 16 October 2026 (`waves-recut.ts`). Nothing reorders the arc, so its files
 * keep the prose written over them.
 */
export const WAVES_ACT_2: Wave[] = [
  {
    id: "catchAndAim",
    name: "CATCH AND AIM",
    guide: {
      scene: "catchAndAim",
    },
    entries: [
      { beat: 4, col: 10, color: "cyan" },
      { beat: 9, col: 8, color: "red" },
      { beat: 15, col: 10, color: "red" },
    ],
    pods: [
      { beat: 0, col: 2, row: 3, kind: "ward" },
      { beat: 11, col: 0, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "catchAndAimAgain",
    name: "SHIELD HELD",
    variant: true,
    entries: [
      { beat: 6, col: 4, color: "cyan" },
      { beat: 14, col: 6, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 6, row: 4, kind: "ward" },
      { beat: 21, col: 5, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "catchAndAimReach",
    name: "HELD WIDE",
    variant: true,
    entries: [
      { beat: 5, col: 5, color: "cyan" },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 9, row: 3, kind: "ward" },
      { beat: 16, col: 10, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "finale",
    name: "FINALE",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 10, color: "red" },
      { beat: 2, col: 5, kind: "meteor", color: null },
      { beat: 4, col: 3, color: "cyan" },
      { beat: 4, col: 7, color: "red" },
      { beat: 7, col: 2, kind: "meteor", color: null },
      { beat: 7, col: 8, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
];
