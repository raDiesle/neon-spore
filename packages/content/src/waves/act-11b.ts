import type { Wave } from "../wave-types.js";

/**
 * Act eleven's second page, opened for THE OCULUS on 2 October 2026, when
 * the owner reworked it and a wave came in to fall round it — `act-11.ts`
 * had no room for the arrivals, and the director writes this page whole
 * every time somebody paints on it (`tools/director/src/waves-act-files.ts`).
 *
 * **THE OCULUS**: an eye both seats shut together, then shoot in the socket
 * it cracks (`docs/spec/bosses-choreographed.md` §27). Three levels — a pair
 * held shut, a pair tapped shut, a pair turned shut by a lever each — and
 * after each one shot at the core, which waits for it. The owner: *people
 * need to fight wave, but when there is some idle time to keep fingers hold
 * the boss to proceed.* So nothing slows, and each level's fuse is long.
 *
 * The arrivals are a starting trickle of plain slicks, off the middle column
 * the core is shot up, to be painted over in the director.
 */
export const WAVES_ACT_11B: Wave[] = [
  {
    id: "theOculus",
    name: "THE OCULUS",
    guide: {
      both: "Shut the eye's leaves together, three times: hold, then tap, then turn. After each, shoot the eye in its colour. Shoot what falls in between.",
      p1: "1. Hold the left half with the other one.\n2. Then tap it. Then turn it round.\n3. When the eye shows a colour, fire it.",
      p2: "1. Hold the right half with the other one.\n2. Then tap it. Then turn it round.\n3. White takes either colour.",
    },
    entries: [
      { beat: 6, col: 0, color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 1, color: "red" },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 26, col: 0, color: "red" },
      { beat: 31, col: 6, color: "cyan" },
      { beat: 36, col: 1, color: "red" },
      { beat: 41, col: 5, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 51, col: 6, color: "cyan" },
      { beat: 56, col: 1, color: "red" },
      { beat: 61, col: 5, color: "cyan" },
      { beat: 66, col: 0, color: "red" },
      { beat: 71, col: 6, color: "cyan" },
      { beat: 76, col: 1, color: "red" },
      { beat: 81, col: 5, color: "cyan" },
      { beat: 86, col: 0, color: "red" },
    ],
    boss: {
      kind: "oculus",
      steps: [
        { ask: "shut", color: "either", beats: 6, fuse: 32 },
        { ask: "break", color: "either", beats: 2 },
        { ask: "fire", color: "red", beats: 0 },
        { ask: "tap", color: "either", beats: 32, need: 12 },
        { ask: "fire", color: "cyan", beats: 0 },
        { ask: "turn", color: "either", beats: 32, need: 8 },
        { ask: "fire", color: "either", beats: 0 },
      ],
    },
    bossType: "normal",
  },
];
