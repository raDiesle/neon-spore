import { type MazeGeometry, type MazeWheel, mazeWheel } from "@neon-spore/sim";
import { MAZE_DRAWN } from "./maze-drawn.js";

/**
 * THE MAZE's drum: a real maze, copied wall for wall off the sheet the owner
 * handed the lane, and the five rounds played against it.
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
 * fight: one gap in the first sheet's rim, two in the second, and so on to
 * five. **Exactly one of them reaches the middle**; the rest open onto regions
 * of the maze that simply do not join it, and a shot sent down one of those is
 * a shot that gets lost. So the widening is a widening gamble rather than a
 * choice of scenic route, which is what the owner asked for after seeing the
 * first version — where the walls were a perfect tree and therefore every gap
 * arrived, leaving nothing at stake in choosing one.
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
 * Half a turn, which is where every drum stands when its round opens: the
 * sheet the right way up, with its gaps as far from the ship as they go.
 * Bringing one of them all the way down onto the ship's own column is the
 * round, and only that column counts (`mazeEntranceCol`).
 */
const UPRIGHT = 180_000;

/**
 * The fight, in order: the owner's sheet with its single way in, then the four
 * drawn ones (`maze-drawn.ts`), each with a gap more in its rim than the last.
 * Each round finished takes a fifth of the boss's hull — the author sets the
 * length of the fight by writing rounds and never by tuning a number, so this
 * list is the only place the answer to "how long is this boss" is written.
 */
export const MAZE_ROUNDS: MazeWheel[] = [SENT, ...MAZE_DRAWN].map((geo) => mazeWheel(geo, UPRIGHT));
