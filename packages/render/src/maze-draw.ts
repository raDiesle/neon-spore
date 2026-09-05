import {
  MAZE_TURN,
  type MazeState,
  type MazeWheel,
  mazeCircleMilli,
  mazeCurrent,
  mazeEntranceAngle,
  mazeEntranceCol,
  type SimConfig,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout, ViewRole } from "./layout.js";
import { drawMazeHeart } from "./maze-heart.js";
import { drawMazeShot, drawMazeSpent } from "./maze-shot.js";
import { drawMazeString } from "./maze-string.js";
import { drawMazeWalls, mazeDrum } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's picture: a real maze of rings turning over the ship, with the one
 * gap in its rim lit when it has clicked onto a column.
 *
 * **The maze is drawn, walls and all.** It used to be drawn shut — plain
 * circles and a dot or two on the rim, with the corridors left out on purpose
 * so that neither player could trace a way in. What that produced on the
 * screen was a set of concentric rings nobody would call a maze, and the shot
 * hopped through them along a route typed in beside them rather than one the
 * picture could be checked against. The drum now carries its own walls
 * (`packages/sim/src/maze-wheel.ts`); `maze-walls.ts` draws exactly those and
 * `maze-shot.ts` draws what gets through them, so what the pair looks at is
 * the thing the shot has to cross.
 *
 * **Both screens draw the same frame, and `role` decides one word in it.**
 * With the maze, the shot and the middle all on both of them there is no seat
 * to draw the *round* for — `packages/sim/src/maze.ts` has why, and it is a
 * decision the owner made three times rather than an omission. The string is
 * the exception and not a breach of it: only the pilot may turn the wheel, so
 * the handle has to say whose it is, the same way the tether's does.
 *
 * Where the wheel stands, which column the gap has taken, how wide the drum is
 * and which way the shot turns are all read out of `sim` rather than worked
 * out again — a picture that lit a column the shot does not go up would be the
 * one defect nobody could see. Only `MazeState` is read, so nothing outlives a
 * frame and `Effects.reset()` has nothing of this to clear.
 */

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
  const drum = mazeDrum(l, cfg);
  drawMazeWalls(ctx, drum, wheel, m.angleMilli);
  // What is at the end of the walk, drawn before the trail and the shot so
  // both of them arrive *on* it rather than behind it.
  drawMazeHeart(
    ctx,
    drum.cx,
    drum.cy,
    (drum.r * mazeCircleMilli(wheel, 0)) / 1000,
    m.round,
    beat,
    beatPhase,
  );
  drawMazeSpent(ctx, l, cfg, m, wheel);
  drawMazeString(ctx, l, cfg, m, role);
  drawMouths(ctx, l, cfg, m, wheel, beat, beatPhase);
  drawMazeShot(ctx, l, cfg, m, wheel, beat, beatPhase);
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
