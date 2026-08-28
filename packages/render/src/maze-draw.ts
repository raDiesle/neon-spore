import {
  MAZE_LANES,
  MAZE_MOUTHS,
  MAZE_VERDICT_BEATS,
  type MazeDir,
  type MazeState,
  type MazeTangle,
  mazeCurrent,
  mazeDirsOf,
  mazeMouthCol,
  mazeSeatMask,
  type SimConfig,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout, ViewRole } from "./layout.js";
import { tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's picture: three mouths above the hull, and behind them the
 * lattice each seat reads its own half of.
 *
 * `packages/sim/src/maze.ts` carries the one rule that matters —
 * `mazeSeatMask` is what a seat can see at a node, and this file draws
 * exactly that mask, nothing computed a second time. The split is by
 * *layer*, not by region: both screens draw every node of the same lattice,
 * so nobody learns anything by counting how many nodes the other side got.
 * Player 1, the pilot, draws a node's **arms** — the two ways out, with no
 * hint which is fused. Player 2, the navigator, draws its **wall** — the one
 * direction shut, with no hint an arm was ever there. `test` draws both, the
 * solo view holding both halves at once (`showsQueenShape`/`showsQueenHint`).
 *
 * The shot is drawn at its current node and nowhere else — no trail, because
 * a trail would retrace the very path the split keeps off one screen. Only
 * `MazeState` is read, so the file is stateless: nothing outlives a frame and
 * `Effects.reset()` has nothing of it to clear, as `gauge.ts`/`mirror.ts` are.
 */

const TOP_FRAC = 0.05;
const ROW_FRAC = 0.065;
const NODE_R_TILE = 0.09;
/** How far an arm reaches toward the next row, and how far a wall's stub does. */
const ARM_REACH = 0.92;
const WALL_REACH = 0.4;

function seatOf(role: ViewRole): 0 | 1 | 2 {
  if (role === "p1") return 1;
  if (role === "p2") return 2;
  return 0;
}

/** The x every mouth and every lane in between sits on, tied to the real
 * columns the cannon fires from — never a width guessed independently of it. */
function mouthXs(l: Layout, cfg: SimConfig): number[] {
  const xs: number[] = [];
  for (let mouth = 0; mouth < MAZE_MOUTHS; mouth++) xs.push(tileCX(l, mazeMouthCol(cfg, mouth)));
  return xs;
}

/** A lane's x, piecewise-linear between the mouths it sits between or on. */
function laneX(mouths: number[], lane: number): number {
  const half = (MAZE_LANES - 1) / 2;
  const t = lane <= half ? lane / half : (lane - half) / half;
  const [a, b] = lane <= half ? [mouths[0]!, mouths[1]!] : [mouths[1]!, mouths[2]!];
  return a + (b - a) * t;
}

const rowY = (l: Layout, row: number) =>
  l.gridTop + l.gridHeight * (TOP_FRAC + ROW_FRAC * (row + 1));
const mouthY = (l: Layout) => l.gridTop + l.gridHeight * TOP_FRAC;

/** Where the arm or wall leaving `(row, lane)` toward `dir` points at. */
function nextPoint(l: Layout, mouths: number[], row: number, lane: number, dir: MazeDir) {
  return { nx: laneX(mouths, lane + dir), ny: rowY(l, row + 1) };
}

export function drawMaze(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  role: ViewRole,
  beat: number,
  beatPhase: number,
): void {
  const tangle = mazeCurrent(m);
  if (tangle === null) return;
  const mouths = mouthXs(l, cfg);

  drawMouths(ctx, l, mouths);
  drawLattice(ctx, l, mouths, tangle, seatOf(role));
  drawShot(ctx, l, mouths, m, beat, beatPhase);
}

/** The three openings above the hull. A shot into any other column is not an
 * answer at all (`mazeHeard`), so only these three columns get a mouth. */
function drawMouths(ctx: CanvasRenderingContext2D, l: Layout, mouths: number[]): void {
  const y = mouthY(l);
  const r = l.tile * NODE_R_TILE * 1.6;
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 1.6;
  for (const x of mouths) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 0);
    ctx.stroke();
  }
}

/**
 * Every node of the lattice, drawn with only the one seat's half of it —
 * `mazeSeatMask` for the pilot's arms and `node.blocked` directly for the
 * navigator's wall, which is stored data rather than anything computed.
 */
function drawLattice(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mouths: number[],
  tangle: MazeTangle,
  seat: 0 | 1 | 2,
): void {
  const showArms = seat !== 2;
  const showWalls = seat !== 1;

  tangle.nodes.forEach((row, r) => {
    row.forEach((node, lane) => {
      const cx = laneX(mouths, lane);
      const cy = rowY(l, r);

      if (showArms) {
        for (const dir of mazeDirsOf(mazeSeatMask(node, lane, 1))) {
          drawArm(ctx, l, mouths, r, lane, cx, cy, dir);
        }
      }
      if (showWalls) {
        for (const dir of mazeDirsOf(node.blocked)) {
          drawWall(ctx, l, mouths, r, lane, cx, cy, dir);
        }
      }

      ctx.beginPath();
      ctx.arc(cx, cy, l.tile * NODE_R_TILE, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.grid;
      ctx.fill();
      ctx.strokeStyle = PALETTE.dim;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  });
}

/** One line from a node toward the row below — an arm, drawn plainly. */
function drawArm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mouths: number[],
  row: number,
  lane: number,
  cx: number,
  cy: number,
  dir: MazeDir,
): void {
  const { nx, ny } = nextPoint(l, mouths, row, lane, dir);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (nx - cx) * ARM_REACH, cy + (ny - cy) * ARM_REACH);
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

/**
 * A short gate glyph across the one direction this node shuts — a stub of the
 * would-be arm capped by a plug, so it reads as *closed* rather than as a
 * shorter version of the pilot's open line. Deliberately fewer strokes than
 * an arm: one stub and one plug against two full-length lines, so a navigator
 * frame never simply looks like a pilot frame with less reach.
 */
function drawWall(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mouths: number[],
  row: number,
  lane: number,
  cx: number,
  cy: number,
  dir: MazeDir,
): void {
  const { nx, ny } = nextPoint(l, mouths, row, lane, dir);
  const tx = cx + (nx - cx) * WALL_REACH;
  const ty = cy + (ny - cy) * WALL_REACH;

  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(tx, ty, l.tile * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.red;
  ctx.fill();
}

/**
 * The shot, at its current node only — never a trail. `probeLane` sits at
 * `-1` while nothing is travelling, which is also true in `lead` and `read`,
 * so this quietly draws nothing until the pair has actually fired.
 */
function drawShot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mouths: number[],
  m: MazeState,
  beat: number,
  beatPhase: number,
): void {
  if (m.phase !== "travel" && m.phase !== "verdict") return;
  if (m.probeLane < 0) return;

  const x = laneX(mouths, m.probeLane);
  const y = rowY(l, m.probeRow);
  const r = l.tile * NODE_R_TILE * 2.4;

  // Right in the one colour this game ever calls a success, wrong in the one
  // it already spends on "not what you wanted" (`PALETTE.good`, `effects-spark.ts`).
  let hex: string = PALETTE.pod;
  let alpha = 0.85;
  if (m.phase === "verdict") {
    const age = beat - m.phaseBeat + beatPhase;
    alpha = Math.max(0, 1 - age / MAZE_VERDICT_BEATS);
    if (alpha <= 0) return;
    hex = m.verdict === 1 ? PALETTE.good : PALETTE.sparkDim;
  }

  halo(ctx, x, y, r * 2.6, hex, alpha);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}
