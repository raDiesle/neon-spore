import { type MazeGeometry, type MazeWheel, mazeWheel } from "@neon-spore/sim";

/**
 * THE MAZE's drum: a real maze, copied wall for wall off the sheet the owner
 * handed the lane, and the three rounds played against it.
 *
 * **This is the drum and not a drum like it.** What stood here before was
 * three sets of plain circles with mouths on the rim and a route typed beside
 * each — no walls anywhere, so the screen showed concentric rings and nothing
 * a player would call a maze. The owner sent the maze he wanted and asked for
 * exactly it. Every number below is measured off that sheet: seven corridors
 * round a middle, radial walls on the eighths, one gap in the rim, and the
 * gaps in each circle where the sheet has them and nowhere else.
 *
 * **How to read it.** `rings` is how many corridors lie between the middle and
 * the rim, and ring 0 is the middle. `walls[k]` is ring `k`'s radial walls;
 * `openings[k]` is the gaps in the circle that closes ring `k` on the outside,
 * so `openings[7]` is the one gap in the rim and `openings[0]` is the three
 * ways into the middle. Every angle is thousandths of a degree. Nothing here
 * says where the shot goes: `mazeWheel` solves that from the walls
 * (`packages/sim/src/maze-solve.ts`), and `mazeFault` checks the answer back
 * against them, which is what makes "it never crosses a wall" a fact rather
 * than a promise. `content/test/maze-rounds.test.ts` runs both.
 *
 * **The sheet is mirrored on the way in, once, here.** A printed maze is read
 * with zero at the top and angles rising clockwise; the drum's zero is the
 * angle pointing *down* at the ship and its angles rise the other way
 * (`maze.ts`). Turning the page over is one subtraction, and doing it at the
 * only place the printed sheet is ever mentioned is what stops a second copy
 * of the convention appearing somewhere downstream.
 *
 * **Authored, never generated.** Two devices have to be looking at the same
 * drum, and the cheapest way to guarantee that is for there to be only one —
 * the argument `mirror.ts` makes about its sequences. There is no rng in this
 * file and nothing in the boss draws from one, the opening angle included.
 */

/** The corridors between the middle and the rim, the middle not counted. */
const RINGS = 7;

/**
 * The sheet itself. Ring 0 has no walls because the middle is one room, and
 * the rim has one gap because the sheet has one way in.
 */
const SHEET: MazeGeometry = {
  rings: RINGS,
  // The middle is half again as wide as a corridor, which is what leaves room
  // for the shot to arrive somewhere rather than merely stop.
  coreMilli: 177,
  // Every gap on the sheet is the same width, and it is about half a corridor.
  openMilli: 55,
  walls: [
    [],
    [45_000, 180_000, 270_000, 315_000],
    [0, 90_000, 135_000, 225_000],
    [45_000, 225_000, 270_000, 315_000],
    [0, 90_000, 180_000],
    [0, 45_000, 90_000, 135_000, 225_000, 270_000],
    [0, 45_000, 225_000, 270_000],
    [0, 90_000, 135_000, 180_000, 270_000, 315_000],
  ],
  openings: [
    [60, 134_610, 296_940],
    [62_490, 104_450, 165_330, 248_500, 296_290],
    [8_200, 179_960],
    [26_530, 246_580, 329_650],
    [60_560, 109_550, 154_440, 191_610, 258_760, 299_110],
    [30_100, 99_340, 345_600],
    [14_830, 56_090, 108_190, 154_250, 213_770, 235_400, 290_950, 326_200],
    [3_350],
  ],
};

/**
 * Half a turn, which is where the drum stands when a round opens: the sheet
 * the right way up, with its one gap at the top and as far from the ship as it
 * goes. Bringing that gap all the way down onto a column is the round.
 */
const UPRIGHT = 180_000;

/**
 * The fight, in order. The same maze three times, standing at three different
 * angles, so each round is the same walk found again from somewhere else — and
 * each one finished takes a third of the boss's hull, the author setting the
 * length of the fight by writing rounds and never by tuning a number.
 */
export const MAZE_ROUNDS: MazeWheel[] = [
  mazeWheel(SHEET, UPRIGHT),
  mazeWheel(SHEET, 65_000),
  mazeWheel(SHEET, 295_000),
];
