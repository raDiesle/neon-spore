import { type MazeState, mazeCircleMilli, mazeCurrent, type SimConfig } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { drawMazeDoors } from "./maze-door.js";
import { mazeFall } from "./maze-fall.js";
import { drawMazeHeart } from "./maze-heart.js";
import { drawMazeShot } from "./maze-shot.js";
import { drawMazeStages } from "./maze-stage.js";
import { drawMazeString } from "./maze-string.js";
import { drawMazeWalls, mazeDrum } from "./maze-walls.js";

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
 * **A dead end takes the drum apart, and the heart is left standing in it.**
 * The walls drift out, turn and fade over the three beats of the verdict
 * (`maze-fall.ts`) while the body in the middle carries on beating, which is
 * the picture of what has actually happened: the stage is gone and the boss is
 * not. The ways in stop being drawn the moment it starts — there are no doors
 * in a wall that is coming down.
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
  const fall = mazeFall(m, beat, beatPhase);
  drawMazeWalls(ctx, drum, wheel, m.angleMilli, fall);
  // What is at the end of the walk, drawn before the trail and the shot so
  // both of them arrive *on* it rather than behind it.
  drawMazeHeart(
    ctx,
    drum.cx,
    drum.cy,
    (drum.r * mazeCircleMilli(wheel, 0)) / 1000,
    m,
    beat,
    beatPhase,
  );
  drawMazeString(ctx, l, cfg, m, role);
  drawMazeDoors(ctx, l, cfg, m, wheel, beat, beatPhase, fall);
  drawMazeShot(ctx, l, cfg, m, wheel, beat, beatPhase);
  drawMazeStages(ctx, l, m, beat, beatPhase);
}
