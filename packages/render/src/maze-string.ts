import { circleSubpath, openSmoothPath, type Point } from "@neon-spore/content";
import type { MazeState, SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawHandleHint, HANDLE_TILES, HINT_LOUD } from "./handle-draw.js";
import type { Circle, Layout, ViewRole } from "./layout.js";
import { mazeDrum } from "./maze-draw.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE MAZE's string, and the handle on it: the one thing in this round either
 * player can put a hand on.
 *
 * It is a file of its own rather than another section of `maze-draw.ts` for
 * the ordinary reason — that file was already at the limit — but the split
 * lands somewhere real. Everything next door is the drum *reporting*: rings,
 * spent cells, a lit mouth, a shot walking. This is the round's only control,
 * and the only thing here `touch.ts` has to agree with.
 */

/** How far below the rim the handle hangs, in tiles. */
const STRING_TILES = 1.1;

/**
 * How far sideways the handle is drawn from where it rests, at most, in tiles.
 * The handle follows the finger — that is what makes the pull direct — but a
 * hand that has carried the wheel most of a turn is a hand off the side of the
 * picture, and a handle drawn out there is a handle nobody can see pulling.
 */
const SWING_TILES = 1.5;

/**
 * Where the handle rests, with no hand on it.
 *
 * **The one place it is written down.** `touch.ts` answers a press exactly
 * here and this file draws exactly here, for the reason `layout.ts` gives
 * about every other control: a button drawn in one place and answered in
 * another is a button that works until somebody moves one of them.
 *
 * It reads the layout and the config and nothing in the round, so a press is
 * tested against the same circle whatever the wheel is doing. The handle
 * swings while it is dragged and that costs nothing: by then the pointer is
 * captured and nothing is hit-tested again.
 */
export function mazeStringCircle(l: Layout, cfg: SimConfig): Circle {
  const d = mazeDrum(l, cfg);
  return { x: d.cx, y: d.cy + d.r + l.tile * STRING_TILES, r: l.tile * HANDLE_TILES };
}

/**
 * **The word is the seat's, and it is not the tether's answer.** `tether.ts`
 * shows PULL to whichever player may take the line this cycle and HELD to the
 * other, because the line changes hands. The wheel does not: only the pilot
 * may ever turn it (`mazeStringHeard`), so player 1 reads PULL and player 2 is
 * told whose hand it is rather than waiting for a turn that never comes.
 *
 * Drawn only while the wheel can actually be turned. A handle standing under a
 * drum that is watching a shot walk is an invitation to press something that
 * does nothing.
 */
export function drawMazeString(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  role: ViewRole,
): void {
  if (m.phase !== "read") return;
  const rest = mazeStringCircle(l, cfg);
  const d = mazeDrum(l, cfg);
  // The handle sits under the finger on **both** screens, so the navigator
  // watches the pilot pull rather than only the wheel's answer to it.
  const swing = l.tile * SWING_TILES;
  const off = Math.max(-swing, Math.min(swing, (m.dragFromMilli * l.tile) / 1000));
  const x = rest.x + off;
  const live = m.dragging ? PALETTE.pod : PALETTE.hullRim;

  // Slack, so a pull bows the cord instead of swinging a lever. Built as a
  // path *string* like every other open contour here (`tether.ts`): the frame
  // test draws through a canvas that takes one and refuses the rest.
  const top = d.cy + d.r;
  const pts: Point[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push({ x: d.cx + off * t * (0.35 + 0.65 * t), y: top + (rest.y - top) * t });
  }
  strokeGlow(ctx, new Path2D(openSmoothPath(pts)), live, STROKE.inner, 0.8);

  const p = new Path2D(circleSubpath(x, rest.y, rest.r));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = m.dragging ? PALETTE.pod : PALETTE.grid;
  ctx.globalAlpha = 0.7;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, live, STROKE.inner, 1);

  // The word goes as soon as a hand lands, the way the tether's does: from
  // then on the handle's own position says it.
  if (m.dragging) return;
  drawHandleHint(ctx, l, role, x, rest.y + l.tile * 0.65, HINT_LOUD);
}
