import { blobPath } from "../../../../../packages/content/src/shapes.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { Circle, Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import {
  type SwapView,
  seatBefore,
  swapChangeProgress,
  swapWarnProgress,
} from "../../../../../packages/render/src/swap-look.js";
import type { ViewRole } from "../../../../../packages/render/src/view-role.js";
import { swapWarning, type World } from "../../../../../packages/sim/src/index.js";

/**
 * THROB — every button with a heartbeat, two lamps on the hull, and the new
 * buttons budding out of the old.
 *
 * The warning: each round button on the band grows a ring that closes in on
 * it on the beat, red turning to the incoming seat's colour as the change
 * comes, and doubles to a *lub-dub* on the last two beats; two siren lamps
 * stand on the hull either side of the middle and flash in turn, wig-wag,
 * faster on the last two beats. The change: the old panel is drawn again
 * everywhere except inside a soft bud at each button, and the buds swell —
 * squirming as they go — until they have eaten the old panel whole, so every
 * control visibly turns into the one that has replaced it, from its own
 * middle out.
 */

/** How long the buds take to eat the old panel, in beats. */
const BUD_BEATS = 0.9;
/** Beats left at which the heartbeat and the wig-wag double. */
const HURRY = 2;

export function throbAnnounce(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: SwapView,
): void {
  const before = seatBefore(l.role);
  const warn = swapWarnProgress(world, view.beatPhase);
  ctx.save();
  if (warn !== null && before !== null) {
    const fast = swapWarning(world) <= HURRY;
    const colour = mixHex(PALETTE.red, seatSkin(before).hull.rim, warn);
    for (const c of view.lobes) heartbeat(ctx, c, view.beatPhase, fast, colour);
    wigwag(ctx, l, view, fast, warn);
  }
  const t = swapChangeProgress(world, view.beatPhase, BUD_BEATS);
  if (t !== null && before !== null) bud(ctx, l, view, before, t);
  ctx.restore();
}

/** A ring closing on a button, once a beat or twice. */
function heartbeat(
  ctx: CanvasRenderingContext2D,
  c: Circle,
  beatPhase: number,
  fast: boolean,
  colour: string,
): void {
  const phase = fast ? (beatPhase * 2) % 1 : beatPhase;
  const k = smoothstep(Math.min(1, phase * 1.6));
  const r = c.r * (1.9 - 0.75 * k);
  const ring = new Path2D();
  ring.arc(c.x, c.y, r, 0, Math.PI * 2);
  strokeGlow(ctx, ring, colour, 2.4, 1.6, 0.25 + 0.75 * k);
  // The button's own rim flushing on the hit.
  const rim = new Path2D();
  rim.arc(c.x, c.y, c.r * 1.04, 0, Math.PI * 2);
  strokeGlow(ctx, rim, colour, 1.6, 1.2, (1 - phase) ** 2);
}

/** Two lamps on the hull, flashing in turn. */
function wigwag(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: SwapView,
  fast: boolean,
  warn: number,
): void {
  if (!view.surfaceY) return;
  const mid = l.gridLeft + l.gridWidth / 2;
  const r = l.tile * 0.34;
  const turn = Math.floor(view.beatPhase * (fast ? 4 : 2)) % 2;
  const sides = [mid - l.gridWidth * 0.3, mid + l.gridWidth * 0.3];
  for (let i = 0; i < 2; i++) {
    const x = sides[i] ?? mid;
    const y = view.surfaceY(x) - r * 0.2;
    const on = i === turn;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = on ? PALETTE.red : rgba("#3A0A18", 0.95);
    ctx.fill();
    const dome = new Path2D();
    dome.arc(x, y, r, Math.PI, 0);
    strokeGlow(ctx, dome, PALETTE.red, 1.4, 1, on ? 1 : 0.4);
    if (on) halo(ctx, x, y - r * 0.4, r * (4 + 3 * warn), PALETTE.red, 0.5 + 0.4 * warn);
  }
}

/**
 * The old panel, everywhere but inside a bud at each button; the buds swell
 * from the buttons' middles until they cover the band, squirming as they go.
 */
function bud(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: SwapView,
  before: ViewRole,
  t: number,
): void {
  if (view.lobes.length === 0) return;
  const k = smoothstep(t);
  const far = Math.hypot(l.width, l.bandHeight) * 0.6;
  const outside = new Path2D();
  outside.rect(0, l.bandTop - 2, l.width, l.bandHeight + 4);
  const buds: Path2D[] = [];
  view.lobes.forEach((c, i) => {
    const r = c.r * 0.4 + (far - c.r * 0.4) * k ** 1.6;
    const blob = new Path2D(
      blobPath(
        c.x,
        c.y,
        r,
        r,
        6,
        0.1 + 0.25 * Math.sin(Math.PI * k),
        0.12,
        view.time * 4,
        i * 11 + 5,
      ),
    );
    outside.addPath(blob);
    buds.push(blob);
  });
  ctx.save();
  ctx.clip(outside, "evenodd");
  view.bandAs(before);
  ctx.restore();
  // Each bud's edge, in the new seat's colour, fading as it takes the band.
  const rim = seatSkin(l.role).hull.rim;
  ctx.save();
  const band = new Path2D();
  band.rect(0, l.bandTop, l.width, l.bandHeight);
  ctx.clip(band);
  for (const blob of buds) strokeGlow(ctx, blob, rim, 2, 1.4, 0.9 * (1 - k));
  ctx.restore();
}
