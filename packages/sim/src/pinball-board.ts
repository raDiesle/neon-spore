import type { SimConfig } from "./config.js";
import { MAZE_TURN, mazeCosMilli, mazeSinMilli } from "./maze.js";
import { PIN_SHOTS, PINBALL_PHASES, type PinballState } from "./pinball.js";
import { PIN_THIN_MILLI, type PinPiece } from "./pinball-contact.js";
import type { PinPhysics } from "./pinball-physics.js";

/**
 * The table as arithmetic: how big it is, what a legal board looks like, and
 * what an angle and a power add up to. No world and no state — the questions
 * the editor asks before a board is played and the round asks while it is.
 *
 * `fleet-board.ts` is the shape this follows, and for the same reason: a board
 * is authored on a picture, so the fault check and the geometry have to be
 * callable from `tools/director` without dragging a `World` along.
 */

/** The table's width in thousandths of a tile. */
export function pinWidthMilli(cfg: SimConfig): number {
  return cfg.pinballCols * 1000;
}

/** Its height, the same way. The floor is at exactly this, and it is a way out. */
export function pinHeightMilli(cfg: SimConfig): number {
  return cfg.pinballRows * 1000;
}

/** The slice of `SimConfig` the ball is stepped against. */
export function pinPhysics(cfg: SimConfig): PinPhysics {
  return {
    ballMilli: cfg.pinballBallMilli,
    gravityMilli: cfg.pinballGravityMilli,
    speedCapMilli: cfg.pinballSpeedCapMilli,
    bouncePermille: cfg.pinballBouncePermille,
    wallPermille: cfg.pinballWallPermille,
    widthMilli: pinWidthMilli(cfg),
    heightMilli: pinHeightMilli(cfg),
  };
}

/**
 * Where the bucket may stand, so its mouth is never half off the table. The
 * launch comes out of the middle of that mouth, which is why the ball can
 * never start inside a wall.
 */
export function pinClampBucket(cfg: SimConfig, xMilli: number): number {
  const half = cfg.pinballBucketMilli;
  return Math.max(half, Math.min(pinWidthMilli(cfg) - half, xMilli));
}

/**
 * What is wrong with this board, or `null`.
 *
 * Three of the four are about the physics rather than about taste, and the
 * editor says so under the map rather than letting a board that is not a board
 * be saved quietly — `fleetFault` is the pattern.
 */
export function pinballFault(pieces: readonly PinPiece[], cfg: SimConfig): string | null {
  if (pieces.length === 0) return "a table with nothing on it";
  if (!pieces.some((p) => p.target)) return "no target pieces: nothing would end the round";
  const w = pinWidthMilli(cfg);
  const h = pinHeightMilli(cfg);
  for (const piece of pieces) {
    // A peg repeats its radius in both, so one reading answers both kinds.
    const halfX = piece.wMilli;
    const halfY = piece.kind === "peg" ? piece.wMilli : piece.hMilli;
    // Thin enough for a ball at full speed to step straight over it. The one
    // invariant of `pinball-physics.ts`, checked where boards are made.
    if (
      piece.kind === "block" &&
      (piece.wMilli < PIN_THIN_MILLI || piece.hMilli < PIN_THIN_MILLI)
    ) {
      return "a block thinner than a ball can be stopped by";
    }
    if (piece.kind === "peg" && piece.wMilli < PIN_THIN_MILLI) {
      return "a peg smaller than a ball can be stopped by";
    }
    if (piece.xMilli - halfX < 0 || piece.xMilli + halfX > w) return "a piece off the side";
    if (piece.yMilli - halfY < 0 || piece.yMilli + halfY > h) return "a piece off the top or floor";
  }
  // The launch lane: a piece sitting on the bucket would be hit before the
  // ball had left, which reads as a shot that did not happen.
  const floor = h - cfg.pinballBucketMilli * 2;
  for (const piece of pieces) {
    const halfY = piece.kind === "peg" ? piece.wMilli : piece.hMilli;
    if (piece.yMilli + halfY > floor) return "a piece in the bucket's own lane";
  }
  return null;
}

/**
 * The velocity a launch leaves the bucket with.
 *
 * `angleMilli` is thousandths of a degree from straight up, positive to the
 * right; `powerMilli` is 0 to 1000 along the bar. The sine comes off
 * `mazeSinMilli` rather than `Math.sin` — the rule `purity.test.ts` states and
 * the table THE MAZE already carries, called rather than copied.
 */
export function pinLaunchVelocity(
  cfg: SimConfig,
  angleMilli: number,
  powerMilli: number,
): { vxMilli: number; vyMilli: number } {
  const weak = cfg.pinballWeakPermille;
  const permille = weak + Math.trunc(((1000 - weak) * powerMilli) / 1000);
  const speed = Math.trunc((cfg.pinballLaunchMilli * permille) / 1000);
  // Straight up is angle zero, so x takes the sine and y the cosine, negated
  // because the table's y counts down from the top like every other picture
  // in this game.
  return {
    vxMilli: Math.trunc((speed * mazeSinMilli(angleMilli)) / 1000),
    vyMilli: -Math.trunc((speed * mazeCosMilli(angleMilli)) / 1000),
  };
}

