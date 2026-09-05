import { MAZE_ROUNDS } from "@neon-spore/content";
import { drawMazeWalls, mazeCanvasAngle, mazeRimHalfGapMilli, PALETTE } from "@neon-spore/render";
import { type MazeWheel, mazeEntranceAngle, mazeReachesCore, mazeSweep } from "@neon-spore/sim";
import { button, el } from "./dom.js";

/**
 * THE MAZE's five stages, walked through one at a time.
 *
 * **It shows rather than edits, and that is the honest shape.** The drum is
 * authored data and has to stay that way — two devices must be looking at the
 * same maze, and the cheapest way to guarantee that is for there to be exactly
 * one (`packages/content/src/maze-rounds.ts`). A sheet reaches the field by
 * being drawn with `bun run maze`, read, judged and committed. What was missing
 * was the *judging*: the only way to see what a stage looked like was to reach
 * it in a run, which for the fifth one means playing four.
 *
 * **Every line comes out of the game's own drawing.** `drawMazeWalls` is the
 * same function the field calls, given a circle instead of a layout, so a sheet
 * that looks right here looks right there — a second renderer for the same
 * walls is exactly how a picture comes to disagree with the thing it is a
 * picture of.
 *
 * **The one thing added is the answer.** On the field neither player is told
 * which way in goes anywhere; here every gap is marked, green where it reaches
 * the heart and red where it dead-ends, with the length of each walk written
 * underneath. That is the whole reason an author opens this: to see at a glance
 * that a stage has one way through and four proper dead ends rather than four
 * cupboards.
 */

/** The drum, drawn as big as the panel comfortably takes. */
const SIZE = 260;

/** Which stage is open, kept across re-renders the way SNAKE's rounds are. */
let OPEN = 0;

export function renderMazeEditor(panel: HTMLElement, onEdit: () => void): void {
  const stages = MAZE_ROUNDS;
  const at = Math.min(OPEN, Math.max(0, stages.length - 1));
  const wheel = stages[at];

  panel.appendChild(
    el(
      "p",
      "note",
      "A wheel of rings turns behind the ship with ways in round its rim, and " +
        "only one of them reaches the heart in the middle — the rest are dead " +
        "ends, and a shot lost in one brings the drum down and starts the stage " +
        "again. Both screens see the same light. The sheets are authored in " +
        "packages/content/src/maze-rounds.ts and drawn by `bun run maze`; this " +
        "is where they are looked at.",
    ),
  );

  const bar = el("div", "snake-tabs");
  stages.forEach((_, i) => {
    const tab = button(`STAGE ${i + 1}`, i === at ? "snake-tab on" : "snake-tab");
    tab.addEventListener("click", () => {
      OPEN = i;
      onEdit();
    });
    bar.appendChild(tab);
  });
  panel.appendChild(bar);
  if (wheel === undefined) return;

  panel.appendChild(sheet(wheel));
  panel.appendChild(el("p", "note", reading(wheel)));
}

/** The stage as a picture: the game's own walls, with every way in marked. */
function sheet(wheel: MazeWheel): HTMLElement {
  const canvas = document.createElement("canvas");
  canvas.className = "maze-sheet";
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx === null) return canvas;

  const drum = { cx: SIZE / 2, cy: SIZE / 2, r: SIZE / 2 - 10 };
  drawMazeWalls(ctx, drum, wheel, wheel.startMilli);

  // A pip on each way in, out on the rim, in the colour of what it opens onto.
  const half = mazeRimHalfGapMilli(wheel, drum.r);
  for (const [way, entrance] of wheel.entrances.entries()) {
    const p = mazeCanvasAngle(mazeEntranceAngle(wheel, wheel.startMilli, way));
    const out = drum.r + 6;
    ctx.beginPath();
    ctx.arc(drum.cx + out * Math.cos(p), drum.cy + out * Math.sin(p), 4, 0, Math.PI * 2);
    ctx.fillStyle = mazeReachesCore(entrance) ? PALETTE.good : PALETTE.red;
    ctx.fill();
    // And the break in the rim itself, so the pip is read as belonging to that
    // gap rather than to the wall beside it. The drum's angles rise the way
    // canvas's fall, so the short way across the gap is the *forward* sweep
    // from the far edge to the near one.
    const centre = mazeEntranceAngle(wheel, wheel.startMilli, way);
    ctx.beginPath();
    ctx.arc(
      drum.cx,
      drum.cy,
      drum.r,
      mazeCanvasAngle(centre + half),
      mazeCanvasAngle(centre - half),
    );
    ctx.strokeStyle = mazeReachesCore(entrance) ? PALETTE.good : PALETTE.red;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  return canvas;
}

/** The stage in words: how many ways in, which one arrives, and how far each
 * walk goes before it stops. */
function reading(wheel: MazeWheel): string {
  const arrives = wheel.entrances.findIndex(mazeReachesCore);
  const duds = wheel.entrances
    .filter((e) => !mazeReachesCore(e))
    .map((e) => `${e.route.length}`)
    .join(", ");
  const walk = wheel.entrances[arrives];
  let sweep = 0;
  for (const [i, cell] of (walk?.route ?? []).entries()) {
    const next = walk?.route[i + 1];
    if (next === undefined) break;
    sweep += Math.abs(mazeSweep(wheel, cell.ring, cell.angleMilli, next.angleMilli));
  }
  return (
    `${wheel.entrances.length} way(s) in · way ${arrives + 1} arrives in ` +
    `${walk?.route.length ?? 0} crossings, ${Math.round(sweep / 1000)}° round the drum` +
    (duds === "" ? " · no dead ends" : ` · dead ends of ${duds} crossings`)
  );
}
