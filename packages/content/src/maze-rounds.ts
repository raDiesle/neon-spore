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
 * The second and third sheets were *drawn* by `bun run maze`, which shuffles
 * the walls of a grid and opens them where they would not close a loop; that
 * randomness ran once, out of the game, and what is below is its printed
 * result. A drum reaches the field by being read and committed, never by being
 * generated at load.
 *
 * **One more way in each round**, which is the owner's own shape for the
 * fight: the first sheet has one gap in its rim, the second two and the third
 * three. All of them reach the middle — the walls are a tree, so any gap in
 * the rim is joined to it — so the widening is a choice of *which* gap to turn
 * down onto the ship rather than a gamble on whether it goes anywhere.
 */

/** The corridors between the middle and the rim, the middle not counted. */
const RINGS = 7;

/**
 * The owner's own sheet, and the first round. Ring 0 has no walls because the
 * middle is one room, and the rim has one gap because the sheet has one.
 */
const SENT: MazeGeometry = {
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
 * The second round: the same seven corridors with two gaps in the rim, so the
 * pilot has a gap to choose as well as a gap to reach. Drawn by
 * `bun run maze 7 2 179`.
 */
const TWO_WAYS: MazeGeometry = {
  rings: RINGS,
  coreMilli: 177,
  openMilli: 55,
  walls: [
    [],
    [0, 45_000, 90_000, 270_000],
    [45_000, 135_000, 270_000],
    [45_000, 135_000, 225_000, 315_000],
    [135_000, 180_000, 270_000, 315_000],
    [0, 45_000, 225_000, 270_000],
    [0, 90_000, 180_000, 225_000],
    [135_000, 180_000, 270_000, 315_000],
  ],
  openings: [
    [64_122, 165_003, 294_872],
    [15_113, 147_559, 282_625],
    [74_468, 211_694, 337_275],
    [111_903, 236_470, 294_971, 344_810],
    [17_732, 66_477, 168_668, 213_240, 236_995, 283_721],
    [23_404, 151_748, 348_393],
    [155_056, 201_634, 240_939, 292_323, 332_333],
    [31_377, 210_512],
  ],
};

/**
 * The third: three gaps in the rim, on a sheet whose three walks are ten
 * crossings each, so no way in is the cheap one. Drawn by
 * `bun run maze 7 3 161`.
 */
const THREE_WAYS: MazeGeometry = {
  rings: RINGS,
  coreMilli: 177,
  openMilli: 55,
  walls: [
    [],
    [45_000, 135_000, 180_000, 225_000],
    [45_000, 135_000, 180_000, 225_000, 270_000, 315_000],
    [0, 45_000, 90_000, 225_000, 315_000],
    [135_000, 180_000, 225_000],
    [45_000, 225_000, 270_000],
    [135_000, 180_000, 225_000, 270_000],
    [0, 90_000, 180_000],
  ],
  openings: [
    [58_579, 146_542, 192_909, 246_920],
    [11_728, 64_310, 159_866, 253_960, 297_775],
    [119_977, 194_364, 237_083, 328_324],
    [12_178, 74_933, 162_267, 199_154],
    [108_300, 207_419, 256_100, 281_862],
    [26_877, 198_562, 247_507],
    [70_929, 112_558, 163_813, 238_418],
    [24_615, 152_009, 257_564],
  ],
};

/**
 * Half a turn, which is where every drum stands when its round opens: the
 * sheet the right way up, with its gaps as far from the ship as they go.
 * Bringing one of them all the way down onto the ship's own column is the
 * round, and only that column counts (`mazeEntranceCol`).
 */
const UPRIGHT = 180_000;

/**
 * The fight, in order: the owner's sheet, then one with two ways in, then one
 * with three. Each one finished takes a third of the boss's hull, the author
 * setting the length of the fight by writing rounds and never by tuning a
 * number.
 */
export const MAZE_ROUNDS: MazeWheel[] = [
  mazeWheel(SENT, UPRIGHT),
  mazeWheel(TWO_WAYS, UPRIGHT),
  mazeWheel(THREE_WAYS, UPRIGHT),
];
