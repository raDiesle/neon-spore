import type { ScoutArena } from "@neon-spore/sim";

/**
 * THE HAUL's arenas: THE SCOUT again, with a hold that takes every mote on
 * the level at once — the one where every mote you keep makes the ship harder
 * to fly.
 *
 * THE SCOUT carries one mote at a time (`scoutCarryMax`), so its ship is never
 * past `light` and its two hands — player 2's line and player 1's prime
 * (`sim/scout-hand.ts`) — were drawn and never offered. An arena that names a
 * `carry` (`ScoutArena.carry`) lets the ship fill, and the loads come with the
 * filling: past `scoutLadenMotes` the line is on offer, past
 * `scoutHeavyMotes` the thruster labours until it is primed. The owner, 30
 * September 2026: *a new wave is built that carries enough motes to reach
 * them*.
 *
 * **Two levels, one load each.** The first takes four and stops at `laden`,
 * so the line is what is new; the second takes five and goes on to `heavy`,
 * so the prime is. Each arena's `carry` is exactly its motes, so the whole
 * level can be one trip — and whether it is, or two, or five, is the pair's
 * call, made out loud.
 *
 * Authored as `scout-arenas.ts` is, in the same thousandths against seven
 * columns, and read the same way; that file's header says how. **The clocks**
 * are three to four times what the stupid autopilot in
 * `test/scout-haul-flight.test.ts` takes — room for the talking, as THE
 * SCOUT's own clocks are, though those are one clock for every level now.
 */
export const SCOUT_HAUL_ARENAS: ScoutArena[] = [
  /**
   * Level one: four motes along one row and a hazard between them and home.
   * The fourth aboard makes the ship laden, and the line can bring it in.
   */
  {
    beats: 32,
    carry: 4,
    motes: [
      { colMilli: 1_000, rowMilli: 5_000 },
      { colMilli: 2_667, rowMilli: 5_000 },
      { colMilli: 4_333, rowMilli: 5_000 },
      { colMilli: 6_000, rowMilli: 5_000 },
    ],
    hazards: [{ colMilli: 500, rowMilli: 9_000, vColMilli: 3_000, vRowMilli: 0 }],
  },
  /**
   * Level two: five motes in a chevron, its point high in the middle, and two
   * hazards out of step between it and home. The fifth aboard makes the ship
   * heavy, and nothing burns until it is primed.
   */
  {
    beats: 36,
    carry: 5,
    motes: [
      { colMilli: 1_000, rowMilli: 4_500 },
      { colMilli: 2_250, rowMilli: 3_500 },
      { colMilli: 3_500, rowMilli: 2_500 },
      { colMilli: 4_750, rowMilli: 3_500 },
      { colMilli: 6_000, rowMilli: 4_500 },
    ],
    hazards: [
      { colMilli: 500, rowMilli: 7_500, vColMilli: 3_000, vRowMilli: 0 },
      { colMilli: 6_500, rowMilli: 11_000, vColMilli: -2_600, vRowMilli: 0 },
    ],
  },
];
