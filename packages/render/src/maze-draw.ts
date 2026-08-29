import {
  MAZE_TURN,
  type MazeCell,
  type MazeState,
  type MazeWheel,
  mazeCenterMilli,
  mazeCurrent,
  mazeEntranceAngle,
  mazeEntranceCol,
  mazeRadiusMilli,
  type SimConfig,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout, ViewRole } from "./layout.js";
import { drawMazeString } from "./maze-string.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's picture: a closed drum of rings turning over the ship, with the
 * mouth that has clicked onto a column lit up.
 *
 * **The interior is drawn shut, and that is the round.** Rings and mouths, no
 * corridors — neither player is told which way in reaches the middle, so there
 * is nothing on the rim to trace and the shot is the only thing that finds
 * out. What the drum gives back is the *route it has already spent*: the cells
 * a shot walked stay lit behind it, and the ones from failed attempts stay on
 * dim. That is what the pair is looking at when they decide where to go next,
 * and it is why a dead end teaches something instead of only costing.
 *
 * **Both screens draw the same frame, and `role` decides one word in it.**
 * With the light, the shot and the middle all on both of them there is no seat
 * to draw the *round* for — `packages/sim/src/maze.ts` has why, and it is a
 * decision the owner made three times rather than an omission. The string is
 * the exception and not a breach of it: only the pilot may turn the wheel, so
 * the handle has to say whose it is, the same way the tether's does.
 *
 * Where the wheel stands, which column a mouth has taken and how wide the drum
 * is are all read out of `sim` rather than worked out again — a picture that
 * lit a column the shot does not go up would be the one defect nobody could
 * see. Only `MazeState` is read, so nothing outlives a frame and
 * `Effects.reset()` has nothing of this to clear.
 */

/** How far the rim sits below the top of the field, in tiles. */
const CLEAR_TILES = 0.6;

/**
 * The wheel's centre and rim, in pixels, from the numbers the simulation uses.
 * Exported because `maze-string.ts` hangs the handle off the bottom of it and
 * `touch.ts` answers a press there — three files, one circle.
 */
export function mazeDrum(l: Layout, cfg: SimConfig): { cx: number; cy: number; r: number } {
  const r = (mazeRadiusMilli(cfg) * l.tile) / 1000;
  return {
    cx: l.gridLeft + (mazeCenterMilli(cfg) * l.tile) / 1000,
    cy: l.gridTop + r + l.tile * CLEAR_TILES,
    r,
  };
}

/** The radius of a ring, ring 0 being the middle. */
function ringR(r: number, wheel: MazeWheel, ring: number): number {
  return (r * (ring + 1)) / wheel.rings;
}

/** Where a cell sits, in pixels, with the wheel where it currently stands. */
function cellXY(
  l: Layout,
  cfg: SimConfig,
  wheel: MazeWheel,
  angleMilli: number,
  cell: MazeCell,
): { x: number; y: number } {
  const d = mazeDrum(l, cfg);
  const rad = ringR(d.r, wheel, cell.ring) - d.r / (2 * wheel.rings);
  const theta =
    ((angleMilli + (cell.sector * MAZE_TURN) / wheel.sectors) / MAZE_TURN) * Math.PI * 2;
  return { x: d.cx + rad * Math.sin(theta), y: d.cy + rad * Math.cos(theta) };
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
  const wheel = mazeCurrent(m);
  if (wheel === null) return;
  drawDrum(ctx, l, cfg, wheel);
  drawSpent(ctx, l, cfg, m, wheel);
  drawMazeString(ctx, l, cfg, m, role);
  drawMouths(ctx, l, cfg, m, wheel, beat, beatPhase);
  drawShot(ctx, l, cfg, m, wheel, beat, beatPhase);
}

