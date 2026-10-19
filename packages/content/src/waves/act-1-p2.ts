import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P2: Wave[] = [
  {
    id: "theEcho",
    name: "THE ECHO",
    hints: "theEcho",
    entries: [
      { beat: 0, col: 5, kind: "echo", color: "cyan" },
      { beat: 12, col: 5, kind: "echo", color: "red" },
      { beat: 20, col: 10, color: "red" },
      { beat: 28, col: 0, color: "cyan" },
      { beat: 36, col: 3, kind: "echo", color: "cyan" },
      { beat: 44, col: 7, kind: "echo", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theEchoRecall",
    name: "ECHO SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 8, col: 2, kind: "echo", color: "cyan" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 23, col: 8, kind: "echo", color: "cyan" },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 38, col: 6, kind: "echo", color: "cyan" },
    ],
    controls: "standard2",
  },
];
