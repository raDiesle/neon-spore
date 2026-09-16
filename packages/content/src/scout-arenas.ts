import type { ScoutArena } from "@neon-spore/sim";

/**
 * THE SCOUT's arenas: two of them, and the arena is the fight.
 *
 * The mother ship puts a little one out and player 1 flies it. Player 2 can
 * see every mote and every hazard and cannot move anything; player 1 can see
 * the nose and the ship and nothing else that is out there. So an arena is
 * read out loud — "one high on your left, and the fast one crosses under it"
 * — and what is written here is what there is to say.
 *
 * **Authored, never generated**, for the reason SNAKE's arenas and THE FLEET's
 * chart are: where a thing stands decides how long the pair has to say it. A
 * random arena would be a round nobody composed, and the one thing this round
 * cannot survive is a shape neither player can describe.
 *
 * **How to read a row.** Everything is in thousandths of a tile, authored
 * against the seven columns every wave is authored against (`queue.ts`) and
 * remapped onto whatever field the pair is playing (`queue-boss.ts`). So
 * `3_500` is the middle of a seven-column arena and stays the middle of an
 * eleven-column one. A hazard's `vColMilli` and `vRowMilli` are thousandths of
 * a tile a beat, and it turns round at the walls without losing any of it —
 * which is what makes "it comes back in four beats" a true sentence the second
 * time somebody says it.
 *
 * **The motes do not move and never will.** A pod comes to the ship because
 * there is no flying in this game (`sim/pods.ts`); a mote is the one power-up
 * that is flown to, so it hangs exactly where it was put. That is the whole
 * difference between the two and the reason this round exists.
 */
export const SCOUT_ARENAS: ScoutArena[] = [
  /**
   * The first: four motes at the corners of a square, one hazard crossing the
   * middle of it.
   *
   * It is the shape the round teaches itself with. Every mote is reachable in
   * one burn from the one before, the hazard's line is the diameter of the
   * square, and it crosses in four beats — so the pair's first real sentence
   * is "go now" rather than "go there", and the thing that ends the attempt is
   * visible from the moment it opens.
   */
  {
    beats: 40,
    startColMilli: 3_500,
    startRowMilli: 11_000,
    startHeadingMilli: 0,
    motes: [
      { colMilli: 1_500, rowMilli: 3_000 },
      { colMilli: 5_500, rowMilli: 3_000 },
      { colMilli: 1_500, rowMilli: 9_000 },
      { colMilli: 5_500, rowMilli: 9_000 },
    ],
    hazards: [{ colMilli: 500, rowMilli: 6_000, vColMilli: 3_000, vRowMilli: 0 }],
  },
  /**
   * The second: six motes up the middle and two hazards that cross it, one
   * going each way and at different speeds.
   *
   * The column of motes is deliberately the one line a ship coasting upwards
   * takes on its own, so the flying is easy and the *timing* is the whole of
   * it: the two hazards are out of step with each other, so the gap the pair
   * is waiting for opens at a different place every time round. Nothing here
   * is faster than the first arena's hazard — what changed is how much there
   * is to say before the ship is committed.
   */
  {
    beats: 56,
    startColMilli: 3_500,
    startRowMilli: 12_500,
    startHeadingMilli: 0,
    motes: [
      { colMilli: 3_500, rowMilli: 10_500 },
      { colMilli: 3_500, rowMilli: 8_500 },
      { colMilli: 3_500, rowMilli: 6_500 },
      { colMilli: 3_500, rowMilli: 4_500 },
      { colMilli: 1_500, rowMilli: 2_500 },
      { colMilli: 5_500, rowMilli: 2_500 },
    ],
    hazards: [
      { colMilli: 500, rowMilli: 7_500, vColMilli: 2_600, vRowMilli: 0 },
      { colMilli: 6_500, rowMilli: 3_500, vColMilli: -3_400, vRowMilli: 0 },
    ],
  },
];