/** The rings themselves, closed, with the middle a disc nobody can see into. */
function drawDrum(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  wheel: MazeWheel,
): void {
  const d = mazeDrum(l, cfg);
  for (let ring = wheel.rings - 1; ring >= 0; ring--) {
    ctx.beginPath();
    ctx.arc(d.cx, d.cy, ringR(d.r, wheel, ring), 0, Math.PI * 2);
    ctx.strokeStyle = ring === wheel.rings - 1 ? PALETTE.hullRim : PALETTE.dim;
    ctx.lineWidth = ring === wheel.rings - 1 ? 2.2 : 1.2;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(d.cx, d.cy, ringR(d.r, wheel, 0) * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.grid;
  ctx.fill();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Every cell a shot has already stood in, this attempt bright and the failed
 * ones dim. The drum remembers what it cost to learn, which is the only thing
 * either player can reason from.
 */
function drawSpent(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  wheel: MazeWheel,
): void {
  const r = mazeDrum(l, cfg).r / (wheel.rings * 3);
  for (const way of m.tried) {
    const route = wheel.entrances[way]?.route ?? [];
    const live = way === m.way;
    const last = live ? m.step : route.length - 1;
    for (const [i, cell] of route.entries()) {
      if (i > last) break;
      const { x, y } = cellXY(l, cfg, wheel, m.angleMilli, cell);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = live ? PALETTE.pod : PALETTE.sparkDim;
      ctx.globalAlpha = live ? 0.55 : 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // The cell a failed attempt stopped in gets a cap, so a dead end reads as
    // a wall rather than as a route that merely stopped being drawn.
    const end = route.at(-1);
    if (live || end === undefined || end.ring === 0) continue;
    const { x, y } = cellXY(l, cfg, wheel, m.angleMilli, end);
    ctx.beginPath();
    ctx.arc(x, y, r * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.red;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

/**
 * The ways in, on the rim, and the one that has clicked onto a column lit.
 *
 * The light is the invitation to fire and it is on both screens. It breathes
 * on the beat rather than on a stored clock, so there is nothing here for a
 * restart to leave behind.
 */
function drawMouths(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  wheel: MazeWheel,
  beat: number,
  beatPhase: number,
): void {
  const d = mazeDrum(l, cfg);
  const pulse = 0.6 + 0.4 * Math.sin((beat + beatPhase) * Math.PI);
  for (const [way] of wheel.entrances.entries()) {
    const theta = (mazeEntranceAngle(wheel, m.angleMilli, way) / MAZE_TURN) * Math.PI * 2;
    const x = d.cx + d.r * Math.sin(theta);
    const y = d.cy + d.r * Math.cos(theta);
    const lit = m.lockedWay === way && mazeEntranceCol(cfg, wheel, m.angleMilli, way) >= 0;
    const r = l.tile * (lit ? 0.3 : 0.22);
    if (lit) halo(ctx, x, y, r * 4, PALETTE.good, 0.5 * pulse);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = lit ? PALETTE.good : PALETTE.grid;
    ctx.fill();
    ctx.strokeStyle = lit ? PALETTE.good : PALETTE.hullRim;
    ctx.lineWidth = lit ? 2.4 : 1.4;
    ctx.stroke();
    // A lit mouth draws the line the shot will take, straight down its column,
    // so the invitation is to a *column* and not merely to a bright spot.
    if (!lit) continue;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, l.hullY);
    ctx.strokeStyle = PALETTE.good;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25 * pulse;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/**
 * The shot itself, at the cell it stands in, and what it found once it has
 * stopped. `way` is -1 whenever nothing is travelling, which is also true
 * through `lead` and `read`, so this quietly draws nothing until the pair has
 * actually fired.
 */
function drawShot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  wheel: MazeWheel,
  beat: number,
  beatPhase: number,
): void {
  if (m.way < 0 || (m.phase !== "travel" && m.phase !== "verdict")) return;
  const cell = wheel.entrances[m.way]?.route[m.step];
  if (cell === undefined) return;
  const { x, y } = cellXY(l, cfg, wheel, m.angleMilli, cell);
  const r = mazeDrum(l, cfg).r / (wheel.rings * 2.2);

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
