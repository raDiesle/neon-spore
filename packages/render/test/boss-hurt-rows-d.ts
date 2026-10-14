import type { Row } from "./boss-hurt-rows.js";

/**
 * **The blow's rows from THE HYDRA on** — the fourth page of
 * `boss-hurt-rows.ts`, cut on build order when `boss-hurt-rows-c.ts` reached
 * its length, and the page a new boss's row is added to.
 */
export const HURT_ROWS_D: Row[] = [
  {
    boss: "hydra",
    // A level of heads stopped, and the body beaten after the last.
    land: [
      { type: "hydraCleared", head: "bite", col: 5 },
      { type: "hydraSpent", col: 5 },
    ],
    // Heads coming, a swipe let go short, a lap turned, an eye opening and
    // blinking, a tap on a shut eye, a maw opening and a thumb on the wrong
    // head only work toward one, or against it.
    part: [
      { type: "hydraHeads", head: "bite", col: 5 },
      { type: "hydraGlance", seat: 0, piece: 0, col: 2 },
      { type: "hydraLap", seat: 0, laps: 1, col: 2 },
      { type: "hydraOpen", seat: 1, piece: 4, col: 8 },
      { type: "hydraBlink", seat: 1, piece: 4, col: 8 },
      { type: "hydraMiss", seat: 1, col: 8 },
      { type: "hydraMaw", piece: 0, col: 3 },
      { type: "hydraWrong", seat: 1, col: 2 },
    ],
    // A head stopped: a neck cut, a coil turned off, an eye put out, a maw quenched.
    hit: [
      { type: "hydraCut", seat: 0, piece: 0, col: 2 },
      { type: "hydraUncoil", seat: 0, piece: 0, col: 2 },
      { type: "hydraPoke", seat: 0, piece: 0, col: 2 },
      { type: "hydraQuench", piece: 0, col: 3 },
    ],
    hurt: (fx) => fx.boss.hydra.hurt,
  },
];
