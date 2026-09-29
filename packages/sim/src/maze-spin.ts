import { MAZE_TURN, mazeWrap } from "./maze.js";
import type { MazeWheel } from "./maze-wheel.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * **Where a drum stands when it comes up: somewhere the pair has not seen it.**
 *
 * The owner, 29 September 2026: *every time the wave is restarted, randomly
 * spin the wheel so players can harder remember the right entrance to rotate
 * to*. A drum that always opened upright could be beaten by memory — "three
 * clicks left, same as last time" — and never read again, which is the half
 * of the round that is talking. So every opening of a wheel, the first of a
 * wave and each one after it, turns it by a whole number of degrees off the
 * seeded rng: the same on both devices, and different on every try, because
 * the rng is not reseeded when a lost wave is played again (`run.ts`).
 *
 * **Never with a way in already at the ship.** A drum dealt with a gap within
 * `CLEAR` of the bottom would be a round with no turn in it, and a gap near
 * the click is one the first pull would fall into. So a spin that lands one
 * there is carried on round to the first angle that clears; a sheet so full
 * of gaps that none does keeps its authored angle.
 *
 * The wheels are still authored (`content/maze-rounds.ts`): the walls and the
 * gaps are the sheet's, and only the angle the sheet is hung at is dealt.
 */

/** How far from the ship every way in must stand at the opening: an eighth. */
const CLEAR = MAZE_TURN / 8;

/** The angle `wheel` comes up at this time, off the world's rng: one draw of a
 * whole degree, then on round a degree at a time to the first clear one. */
export function mazeDealAngle(world: World, wheel: MazeWheel | null): number {
  const authored = mazeWrap(wheel?.startMilli ?? 0);
  if (wheel === null) return authored;
  const from = nextInt(world.rng, 360);
  for (let d = 0; d < 360; d++) {
    const angle = mazeWrap(authored + ((from + d) % 360) * 1000);
    if (clearOfShip(wheel, angle)) return angle;
  }
  return authored;
}

/** Whether every way in stands at least `CLEAR` round from straight down. */
function clearOfShip(wheel: MazeWheel, angle: number): boolean {
  return wheel.entrances.every((e) => {
    const a = mazeWrap(angle + e.angleMilli);
    return Math.min(a, MAZE_TURN - a) >= CLEAR;
  });
}
