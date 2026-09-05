import {
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
import { mazeCanvasAngle, mazeDrum } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * The shot inside THE MAZE: where it stands, the corridors behind it, and what
 * it found when it stopped.
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
 * The path itself, as the corridors run it: round each ring on the ring's own
 * circle, then straight across into the next. Drawn in arcs rather than in
 * lines from one step to the next, because a chord between two steps of the
 * same corridor cuts clean through the walls between them — which is what the
 * first frame of this drum showed, and exactly the complaint it was rebuilt to
 * answer.
 */
function trail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  wheel: MazeWheel,
  angleMilli: number,
  route: MazeStep[],
): void {
  const d = mazeDrum(l, cfg);
  const first = route[0];
  if (first === undefined) return;
  const at = stepXY(l, cfg, wheel, angleMilli, first.ring, first.angleMilli);
  ctx.beginPath();
  ctx.moveTo(at.x, at.y);
  for (const [i, cell] of route.entries()) {
    const next = route[i + 1];
    if (next === undefined) break;
    const radius = (d.r * mazeRingMilli(wheel, cell.ring)) / 1000;
    const turned = cell.angleMilli + mazeSweep(wheel, cell.ring, cell.angleMilli, next.angleMilli);
    if (radius > 0.5) {
      const from = mazeCanvasAngle(angleMilli + cell.angleMilli);
      ctx.arc(d.cx, d.cy, radius, from, mazeCanvasAngle(angleMilli + turned), true);
    }
    const across = stepXY(l, cfg, wheel, angleMilli, next.ring, turned);
    ctx.lineTo(across.x, across.y);
  }
}

/**
 * The corridors a shot has already been down, this attempt bright and any
 * failed one dim. The drum remembers what it cost to learn, which is the only
 * thing either player can reason from — and on a drum with one way in it is
 * simply the trail behind the shot, which is what makes the walk readable.
 */
export function drawMazeSpent(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  wheel: MazeWheel,
): void {
  for (const way of m.tried) {
    const route = wheel.entrances[way]?.route ?? [];
    const live = way === m.way;
    const last = live ? m.step : route.length - 1;
    trail(ctx, l, cfg, wheel, m.angleMilli, route.slice(0, last + 1));
    ctx.strokeStyle = live ? PALETTE.pod : PALETTE.sparkDim;
    ctx.lineWidth = live ? 2.4 : 1.6;
    ctx.globalAlpha = live ? 0.5 : 0.28;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/**
 * The shot itself, crawling the corridor it is in, and what it found once it
 * has stopped. `way` is -1 whenever nothing is travelling, which is also true
 * through `lead` and `read`, so this quietly draws nothing until the pair has
 * actually fired.
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
  if (route[m.step] === undefined) return;
  const moving = m.phase === "travel";
  const { x, y } = shotXY(l, cfg, wheel, m.angleMilli, route, m.step, moving ? beatPhase : 1);
  const wide = (mazeCircleMilli(wheel, 1) - mazeCircleMilli(wheel, 0)) / 1000;
  const r = Math.max(2, (mazeDrum(l, cfg).r * wide) / 3);

  // Right in the one colour this game ever calls a success, wrong in the one
  // it already spends on "not what you wanted" (`effects-spark.ts`).
  let hex: string = PALETTE.pod;
  let alpha = 0.85;
  if (m.phase === "verdict") {
    const age = beat - m.phaseBeat + beatPhase;
    alpha = Math.max(0, 1 - age / 3);
    if (alpha <= 0) return;
    hex = m.verdict === 1 ? PALETTE.good : PALETTE.sparkDim;
  }
  halo(ctx, x, y, r * 3, hex, alpha);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}
