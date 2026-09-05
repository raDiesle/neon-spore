import type { MazeGeometry } from "@neon-spore/sim";

/**
 * The four sheets THE MAZE plays after the owner's own, drawn by
 * `bun run maze` and printed here.
 *
 * **Why they are in a file of their own.** `maze-rounds.ts` is the fight — the
 * sheet the owner sent, where every drum stands when its round opens, and the
 * order of the five. This is the pile of numbers that came off the pen, and
 * the two do not want reading together: nothing below has an argument in it.
 *
 * **One gap in each rim arrives; the rest are dead ends.** The generator
 * carves a spanning tree and then walls every way in but one off from the
 * middle, a few cells inside its own gap (`tools/maze/draw.ts`), so a false
 * way opens onto a proper region of corridors that simply does not join the
 * middle. Which one arrives is never written down here — `mazeWheel` solves it
 * out of the walls, and `content/test/maze-rounds.test.ts` insists there is
 * exactly one.
 *
 * **The rim's gaps stand on the eighths.** Five gaps over eight sectors leaves
 * two of them a single eighth apart, which is the floor the same test holds:
 * any closer and the pilot could fall into the wrong one on the way to the
 * right one. So these are unnudged, while every gap inside the drum is nudged
 * off its sector's centre and the sheet still reads as drawn rather than
 * stamped.
 *
 * Each was chosen out of two hundred seeds by `bun run maze scan`, which ranks
 * them by how far the true walk goes round, how often it is sent back outward,
 * how many doors the middle has and how long the shortest dead end is. The eye
 * picked from its top few; the seed is named above each sheet so any of them
 * can be drawn again.
 */

/** The corridors between the middle and the rim, the middle not counted. */
const RINGS = 7;

/** Two gaps in the rim: one gap to choose as well as a gap to reach. The walk
 * that arrives is ten crossings and goes three quarters of a turn round the
 * drum; the one that does not runs eight crossings before it stops.
 * `bun run maze 7 2 31`. */
const TWO_WAYS: MazeGeometry = {
  rings: RINGS,
  coreMilli: 177,
  openMilli: 55,
  walls: [
    [],
    [135_000, 180_000, 225_000, 270_000, 315_000],
    [0, 45_000, 180_000, 315_000],
    [135_000, 225_000, 270_000, 315_000],
    [0, 45_000, 90_000, 180_000, 225_000, 270_000],
    [90_000, 225_000, 270_000],
    [0, 45_000, 135_000, 225_000, 270_000, 315_000],
    [0, 45_000, 90_000, 180_000, 225_000],
  ],
  openings: [
    [332_948],
    [20_236, 78_465, 156_614, 212_566, 254_367, 299_382],
    [150_036, 257_883, 291_470, 347_786],
    [66_905, 210_657, 254_747, 299_810],
    [23_483, 76_700, 153_899, 193_952, 252_507, 346_449],
    [21_139, 105_310, 206_573, 250_242, 326_825],
    [31_794, 78_307, 109_609, 204_678, 292_502, 331_882],
    [22_500, 202_500],
  ],
};

/** Three gaps, two of them dead ends of six crossings each — long enough that
 * the pair watches the shot work for a while before it is told no.
 * `bun run maze 7 3 132`. */
const THREE_WAYS: MazeGeometry = {
  rings: RINGS,
  coreMilli: 177,
  openMilli: 55,
  walls: [
    [],
    [45_000, 135_000, 270_000],
    [135_000, 315_000],
    [45_000, 135_000, 225_000, 270_000],
    [135_000, 180_000, 225_000, 270_000],
    [90_000, 225_000, 270_000, 315_000],
    [0, 45_000, 135_000, 225_000, 315_000],
    [45_000, 90_000, 180_000, 225_000, 315_000],
  ],
  openings: [
    [17_742, 112_647, 199_867],
    [339_220],
    [238_752, 336_678],
    [62_250, 149_709, 210_578, 238_356, 290_692],
    [26_860, 198_007, 258_498],
    [191_580, 248_106, 301_446, 339_715],
    [29_352, 66_054, 104_644, 153_794, 211_680, 253_874, 344_501],
    [22_500, 157_500, 247_500],
  ],
};

/** Four gaps on the quarters, one of them the way. `bun run maze 7 4 21`. */
const FOUR_WAYS: MazeGeometry = {
  rings: RINGS,
  coreMilli: 177,
  openMilli: 55,
  walls: [
    [],
    [0, 45_000, 180_000, 225_000, 270_000, 315_000],
    [90_000, 135_000, 180_000, 315_000],
    [90_000, 135_000, 225_000, 270_000, 315_000],
    [45_000, 90_000, 180_000, 270_000],
    [0, 90_000, 135_000, 225_000, 270_000],
    [45_000, 90_000, 180_000, 270_000],
    [0, 90_000, 135_000, 225_000],
  ],
  openings: [
    [19_225, 113_238, 197_964, 254_147, 302_981],
    [24_855, 114_190, 161_488, 236_965, 345_693],
    [236_582, 287_905, 329_905],
    [73_435, 113_363, 205_613, 300_159],
    [113_650, 241_897, 298_589],
    [21_689, 121_536, 168_660, 258_278, 291_457],
    [15_437, 56_701, 119_513, 204_451, 247_716],
    [22_500, 112_500, 202_500, 292_500],
  ],
};

/** Five gaps, and the walk that arrives goes a turn and a quarter round the
 * drum before it gets there — the longest of the five sheets, which is the
 * last round earning its place. `bun run maze 7 5 187`. */
const FIVE_WAYS: MazeGeometry = {
  rings: RINGS,
  coreMilli: 177,
  openMilli: 55,
  walls: [
    [],
    [45_000, 90_000, 135_000],
    [45_000, 90_000, 135_000, 315_000],
    [0, 90_000, 135_000, 225_000, 270_000],
    [0, 180_000, 225_000, 315_000],
    [0, 135_000, 225_000, 270_000],
    [0, 90_000, 180_000, 270_000],
    [45_000, 90_000, 270_000, 315_000],
  ],
  openings: [
    [62_251, 106_934, 152_504],
    [104_600, 299_765],
    [21_798, 56_824, 150_307, 242_348, 286_789, 341_284],
    [106_693, 147_879],
    [72_702, 201_481, 255_861, 328_561],
    [67_813, 152_608, 237_732, 342_097],
    [11_708, 63_728, 199_376, 291_025],
    [22_500, 112_500, 157_500, 247_500, 292_500],
  ],
};

/** The four drawn sheets, in the order they are played: two ways in, then
 * three, then four, then five. */
export const MAZE_DRAWN: readonly MazeGeometry[] = [TWO_WAYS, THREE_WAYS, FOUR_WAYS, FIVE_WAYS];
