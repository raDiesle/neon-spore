import type { ScoutArena } from "@neon-spore/sim";

/**
 * THE SCOUT's arenas: four levels, one mote more on each, and the arena is
 * the fight.
 *
 * The mother ship puts a little one out and player 1 flies it. Player 2 can
 * see every mote and every hazard and cannot move anything; player 1 can see
 * the nose and the ship and nothing else that is out there, bar the glimpse
 * the round gives him every five seconds (`sim/scout-reveal.ts`). So an arena
 * is read out loud — "one high on your left, and the fast one crosses under
 * it" — and what is written here is what there is to say.
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
 * **Where the ship starts is not authored.** It is let go one tile above the
 * cannon the moment the arena opens (`scoutLaunch`), and again after every
 * mote the mouth swallows — the owner's pass of 29 September 2026.
 *
 * **One mote at a time**, brought home and sucked in before the next is taken
 * (`scoutCarryMax`), so a level of four motes is four trips out from the
 * mouth.
 *
 * **Every level has the same clock**, 208 beats — the owner, 2
 * October 2026: *the same time for every level, not different*, and *a lot*
 * more of it. It is eight times what the stupid autopilot in
 * `test/scout-flight.test.ts` takes on the longest level (26 beats), so the
 * first level is mostly room and the last still has twice the talking the old
 * four-times clocks gave it. The round is read out loud, a heading at a time,
 * and the clock is room for the talking, not the thing being tested.
 *
 * **The motes do not move and never will.** A pod comes to the ship because
 * there is no flying in this game (`sim/pods.ts`); a mote is the one power-up
 * that is flown to, so it hangs exactly where it was put. That is the whole
 * difference between the two and the reason this round exists.
 */
export const SCOUT_ARENAS: ScoutArena[] = [
  /**
   * Level one: one mote straight up the middle and one hazard crossing the
   * line to it. The whole round in a single trip — out, wait, through, home.
   */
  {
    beats: 208,
    motes: [{ colMilli: 3_500, rowMilli: 4_500 }],
    hazards: [{ colMilli: 500, rowMilli: 8_500, vColMilli: 3_000, vRowMilli: 0 }],
  },
  /**
   * Level two: a mote high on each side, the same hazard between them and
   * home. The first level with a *which one first*.
   */
  {
    beats: 208,
    motes: [
      { colMilli: 1_500, rowMilli: 4_000 },
      { colMilli: 5_500, rowMilli: 4_000 },
    ],
    hazards: [{ colMilli: 6_500, rowMilli: 7_500, vColMilli: -3_000, vRowMilli: 0 }],
  },
  /**
   * Level three: one high in the middle and two low at the walls, with a
   * hazard across each band — the low two are reached under one of them, the
   * high one only through both.
   */
  {
    beats: 208,
    motes: [
      { colMilli: 1_000, rowMilli: 8_000 },
      { colMilli: 6_000, rowMilli: 8_000 },
      { colMilli: 3_500, rowMilli: 2_500 },
    ],
    hazards: [
      { colMilli: 500, rowMilli: 5_250, vColMilli: 2_600, vRowMilli: 0 },
      { colMilli: 6_500, rowMilli: 10_500, vColMilli: -2_200, vRowMilli: 0 },
    ],
  },
  /**
   * Level four: four motes at the corners of a rectangle four columns wide
   * and six rows tall — the first arena's old square — with one hazard through
   * its middle and one between it and home, out of step with each other.
   */
  {
    beats: 208,
    motes: [
      { colMilli: 1_500, rowMilli: 9_000 },
      { colMilli: 5_500, rowMilli: 9_000 },
      { colMilli: 1_500, rowMilli: 3_000 },
      { colMilli: 5_500, rowMilli: 3_000 },
    ],
    hazards: [
      { colMilli: 500, rowMilli: 6_000, vColMilli: 3_000, vRowMilli: 0 },
      { colMilli: 6_500, rowMilli: 11_500, vColMilli: -2_600, vRowMilli: 0 },
    ],
  },
];