/**
 * The needle's next position and the way it will then be going.
 *
 * It turns round at each end rather than wrapping, because a needle that
 * jumped from one edge to the other would break the one sentence the round is
 * played with: "keep going, keep going, stop".
 */
export function pinSweep(
  cfg: SimConfig,
  angleMilli: number,
  dir: -1 | 1,
): { angleMilli: number; dir: -1 | 1 } {
  const span = Math.min(cfg.pinballSweepMilli, MAZE_TURN / 4);
  const next = angleMilli + dir * cfg.pinballNeedleMilli;
  if (next >= span) return { angleMilli: span, dir: -1 };
  if (next <= -span) return { angleMilli: -span, dir: 1 };
  return { angleMilli: next, dir };
}

/** The power bar's next position, and the way it will then be going. Same rule. */
export function pinPower(
  cfg: SimConfig,
  powerMilli: number,
  dir: -1 | 1,
): { powerMilli: number; dir: -1 | 1 } {
  const next = powerMilli + dir * cfg.pinballPowerMilli;
  if (next >= 1000) return { powerMilli: 1000, dir: -1 };
  if (next <= 0) return { powerMilli: 0, dir: 1 };
  return { powerMilli: next, dir };
}

/**
 * Every number a list of pieces contributes to the world fingerprint: how many
 * there are, then six each, in board order.
 *
 * Here rather than in `hash-boss.ts` because a piece's fields are this file's
 * business and the fingerprint has to name all of them — a seventh field added
 * to `PinPiece` and not to a loop next door is a field two devices could
 * disagree about silently. `mazeHashParts` is the same arrangement.
 */
export function pinPieceParts(pieces: readonly PinPiece[]): number[] {
  const out: number[] = [pieces.length];
  for (const piece of pieces) {
    out.push(piece.kind === "peg" ? 1 : 2);
    out.push(piece.xMilli);
    out.push(piece.yMilli);
    out.push(piece.wMilli);
    out.push(piece.hMilli);
    out.push(piece.target ? 1 : 0);
  }
  return out;
}

/**
 * The field column a point on the table stands over.
 *
 * The table is `pinballCols` wide and the field is `cols` wide, and the two
 * are the same number today — but the scar a dropped ball leaves has to land
 * somewhere on a hull that does not know this round exists, so the mapping is
 * written down once rather than assumed at the one call site that needs it.
 */
export function pinFieldCol(cfg: SimConfig, xMilli: number): number {
  const col = Math.floor((xMilli * cfg.cols) / pinWidthMilli(cfg));
  return Math.max(0, Math.min(cfg.cols - 1, col));
}

/**
 * Every number PINBALL contributes to the world fingerprint.
 *
 * Here rather than in `hash-boss.ts` for `mazeHashParts`' reason: the ball is
 * four integers and every one of them is the fight — two devices a thousandth
 * apart on a velocity take the next bounce off a different side of a peg, and
 * by the third they are playing different tables. The authored boards are in
 * for THE FLEET's reason, and `alive` because it is what a board has become.
 *
 * The type is imported for its shape only, so nothing here runs against
 * `pinball.ts` and the two files do not close a cycle.
 */
export function pinballHashParts(boss: PinballState): number[] {
  const out: number[] = [];

  out.push(PINBALL_PHASES.indexOf(boss.phase));
  out.push(boss.phaseBeat);
  out.push(boss.openBeat);
  out.push(boss.passed ? 1 : 0);
  out.push(boss.round);
  out.push(boss.roundBeat);
  out.push(PIN_SHOTS.indexOf(boss.shot));
  out.push(boss.armed ? 1 : 0);
  out.push(boss.angleMilli);
  out.push(boss.angleDir);
  out.push(boss.powerMilli);
  out.push(boss.powerDir);
  out.push(boss.bucketMilli);
  out.push(boss.slideDir);
  out.push(boss.ball.xMilli);
  out.push(boss.ball.yMilli);
  out.push(boss.ball.vxMilli);
  out.push(boss.ball.vyMilli);
  out.push(boss.flightBeat);
  out.push(boss.drops);
  out.push(boss.dropBeat);
  out.push(boss.catchBeat);
  for (const n of pinPieceParts(boss.pieces)) out.push(n);
  for (const up of boss.alive) out.push(up ? 1 : 0);
  out.push(boss.lit.length);
  for (const i of boss.lit) out.push(i);
  out.push(boss.rounds.length);
  for (const round of boss.rounds) {
    out.push(round.beats);
    for (const n of pinPieceParts(round.pieces)) out.push(n);
  }
  return out;
}
