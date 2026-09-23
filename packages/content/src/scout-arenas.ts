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
   * The first: four motes at the corners of a rectangle four columns wide and
   * six rows tall, one hazard crossing the middle of it.
   *
   * It reads as a square on the field it is played on rather than on the one
   * it is authored on: the columns stretch and the rows do not, so on eleven
   * columns the four sit about six and a third tiles apart each way. It is the
   * shape the round teaches itself with. Every mote is one press from the one
   * before, the hazard's line is the horizontal through the middle of it, and
   * the hazard crosses in two beats and is back in four — so the pair's first
   * real sentence is "go now" rather than "go there", and the thing that ends
   * the attempt is visible from the moment it opens.
   *
   * **Eighteen beats, which is half again the flight.** An autopilot that
   * points, burns and coasts banks all four motes in twelve
   * (`test/scout-flight.test.ts`, which measures it rather than restating it),
   * so the clock leaves six beats for the talking a rig does not do. It was 40
   * — more than three times the flight — and at that figure `ranOut`, one of
   * the two ways this round breaks the hull, could only fire for a pair who had
   * stopped flying altogether.
   */
  {
    beats: 18,
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
   * is waiting for opens at a different place every time round. The one going
   * left is a little faster than the first arena's, the one going right a
   * little slower, and they are out of step because of it — three and a half
   * beats round against four and three quarters. What changed against the
   * first arena is how much there is to say before the ship is committed.
   *
   * **The column is on a pitch of two and a half tiles**, with each hazard's
   * row half-way between two motes (the owner, 19 September 2026). A touch
   * reaches 0.88 of a tile, so a scout at rest on a mote has 0.37 to spare as
   * the hazard sweeps past — on the two-tile pitch it had 0.12, which is a
   * mote nobody could stop on (`test/scout-flight.test.ts` holds the room).
   *
   * **Twenty-four beats, against a flight of fourteen.** The same autopilot
   * as the first arena's, waiting each hazard out, banks the six in two trips
   * of three; 24 is the figure the owner asked for and it sits inside the bar
   * the first arena's clock is held to. It was 56 while nothing could fly the
   * arena to measure it.
   */
  {
    beats: 24,
    startColMilli: 3_500,
    startRowMilli: 12_500,
    startHeadingMilli: 0,
    motes: [
      { colMilli: 3_500, rowMilli: 11_000 },
      { colMilli: 3_500, rowMilli: 8_500 },
      { colMilli: 3_500, rowMilli: 6_000 },
      { colMilli: 3_500, rowMilli: 3_500 },
      { colMilli: 1_500, rowMilli: 1_000 },
      { colMilli: 5_500, rowMilli: 1_000 },
    ],
    hazards: [
      { colMilli: 500, rowMilli: 7_250, vColMilli: 2_600, vRowMilli: 0 },
      { colMilli: 6_500, rowMilli: 2_250, vColMilli: -3_400, vRowMilli: 0 },
    ],
  },
];
