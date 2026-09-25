import { type SnakeState, snakeGate, snakeGoingHome, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { PALETTE } from "./palette.js";
import { emerge01 } from "./snake-clock.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";
import { emergeIntake } from "./snake-emerge.js";

/**
 * **The mouth on the way home**, the picture half of `sim/snake-home.ts`.
 *
 * Once the arena is clear the body goes back into the ship, through the mouth
 * it came out of, and the owner asked for the mouth to open for it (25
 * September 2026). So the intake the emergence opens is opened a second time,
 * off the beat the arena was cleared on, and stands open until the body is in.
 * A later round comes out of a mouth that is already open, and the last one
 * closes it behind the tail while the verdict stands.
 *
 * Exempt as *a look the owner asked for by name*.
 */

/** Beats the mouth takes to open for the way home, and to close after the last round. */
const SWING_BEATS = 1;

/** How far the hull's mouth is standing open this frame, 0 to 1. */
export function snakeIntake(world: World, beatPhase: number, round: SnakeState): number {
  if (round.phase === "morph") {
    const t = emerge01(world, beatPhase, round);
    // The round after a way home: the mouth never shut, so it does not open
    // again. It holds until the emergence would have finished opening it.
    if (round.round > 0 && t < 0.18) return 1;
    return emergeIntake(t);
  }
  if (!snakeGoingHome(round)) return 0;
  if (round.phase === "play") return swing(world.beat - round.clearBeat + beatPhase);
  if (!round.passed) return 0;
  return 1 - swing(world.beat - round.phaseBeat + beatPhase);
}

function swing(beats: number): number {
  return smoothstep(Math.max(0, Math.min(1, beats / SWING_BEATS)));
}

/**
 * A chevron on the last tile before the mouth, pointing in, while the body is
 * still out on the arena: the one tile of the floor that is not a wall, and
 * only now. It breathes on the beat, as the items do.
 */
export function drawSnakeGate(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  world: World,
  round: SnakeState,
  pulse: number,
): void {
  if (round.phase !== "play" || !snakeGoingHome(round)) return;
  const head = round.body[0];
  if (head === undefined || head.row >= arena.rows) return;
  const gate = snakeGate(world.cfg);
  const x = arenaX(arena, gate.col) + arena.tile / 2;
  const y = arenaY(arena, gate.row - 1) + arena.tile / 2;
  const w = arena.tile * 0.34;
  ctx.save();
  ctx.globalAlpha = 0.55 + 0.45 * pulse;
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = Math.max(1.5, arena.tile * 0.12);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - w, y - w * 0.5);
  ctx.lineTo(x, y + w * 0.5);
  ctx.lineTo(x + w, y - w * 0.5);
  ctx.stroke();
  ctx.restore();
}
