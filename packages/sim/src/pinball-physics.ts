import { hitPiece, isqrt, type PinBall, type PinPiece } from "./pinball-contact.js";

/**
 * One tick of a ball on a table. Integers only, no world and no config object
 * — arithmetic that can be called from a test with four numbers and checked by
 * hand. What it may touch and how deep it is into one is `pinball-contact.ts`;
 * everything here is the motion made out of that.
 *
 * **Why this is written and not imported.** Every physics engine in reach
 * integrates in floating point, and `packages/sim` rounds what it computes
 * into stored integers: a last-bit difference between V8 on Android and
 * JavaScriptCore on iOS lands on either side of a `.5`, and two phones then
 * play different tables from the third bounce onwards
 * (`test/purity.test.ts`). So the ball is stepped in thousandths of a tile,
 * every division truncates towards zero the same way on both, and `Math.sqrt`
 * — which IEEE-754 does not require to be correctly rounded — is replaced by
 * `isqrt` below. The whole of it is about two hundred lines, which is less
 * than the smallest engine that would have done instead.
 *
 * **One step a tick, and no substepping.** The usual answer to a fast ball is
 * to cut the tick into pieces, and every way of doing that in integers either
 * loses a remainder or carries one, both of which are state. Instead the ball
 * is *capped*: `pinballSpeedCapMilli` is held below the ball's radius plus the
 * thinnest half-thickness a piece may have, so one tick's motion can never
 * carry the centre past the far side of anything. At 120 ticks a second the
 * cap is 36 tiles a second — faster than the table is tall, so the constraint
 * costs nothing anybody can feel and buys an integration with no memory.
 *
 * **One bounce a tick, and it is the deepest.** A ball wedged between two pegs
 * overlaps both; reflecting off each in turn reverses the velocity twice and
 * leaves it travelling as before, buried, for as long as the shot lasts. So
 * the deepest overlap is resolved and every overlap is reported — which is
 * also right for the round, because a ball through a cluster should light
 * everything it touched, not only what it bounced off.
 */

/** The numbers `stepBall` needs. A slice of `SimConfig`, so a test needs no world. */
export interface PinPhysics {
  ballMilli: number;
  gravityMilli: number;
  speedCapMilli: number;
  bouncePermille: number;
  wallPermille: number;
  widthMilli: number;
  heightMilli: number;
}

/** Truncating division, spelled once so no call site reaches for `Math.round`. */
function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

/**
 * Hold the ball to the speed cap, scaling both components so the direction is
 * untouched. Called after gravity and after every bounce: restitution cannot
 * add speed, but its arithmetic can round a thousandth upward and a shot is
 * thousands of ticks long.
 */
export function capSpeed(ball: PinBall, capMilli: number): void {
  const speed = isqrt(ball.vxMilli * ball.vxMilli + ball.vyMilli * ball.vyMilli);
  if (speed <= capMilli) return;
  ball.vxMilli = div(ball.vxMilli * capMilli, speed);
  ball.vyMilli = div(ball.vyMilli * capMilli, speed);
}

/**
 * Reflect the ball about a unit normal given in thousandths, and take the
 * restitution off what comes back.
 *
 * The normal points *out* of whatever was hit, so a ball travelling into it
 * has a negative dot product; a ball already leaving is left alone, which is
 * what stops a piece it is climbing out of from grabbing it a second time.
 */
function reflect(ball: PinBall, nxMilli: number, nyMilli: number, permille: number): void {
  const dot = div(ball.vxMilli * nxMilli + ball.vyMilli * nyMilli, 1000);
  if (dot >= 0) return;
  ball.vxMilli = div((ball.vxMilli - div(2 * dot * nxMilli, 1000)) * permille, 1000);
  ball.vyMilli = div((ball.vyMilli - div(2 * dot * nyMilli, 1000)) * permille, 1000);
}

/**
 * Advance the ball one tick against the walls and whatever is still standing.
 *
 * Returns the indices of every piece it touched this tick, in board order.
 * `alive` is read and never written: what a hit *does* to a board is the
 * round's rule and not the table's (`pinball-round.ts`).
 */
export function stepBall(
  ball: PinBall,
  pieces: readonly PinPiece[],
  alive: readonly boolean[],
  phys: PinPhysics,
): number[] {
  ball.vyMilli += phys.gravityMilli;
  capSpeed(ball, phys.speedCapMilli);
  ball.xMilli += ball.vxMilli;
  ball.yMilli += ball.vyMilli;

  const r = phys.ballMilli;
  if (ball.xMilli < r) {
    ball.xMilli = r;
    reflect(ball, 1000, 0, phys.wallPermille);
  } else if (ball.xMilli > phys.widthMilli - r) {
    ball.xMilli = phys.widthMilli - r;
    reflect(ball, -1000, 0, phys.wallPermille);
  }
  if (ball.yMilli < r) {
    ball.yMilli = r;
    reflect(ball, 0, 1000, phys.wallPermille);
  }

  const struck: number[] = [];
  let deepest = -1;
  let depth = 0;
  let nx = 0;
  let ny = 0;
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    if (piece === undefined || alive[i] !== true) continue;
    const hit = hitPiece(ball, piece, r);
    if (hit.depth <= 0) continue;
    struck.push(i);
    if (hit.depth > depth) {
      deepest = i;
      depth = hit.depth;
      nx = hit.nxMilli;
      ny = hit.nyMilli;
    }
  }
  if (deepest >= 0) {
    // Out along the normal first, then the bounce. Pushing out before
    // reflecting is what keeps a ball resting on a block from sinking a
    // thousandth a tick until it falls through the middle of it.
    ball.xMilli += div(depth * nx, 1000);
    ball.yMilli += div(depth * ny, 1000);
    reflect(ball, nx, ny, phys.bouncePermille);
    capSpeed(ball, phys.speedCapMilli);
  }
  return struck;
}
