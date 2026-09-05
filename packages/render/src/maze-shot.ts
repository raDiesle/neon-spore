import {
  MAZE_APPROACH_BEATS,
  MAZE_TURN,
  type MazeState,
  type MazeStep,
  type MazeWheel,
  mazeCircleMilli,
  mazeRingMilli,
  mazeSweep,
  type SimConfig,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { mazeDrum } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * The shot inside THE MAZE: where it stands, from the muzzle to the middle.
 *
 * Its own file for the reason `maze-walls.ts` is: `maze-draw.ts` was past the
 * ceiling `CLAUDE.md` sets, and the seam was already there — the walls stand
 * still, this moves, and the file that opens the round only puts the two in
 * order. Everything here reads the route the simulation solved and the sweep
 * it solved it with; nothing here decides where a corridor goes.
 */

/** Where a step of a route sits, in pixels, with the wheel where it stands. */
function stepXY(
  l: Layout,
  cfg: SimConfig,
  wheel: MazeWheel,
  angleMilli: number,
  ring: number,
  atMilli: number,
): { x: number; y: number } {
  const d = mazeDrum(l, cfg);
  const rad = (d.r * mazeRingMilli(wheel, ring)) / 1000;
  const theta = ((angleMilli + atMilli) / MAZE_TURN) * Math.PI * 2;
  return { x: d.cx + rad * Math.sin(theta), y: d.cy + rad * Math.cos(theta) };
}

/**
 * How much of a beat the shot spends turning along its ring before it crosses
 * into the next one. Turning first rather than doing both at once is what
 * keeps it off the walls in the picture as well as in the arithmetic —
 * `mazeSweep` says which way round, so the corner it takes is the corner the
 * corridor takes.
 */
const CROSS_AT = 0.72;

function shotXY(
  l: Layout,
  cfg: SimConfig,
  wheel: MazeWheel,
  angleMilli: number,
  route: MazeStep[],
  step: number,
  phase: number,
): { x: number; y: number } {
  const here = route[step];
  if (here === undefined) return stepXY(l, cfg, wheel, angleMilli, 0, 0);
  const next = route[step + 1];
  if (next === undefined) return stepXY(l, cfg, wheel, angleMilli, here.ring, here.angleMilli);
  const swept = mazeSweep(wheel, here.ring, here.angleMilli, next.angleMilli);
  const at = here.angleMilli + swept * Math.min(1, phase / CROSS_AT);
  if (phase <= CROSS_AT) return stepXY(l, cfg, wheel, angleMilli, here.ring, at);
  const across = (phase - CROSS_AT) / (1 - CROSS_AT);
  const from = stepXY(l, cfg, wheel, angleMilli, here.ring, at);
  const to = stepXY(l, cfg, wheel, angleMilli, next.ring, at);
  return { x: from.x + (to.x - from.x) * across, y: from.y + (to.y - from.y) * across };
}

/**
 * The shot, from the muzzle to the middle: one object the whole way.
 *
 * **It is the shot, not a stand-in for it.** The drum swallows the bullet the
 * trigger produced (`maze-controls.ts`), and what is drawn here climbs the
 * column, goes in through the gap and crawls the corridors in the colour
 * player 2 loaded, with the halo and the head an ordinary shot has. Before
 * this there were two objects: a red or cyan bullet going straight up past the
 * gap and off the top of the field, and a gold circle doing the walk. The
 * owner saw both and said so.
 *
 * **Nothing is drawn ahead of it, and nothing behind it.** A trail down the
 * corridors it had already walked read as the route being shown, which gives
 * away the one thing the shot is there to find out.
 */
export function drawMazeShot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  wheel: MazeWheel,
  beat: number,
  beatPhase: number,
): void {
  if (m.way < 0 || (m.phase !== "travel" && m.phase !== "verdict")) return;
  const route = wheel.entrances[m.way]?.route ?? [];
  const first = route[0];
  if (first === undefined) return;
  const since = beat - m.phaseBeat + beatPhase;
  const hex = m.shotColor === 1 ? PALETTE.cyan : PALETTE.red;

  const wide = (mazeCircleMilli(wheel, 1) - mazeCircleMilli(wheel, 0)) / 1000;
  const r = Math.max(2, (mazeDrum(l, cfg).r * wide) / 3.2);

  let at: { x: number; y: number };
  let alpha = 0.95;
  if (m.phase === "travel" && since < MAZE_APPROACH_BEATS) {
    // The climb. It comes off the hull in its own column and rises to the gap,
    // which is where the route's first step already stands.
    const gap = stepXY(l, cfg, wheel, m.angleMilli, first.ring, first.angleMilli);
    const t = Math.max(0, Math.min(1, since / MAZE_APPROACH_BEATS));
    at = { x: gap.x, y: l.hullY + (gap.y - l.hullY) * t };
    // The tail an ordinary shot wears, so the climb reads as a shot travelling
    // rather than as a dot sliding.
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = hex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(at.x, Math.min(l.hullY, at.y + l.tile));
    ctx.lineTo(at.x, at.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else {
    const inside = Math.max(0, since - MAZE_APPROACH_BEATS);
    if (route[m.step] === undefined) return;
    const moving = m.phase === "travel";
    at = shotXY(l, cfg, wheel, m.angleMilli, route, m.step, moving ? inside - m.step : 1);
    if (m.phase === "verdict") {
      const age = beat - m.phaseBeat + beatPhase;
      alpha = Math.max(0, 1 - age / 3);
      if (alpha <= 0) return;
    }
  }

  halo(ctx, at.x, at.y, r * 3, hex, alpha);
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}
