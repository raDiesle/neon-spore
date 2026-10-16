import { MATRON_SCRIPT } from "../matron-script.js";
import type { Wave } from "../wave-types.js";

/**
 * The end of the tutorial arc: CATCH AND AIM, the shield held twice, and
 * FINALE, the arc's last wave — THE MATRON since 16 October 2026, the owner's
 * boss about everything the arc taught, the pods most of all (`sim/matron.ts`).
 * It held the first six bosses, back to back,
 * until `waves:order` placed the bosses among the units they follow
 * (`bossOrder`) and the acts after this one were cut again in play order on
 * 16 October 2026 (`waves-recut.ts`). Nothing reorders the arc, so its files
 * keep the prose written over them.
 */
export const WAVES_ACT_2: Wave[] = [
  {
    id: "catchAndAim",
    name: "CATCH AND AIM",
    variant: true,
    guide: {
      scene: "catchAndAim",
    },
    entries: [
      { beat: 4, col: 10, color: "cyan" },
      { beat: 9, col: 8, color: "red" },
      { beat: 15, col: 10, color: "red" },
    ],
    pods: [
      { beat: 0, col: 2, row: 3, kind: "pod" },
      { beat: 11, col: 0, row: 4, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "catchAndAimAgain",
    name: "AIM RISING",
    variant: true,
    entries: [
      { beat: 6, col: 4, color: "cyan" },
      { beat: 14, col: 6, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 6, row: 4, kind: "pod" },
      { beat: 21, col: 5, row: 4, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "catchAndAimReach",
    name: "LONG AIM ROAD",
    variant: true,
    entries: [
      { beat: 5, col: 5, color: "cyan" },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 9, row: 3, kind: "pod" },
      { beat: 16, col: 10, row: 4, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "finale",
    name: "FINALE",
    guide: {
      both: "A mother slime with pods on her lobes. Take every pod off her before its ring runs out. She throws bodies, rocks and torches at you.",
      p1: "1. Move the cannon under a falling pod and open the maw.\n2. Fire the SHIELD under a rock or a torch.\n3. Move the cannon where your partner says.",
      p2: "1. Shoot each pod loose, in either colour.\n2. Shoot each body in its colour.\n3. Slide the shield under a rock or a torch.",
    },
    entries: [],
    boss: { kind: "matron", steps: MATRON_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
