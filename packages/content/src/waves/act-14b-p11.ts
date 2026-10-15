import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p10.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P11: Wave[] = [
  {
    id: "theGall",
    name: "THE GALL",
    guide: {
      both: "Tap the alien on your half until it shakes. Then pull it up. It jumps to your partner's half. Shoot it when it glows.",
      p1: "1. It starts on your half. Tap it, then pull it up.\n2. When it lands on your half, do it again.\n3. When it glows, move the cannon under it.",
      p2: "1. When it lands on your half, tap it, then pull it up.\n2. Be fast. Every landing starts the clock.\n3. When it glows, shoot it in its colour.",
    },
    entries: [],
    boss: {
      kind: "gall",
      steps: [
        { ask: "leap", taps: 3, color: "either", beats: 6 },
        { ask: "leap", taps: 3, color: "either", beats: 5 },
        { ask: "fire", taps: 0, color: "red", beats: 6 },
        { ask: "leap", taps: 4, color: "either", beats: 5 },
        { ask: "leap", taps: 5, color: "either", beats: 5 },
        { ask: "leap", taps: 5, color: "either", beats: 4 },
        { ask: "fire", taps: 0, color: "cyan", beats: 6 },
        { ask: "leap", taps: 6, color: "either", beats: 4 },
        { ask: "leap", taps: 6, color: "either", beats: 4 },
        { ask: "leap", taps: 7, color: "either", beats: 4 },
        { ask: "fire", taps: 0, color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
