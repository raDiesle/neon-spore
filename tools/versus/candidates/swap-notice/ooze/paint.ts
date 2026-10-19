import { blobPath } from "../../../../../packages/content/src/shapes.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import {
  type SwapView,
  seatBefore,
  swapChangeProgress,
  swapWarnProgress,
} from "../../../../../packages/render/src/swap-look.js";
import type { ViewRole } from "../../../../../packages/render/src/view-role.js";
import type { World } from "../../../../../packages/sim/src/index.js";
import { beatFlash, hullRim } from "../kit.js";

/**
 * OOZE — the other seat's colour seeping in, and the old panel dissolving.
 *
 * The warning: a slime in the colour of the seat this screen is about to
 * become rises up the band from its floor, a beat at a time, with a skin that
 * ripples and bubbles in it, translucent so every button stays readable
 * through it. Its surface flares on each beat — the siren's pulse — and the
 * same colour creeps along the hull's rim from both ends toward the middle,
 * so the ship is visibly turning into the other one. The change: the old
 * panel breaks into a dozen soft cells that shrink away from the middle out,
 * while the slime drains back down.
 */

/** How long the old panel takes to dissolve, in beats. */
const MELT_BEATS = 1;
/** The slime's height at the change, as a share of the band. */
const FULL = 0.8;
/** The cells the old panel breaks into. */
const COLS = 6;
const ROWS = 2;

export function oozeAnnounce(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: SwapView,
): void {
  const before = seatBefore(l.role);
  if (before === null) return;
  const warn = swapWarnProgress(world, view.beatPhase);
  ctx.save();
  if (warn !== null) {
    // The seat this screen will be is the one it is not.
    slime(ctx, l, view, before, warn * FULL, beatFlash(view.beatPhase));
    creep(ctx, l, view, before, warn);
  }
  const t = swapChangeProgress(world, view.beatPhase, MELT_BEATS);
  if (t !== null) {
    melt(ctx, l, view, before, t);
    slime(ctx, l, view, l.role, (1 - smoothstep(t)) * FULL, 0);
  }
  ctx.restore();
}

/** The slime, `level` of the band deep, in a seat's colours. */
function slime(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: SwapView,
  seat: ViewRole,
  level: number,
  flash: number,
): void {
  if (level <= 0.01) return;
  const skin = seatSkin(seat);
  const bottom = l.bandTop + l.bandHeight;
  const top = bottom - level * l.bandHeight;
  const amp = l.tile * 0.12;
  const surface = (x: number) =>
    top +
    amp * Math.sin(x / (l.tile * 1.3) + view.time * 2.2) +
    amp * 0.6 * Math.sin(x / (l.tile * 0.55) - view.time * 3.1);
  const step = l.width / 40;
  const body = new Path2D();
  const edge = new Path2D();
  for (let x = 0; x <= l.width + 0.5; x += step) {
    const y = surface(x);
    if (x === 0) {
      body.moveTo(x, y);
      edge.moveTo(x, y);
    } else {
      body.lineTo(x, y);
      edge.lineTo(x, y);
    }
  }
  body.lineTo(l.width, bottom);
  body.lineTo(0, bottom);
  body.closePath();
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, rgba(skin.hull.body[0], 0.34 + 0.16 * flash));
  g.addColorStop(1, rgba(skin.hull.body[2], 0.14));
  ctx.fillStyle = g;
  ctx.fill(body);
  // Bubbles rising through it, each on its own column and its own clock.
  ctx.save();
  ctx.clip(body);
  for (let i = 0; i < 9; i++) {
    const x = ((i * 0.618 + 0.07) % 1) * l.width;
    const rise = (view.time * (0.35 + (i % 3) * 0.12) + i * 0.37) % 1;
    const y = bottom - rise * l.bandHeight;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * (0.06 + (i % 4) * 0.025), 0, Math.PI * 2);
    ctx.strokeStyle = rgba(skin.hull.edge, 0.45);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
  strokeGlow(ctx, edge, skin.hull.rim, 1.8, 1 + 1.5 * flash, 0.55 + 0.45 * flash);
}

/** The incoming colour creeping along the hull's rim from both ends. */
function creep(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: SwapView,
  seat: ViewRole,
  warn: number,
): void {
  if (!view.surfaceY) return;
  const reach = 0.5 * smoothstep(warn);
  const rim = seatSkin(seat).hull.rim;
  const flash = beatFlash(view.beatPhase);
  for (const [a, b] of [
    [0, reach],
    [1 - reach, 1],
  ] as const) {
    if (b - a < 0.01) continue;
    strokeGlow(ctx, hullRim(l, view.surfaceY, a, b), rim, 3, 1.5 + flash, 0.6 + 0.4 * flash);
  }
}

/**
 * The old panel, drawn again inside a grid of soft cells that shrink to
 * nothing — the middle ones first, the corners last — each one wobbling as it
 * goes, so the panel comes apart like a living thing rather than a slide.
 */
function melt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: SwapView,
  before: ViewRole,
  t: number,
): void {
  const cw = l.width / COLS;
  const ch = l.bandHeight / ROWS;
  const cells = new Path2D();
  const rims: Path2D[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = (c + 0.5) * cw;
      const cy = l.bandTop + (r + 0.5) * ch;
      const off = Math.abs(c - (COLS - 1) / 2) / ((COLS - 1) / 2);
      const k = smoothstep(Math.min(1, Math.max(0, (t - off * 0.35) / 0.65)));
      const grow = 0.62 * (1 - k);
      if (grow <= 0.02) continue;
      const blob = new Path2D(
        blobPath(
          cx,
          cy,
          cw * grow,
          ch * grow * 1.1,
          5,
          0.12 + 0.2 * k,
          0.1,
          view.time * 3,
          c * 7 + r * 3,
        ),
      );
      cells.addPath(blob);
      rims.push(blob);
    }
  }
  ctx.save();
  ctx.clip(cells);
  view.bandAs(before);
  ctx.restore();
  // A faint edge on each cell, kept inside the band, so the pieces read as
  // soft bodies rather than as a tangle of lines.
  const rim = seatSkin(before).hull.rim;
  ctx.save();
  const band = new Path2D();
  band.rect(0, l.bandTop, l.width, l.bandHeight);
  ctx.clip(band);
  for (const blob of rims) strokeGlow(ctx, blob, rim, 1, 0.6, 0.35);
  ctx.restore();
}
