import type { MazeState } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { hullBarBox } from "./hud.js";
import type { Layout } from "./layout.js";
import { mazeHeartBlood } from "./maze-heart.js";
import { PALETTE } from "./palette.js";

/**
 * How far through THE MAZE the pair is: one cell per stage, under the ship's
 * own hull bar.
 *
 * **It is the boss's health, told as stages rather than as a fraction.** The
 * boss loses an equal share of its hull for each wheel finished
 * (`sim/maze-verdict.ts`), so a bar would have said the same thing less
 * usefully: what a pair actually wants to know at this boss is *how many more
 * of these are there*, and a row of five cells answers that at a glance while
 * a half-empty bar does not. The owner asked for it in those words.
 *
 * **It sits directly under the ship's hull bar and is the same width**, out of
 * `hullBarBox` rather than out of four numbers copied from it, so the two read
 * as a pair: ours above, its below. Nothing else on this boss says how long it
 * is — the blood on the floor says how hurt it is, and neither of them is a
 * number.
 *
 * **A finished stage keeps the colour its heart was beating in.** That is free
 * information the pair has already earned, and it turns the row into a record
 * of the fight rather than a counter. Stages still to come are blank: which
 * colour is next is the thing they find out by looking at the drum.
 */

/** Height of one cell, and the gap between two. */
const CELL_H = 5;
const CELL_GAP = 3;
/** How far under the hull bar the row hangs. */
const DROP = 5;

/**
 * The row. `beat` and `beatPhase` breathe the cell the pair is on and nothing
 * else, so there is no clock here for a restart to leave behind.
 */
export function drawMazeStages(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  m: MazeState,
  beat: number,
  beatPhase: number,
): void {
  const stages = m.rounds.length;
  if (stages < 1) return;
  const bar = hullBarBox(l);
  const y = bar.y + bar.h + DROP;
  const w = (bar.w - CELL_GAP * (stages - 1)) / stages;
  const pulse = 0.55 + 0.45 * Math.sin((beat + beatPhase) * Math.PI);

  for (let i = 0; i < stages; i++) {
    const x = bar.x + i * (w + CELL_GAP);
    if (i < m.round) {
      // Done, in the colour that stage's heart ran.
      ctx.fillStyle = mazeHeartBlood(i).tint;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, w, CELL_H);
    } else if (i === m.round) {
      const { tint, rim } = mazeHeartBlood(i);
      halo(ctx, x + w / 2, y + CELL_H / 2, w * 0.7, tint, 0.15 + 0.25 * pulse);
      ctx.fillStyle = rim;
      ctx.globalAlpha = 0.5 + 0.5 * pulse;
      ctx.fillRect(x, y, w, CELL_H);
    } else {
      // Still to come, and deliberately saying nothing about which colour.
      ctx.fillStyle = "#2A1F4E";
      ctx.globalAlpha = 1;
      ctx.fillRect(x, y, w, CELL_H);
    }
  }
  ctx.globalAlpha = 1;

  // The mark on the left, where the hull bar carries its heart: three arcs, so
  // the row is read as the drum's and not as a second hull.
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1;
  for (let k = 1; k <= 3; k++) {
    ctx.beginPath();
    ctx.arc(bar.x - 9, y + CELL_H / 2, k * 1.7, 0.6, Math.PI * 2 - 0.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
