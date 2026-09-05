import {
  type MazeState,
  type MazeWheel,
  mazeEntranceAngle,
  mazeEntranceCol,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { mazeCanvasAngle, mazeDrum, mazeRimHalfGapMilli } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's way in, and the light that comes out of it when it is standing on
 * the ship's column.
 *
 * **A gap is drawn as a gap.** There used to be a filled circle on the rim at
 * each way in, which the owner read exactly as it looked: something plugging
 * the hole rather than the hole itself. The rim is already broken there by
 * `maze-walls.ts` — the opening *is* the missing stretch of line — so nothing
 * is drawn over it at all. What marks it instead is what a door does: light.
 *
 * **Lit, it is a door standing open with something behind it.** A wedge of
 * light leans out of the gap and down the column toward the ship, widening as
 * it falls, with the two cut ends of the rim burning either side of it. That
 * is the invitation to fire, and it is on both screens.
 *
 * **Unlit, it is marked by its own cut ends and nothing else**, which is the
 * point: a pair looking for the way in has to find the break in the line. Two
 * pips on the ends are all it gets, so a gap on the far side of the drum can
 * be seen coming without being a lamp.
 *
 * **The whole thing is drawn at twice the size it was.** The owner asked for
 * the way in to be twice as wide and twice as visible, and both halves of that
 * are here: the hole itself is cut at `MAZE_RIM_OPEN_MUL` times the sheet's
 * own width (`maze-walls.ts`, which is where the rim is broken), so the wedge
 * standing on its two ends comes out twice as wide with no second number, and
 * the marks on the ends are drawn heavier to match.
 */

/** How far down the column the light reaches, as a share of the way to the hull. */
const REACH = 0.92;
/** How much wider than the gap the light is where it lands. */
const SPREAD = 3.4;
/** The pips on an unlit gap's cut ends, in pixels. */
const PIP = 3.2;

/** The half-angle a way in takes up at the rim, which is where the door is
 * cut. The rim's own helper, so the doorway stands on the hole the wall was
 * actually broken at rather than on a second opinion about how wide it is. */
function halfGap(wheel: MazeWheel, drumR: number): number {
  return mazeRimHalfGapMilli(wheel, drumR);
}

/**
 * Every way in on the rim, and the one that has clicked onto the ship's column
 * lit up. `beat` and `beatPhase` breathe it rather than a stored clock, so
 * there is nothing here for a restart to leave behind.
 */
export function drawMazeDoors(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: Parameters<typeof mazeEntranceCol>[0],
  m: MazeState,
  wheel: MazeWheel,
  beat: number,
  beatPhase: number,
  fall = 0,
): void {
  // A drum coming apart has no doors to stand open (`maze-fall.ts`).
  if (fall > 0) return;
  const d = mazeDrum(l, cfg);
  const half = halfGap(wheel, d.r);
  const pulse = 0.6 + 0.4 * Math.sin((beat + beatPhase) * Math.PI);

  for (const [way] of wheel.entrances.entries()) {
    const at = mazeEntranceAngle(wheel, m.angleMilli, way);
    const lit = m.lockedWay === way && mazeEntranceCol(cfg, wheel, m.angleMilli, way) >= 0;
    const edge = (side: 1 | -1) => {
      const p = mazeCanvasAngle(at + side * half);
      return { x: d.cx + d.r * Math.cos(p), y: d.cy + d.r * Math.sin(p) };
    };
    const a = edge(1);
    const b = edge(-1);

    if (!lit) {
      // The cut ends of the rim, and nothing else. Enough to see a gap coming
      // round; not enough to read as a thing sitting in the hole.
      ctx.fillStyle = PALETTE.hullRim;
      ctx.globalAlpha = 0.7;
      for (const p of [a, b]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PIP, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      continue;
    }

    // The doorway itself: the two cut ends burning, so the opening reads as an
    // edge that has been *opened* rather than as a smudge on the rim.
    const mouth = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const foot = mouth.y + (l.hullY - mouth.y) * REACH;
    const wide = (Math.hypot(a.x - b.x, a.y - b.y) / 2) * SPREAD;

    // Light spilling out and falling down the column, widening as it goes and
    // fading out before it reaches the hull — a door open on a lit room.
    const spill = ctx.createLinearGradient(mouth.x, mouth.y, mouth.x, foot);
    spill.addColorStop(0, `${PALETTE.good}CC`);
    spill.addColorStop(0.35, `${PALETTE.good}44`);
    spill.addColorStop(1, `${PALETTE.good}00`);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55 + 0.45 * pulse;
    ctx.fillStyle = spill;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(mouth.x - wide, foot);
    ctx.lineTo(mouth.x + wide, foot);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = PALETTE.good;
    ctx.lineWidth = 4.2;
    ctx.globalAlpha = 0.95;
    for (const p of [a, b]) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + (p.x - d.cx) * 0.09, p.y + (p.y - d.cy) * 0.09);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
