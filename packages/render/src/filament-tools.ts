import {
  FILAMENT_CORONA,
  FILAMENT_RASP,
  haloedContour,
  haloedHole,
  studdedContour,
} from "@neon-spore/content";
import type { FilamentState } from "@neon-spore/sim";
import { filamentGrabCircle, type Point } from "./filament-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The two tools the thumbs carry up the vein** — the owner, 25 September
 * 2026: *player 1 … with some weapon. and the other player needs some other
 * tool or weapon to carry behind … when both reach … the hearth inside, then
 * both weapons are applied*.
 *
 * - **Player 1 carries the rasp**, THE RASP's burr of spines, turning as it
 *   bores: steel, since it cuts the way.
 * - **Player 2 carries the corona**, THE CORONA's ring of nodes with its gap,
 *   turning slower: gold, the charge carried behind.
 *
 * Both ride under their thumb's ring on every screen, larger than it so the
 * spines and the nodes stand out round it and the ring's green or red stays
 * whole in the middle: this screen's own tool bright, the partner's at half,
 * so each player sees which tool is theirs and where the other one is. The shapes are content's (`filament-look.ts`).
 */

/** How far out the tool reaches, in ring radii: past the ring, so its teeth show round it. */
const REACH = 1.5;
/** The partner's ring is drawn smaller, and its tool with it. */
const THEIR_REACH = 1.15;
/** How fast each tool turns, in radians a second. */
const RASP_TURN = 5;
const CORONA_TURN = -1.6;
/** The partner's tool, at this much of its own. */
const THEIRS = 0.45;

const rasp = studdedContour(FILAMENT_RASP);
const RASP_R = Math.max(FILAMENT_RASP.rx, FILAMENT_RASP.ry) * (1 + FILAMENT_RASP.reach);
const CORONA_R = FILAMENT_CORONA.r * (1 + FILAMENT_CORONA.bump);

/** Points scaled by `k`, turned by `turn` and set down at `(x, y)`, added to `p` as a closed polygon. */
function placeInto(
  p: Path2D,
  pts: readonly Point[],
  x: number,
  y: number,
  k: number,
  turn: number,
): void {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  pts.forEach((q, i) => {
    const px = x + (q.x * c - q.y * s) * k;
    const py = y + (q.x * s + q.y * c) * k;
    if (i === 0) p.moveTo(px, py);
    else p.lineTo(px, py);
  });
  p.closePath();
}

/** The rasp's outline, `r` to the tips of its spines. */
export function filamentRaspPath(x: number, y: number, r: number, time: number): Path2D {
  const p = new Path2D();
  placeInto(p, rasp(time), x, y, r / RASP_R, time * RASP_TURN);
  return p;
}

/** The corona's ring, `r` to the tops of its nodes, its hole cut out. */
export function filamentCoronaPath(x: number, y: number, r: number, time: number): Path2D {
  const k = r / CORONA_R;
  const turn = time * CORONA_TURN;
  const p = new Path2D();
  placeInto(p, haloedContour(FILAMENT_CORONA, time, 120), x, y, k, turn);
  placeInto(p, haloedHole(FILAMENT_CORONA, time), x, y, k, turn);
  return p;
}

/** A seat's tool on its thumb's ring: bright when it is this screen's own, at half when it is the partner's. */
export function drawFilamentTool(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  seat: 1 | 2,
  own: boolean,
  time: number,
): void {
  const c = filamentGrabCircle(l, s, seat);
  if (c === null) return;
  const r = c.r * (own ? REACH : THEIR_REACH);
  const path =
    seat === 1 ? filamentRaspPath(c.x, c.y, r, time) : filamentCoronaPath(c.x, c.y, r, time);
  const hex = seat === 1 ? PALETTE.rock : PALETTE.pod;
  const dark = seat === 1 ? PALETTE.rockDark : PALETTE.podDark;
  const a = own ? 1 : THEIRS;
  ctx.save();
  ctx.fillStyle = rgba(dark, 0.85 * a);
  ctx.fill(path, "evenodd");
  ctx.restore();
  strokeGlow(ctx, path, own ? hex : rgba(hex, a), STROKE.inner, own ? 1 : 0.4);
}
