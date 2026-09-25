import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import { drawStreams } from "../../../../../packages/render/src/slow-intake-streams.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";

/** The shortest window the rails are drawn on, in beats — the shipped fuse's. */
const MIN_BEATS = 5;

/** How thick a rail is, how far its glow reaches into the field, and the
 * spark at its burning tip, in tiles. */
const THICK = 0.12;
const GLOW = 0.45;
const SPARK = 0.45;

/** Beats left at which the rails turn red — the shipped fuse's figure. */
const URGENT = 2;

/**
 * **RAILS — both side edges of the screen, burning down to the hull.** Two
 * lines up the left and right edges of the field, from the hull to the top of
 * the screen, that burn from the top down and reach the hull on the beat the
 * step fails. The whole field is framed by the time left, and the last of it
 * lands where the damage will — on the ship — rather than in the chrome at
 * the top, which the seat pill covers.
 *
 * How it can lose: two measures at the two edges of a phone are two places
 * to look, and a thumb at the side of the screen covers one of them.
 */
export const railsWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const at = aim(world, l, world.beat, view.beatPhase);
  const up = ramp(win, world.cfg);
  if (up > 0) drawStreams(ctx, l, at, up, win.through);
  if (win.beats < MIN_BEATS || win.left <= 0) return;

  const rest = win.left / win.beats;
  const floor = l.hullY;
  const tip = floor * (1 - rest);
  const thick = l.tile * THICK;
  const urgent = win.left <= URGENT;
  const body = urgent ? PALETTE.red : PALETTE.hull;
  const core = urgent ? PALETTE.redRim : PALETTE.hullRim;

  ctx.save();
  for (const side of [-1, 1] as const) {
    // The edge of the screen and the direction into the field from it.
    const edge = side < 0 ? 0 : l.width;
    const inward = -side;
    const glow = ctx.createLinearGradient(edge, 0, edge + inward * l.tile * GLOW, 0);
    glow.addColorStop(0, rgba(body, 0.35));
    glow.addColorStop(1, rgba(body, 0));
    ctx.fillStyle = glow;
    const gx = side < 0 ? 0 : l.width - l.tile * GLOW;
    ctx.fillRect(gx, tip, l.tile * GLOW, floor - tip);

    const rx = side < 0 ? 0 : l.width - thick;
    ctx.fillStyle = rgba(body, 0.9);
    ctx.fillRect(rx, tip, thick, floor - tip);
    ctx.fillStyle = rgba(core, 0.95);
    ctx.fillRect(side < 0 ? 0 : l.width - thick / 2, tip, thick / 2, floor - tip);

    const r = l.tile * SPARK;
    const sx = edge + (inward * thick) / 2;
    const spark = ctx.createRadialGradient(sx, tip, 0, sx, tip, r);
    spark.addColorStop(0, rgba(core, 0.9));
    spark.addColorStop(0.35, rgba(body, 0.45));
    spark.addColorStop(1, rgba(body, 0));
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = spark;
    ctx.fillRect(sx - r, tip - r, r * 2, r * 2);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
};
