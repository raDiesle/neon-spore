import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import {
  type SwapView,
  seatBefore,
  swapChangeProgress,
  swapWarnProgress,
} from "../../../../../packages/render/src/swap-look.js";
import type { World } from "../../../../../packages/sim/src/index.js";
import { swapWarning } from "../../../../../packages/sim/src/index.js";
import { beatFlash, hullRim } from "../kit.js";

/**
 * MOLT — two siren lamps on the band's shoulders, and a panel that sheds its
 * old skin.
 *
 * The warning: a lamp at each top corner of the band, a dark glass dome with
 * a red core and a beam that sweeps round it, faster as the change comes; the
 * band's lip and the hull's rim strobe red on every beat; a row of pips in the
 * middle of the lip goes out one a beat. The change: the old panel is drawn
 * again over the new and peels away from the top down, a curled bright edge
 * running across it like skin coming off a body that has grown out of it.
 */

/** How long the old skin takes to come off, in beats. */
const PEEL_BEATS = 0.8;

export function moltAnnounce(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: SwapView,
): void {
  const warn = swapWarnProgress(world, view.beatPhase);
  if (warn !== null) {
    ctx.save();
    alarm(ctx, l, world, view, warn);
    ctx.restore();
  }
  const t = swapChangeProgress(world, view.beatPhase, PEEL_BEATS);
  const before = seatBefore(l.role);
  if (t !== null && before !== null) {
    ctx.save();
    peel(ctx, l, view, before, t);
    ctx.restore();
  }
}

/** The lamps, the strobe and the pips. */
function alarm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: SwapView,
  warn: number,
): void {
  const flash = beatFlash(view.beatPhase);
  // The lip, strobing red on the beat.
  const lip = new Path2D();
  lip.moveTo(0, l.bandTop);
  lip.lineTo(l.width, l.bandTop);
  strokeGlow(ctx, lip, PALETTE.red, 3.5, 2, 0.4 + 0.6 * flash);
  // The hull's rim, strobing with it, brighter as the change comes.
  if (view.surfaceY) {
    strokeGlow(
      ctx,
      hullRim(l, view.surfaceY),
      PALETTE.red,
      3,
      1.5 + warn,
      (0.45 + 0.55 * warn) * (0.3 + 0.7 * flash),
    );
  }
  // Two lamps, on the band's shoulders.
  const r = l.tile * 0.7;
  const spin = view.time * (4 + 14 * warn);
  for (const [x, dir] of [
    [l.tile * 0.75, 1],
    [l.width - l.tile * 0.75, -1],
  ] as const) {
    lamp(ctx, x, l.bandTop, r, spin * dir, flash, warn);
  }
  // The pips: as many lit as beats are left.
  const left = swapWarning(world);
  const beats = Math.max(1, Math.round(world.cfg.swapWarnBeats));
  const gap = l.tile * 0.62;
  const y = l.bandTop + l.tile * 0.42;
  for (let i = 0; i < beats; i++) {
    const x = l.width / 2 + (i - (beats - 1) / 2) * gap;
    const lit = i < left;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * 0.17, 0, Math.PI * 2);
    ctx.fillStyle = lit ? PALETTE.red : rgba("#05040B", 0.85);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.red, lit ? 0.9 : 0.4);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    if (lit) halo(ctx, x, y, l.tile * 0.35, PALETTE.red, 0.3 + 0.5 * flash);
  }
}

/** One siren lamp: a dome on the lip, a core, and a beam turning round it. */
function lamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  flash: number,
  warn: number,
): void {
  // The beam first, under the glass: a wedge thrown from the core.
  const reach = r * (4 + 3 * warn);
  const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, reach);
  g.addColorStop(0, rgba(PALETTE.red, 0.8));
  g.addColorStop(1, rgba(PALETTE.red, 0));
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  for (const a of [angle, angle + Math.PI]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, reach, a - 0.3, a + 0.3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = prev;
  // The dome, half above the lip.
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = rgba("#1A0610", 0.92);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = PALETTE.red;
  ctx.fill();
  const dome = new Path2D();
  dome.arc(x, y, r, Math.PI, 0);
  strokeGlow(ctx, dome, PALETTE.red, 1.6, 1.2, 0.8);
  halo(ctx, x, y - r * 0.3, r * 2.6, PALETTE.red, 0.25 + 0.6 * flash);
}

/**
 * The old panel, drawn again and clipped to what has not come off yet: below
 * a front that runs from the lip to the floor, rippling as it goes, with the
 * curl of the peeled skin riding on it in the old seat's colour.
 */
function peel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: SwapView,
  before: "p1" | "p2" | "test",
  t: number,
): void {
  const k = smoothstep(t);
  const bottom = l.bandTop + l.bandHeight;
  const base = l.bandTop - l.tile * 0.4 + k * (l.bandHeight + l.tile * 0.8);
  const amp = l.tile * 0.35 * Math.sin(Math.PI * k);
  const front = (x: number) =>
    base +
    amp * Math.sin((x / l.width) * Math.PI * 3 + view.time * 6) +
    amp * 0.5 * Math.sin((x / l.width) * Math.PI * 7 - view.time * 4);
  const step = l.width / 32;
  const below = new Path2D();
  const edge = new Path2D();
  for (let x = 0; x <= l.width + 0.5; x += step) {
    const y = front(x);
    if (x === 0) {
      below.moveTo(x, y);
      edge.moveTo(x, y);
    } else {
      below.lineTo(x, y);
      edge.lineTo(x, y);
    }
  }
  below.lineTo(l.width, bottom + 2);
  below.lineTo(0, bottom + 2);
  below.closePath();
  ctx.save();
  ctx.clip(below);
  view.bandAs(before);
  ctx.restore();
  // The curl: a fat soft edge in the old skin's colour, with a shadow under it
  // where it is lifting off the new one.
  const old = seatSkin(before);
  ctx.save();
  ctx.translate(0, l.tile * 0.12);
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba("#000000", 0.45);
  ctx.lineWidth = l.tile * 0.28;
  ctx.stroke(edge);
  ctx.restore();
  ctx.lineCap = "round";
  ctx.strokeStyle = old.hull.body[1];
  ctx.lineWidth = l.tile * 0.2;
  ctx.stroke(edge);
  strokeGlow(ctx, edge, old.hull.rim, 1.6, 1.2);
  // And the new seat's rim catching the light where the old has just gone.
  ctx.save();
  ctx.translate(0, -l.tile * 0.16);
  strokeGlow(ctx, edge, seatSkin(l.role).hull.rim, 1.2, 1, 0.6 * (1 - k));
  ctx.restore();
}
