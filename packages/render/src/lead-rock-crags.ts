import { faded, type RidgeWallsDraw } from "./lead-rock.js";
import { PALETTE } from "./palette.js";

/** How tall a crag stands over the ridge's top, and how wide its foot, in tiles. */
const RISE = 1.9;
const FOOT = 0.95;

/**
 * CRAGS — the walls the body turns at, stood on the ridge's two ends: a
 * crag of the same dark rock rising a tile over the top, its inner face
 * caught by the light, and a hook cut into that face curling back into the
 * field — the turn the body makes there. The ridge was a flat bar running
 * off the screen's edges, and the turn came out of nowhere: the wall it
 * turns at is now a thing the pair can point at. Both screens, because the
 * field's edge is no secret from either seat.
 */
export function paintCrags(d: RidgeWallsDraw): void {
  const { ctx, r, fade } = d;
  ctx.save();
  for (const side of [-1, 1] as const) {
    const edge = side < 0 ? r.left : r.right;
    const inward = -side;
    const t = r.tile;
    const crag = new Path2D();
    crag.moveTo(edge, r.bottom);
    crag.lineTo(edge, r.top - RISE * t);
    crag.quadraticCurveTo(
      edge + inward * FOOT * 0.3 * t,
      r.top - RISE * 1.08 * t,
      edge + inward * FOOT * 0.55 * t,
      r.top - RISE * 0.8 * t,
    );
    crag.lineTo(edge + inward * FOOT * 0.7 * t, r.top - RISE * 0.45 * t);
    crag.quadraticCurveTo(
      edge + inward * FOOT * t,
      r.top - 0.1 * t,
      edge + inward * FOOT * 1.4 * t,
      r.top,
    );
    crag.lineTo(edge + inward * FOOT * 1.4 * t, r.bottom);
    crag.closePath();
    ctx.fillStyle = faded(PALETTE.rockDark, fade);
    ctx.fill(crag);
    // The rock's own grey over the dark, so the crag stands off the sky.
    ctx.fillStyle = faded(PALETTE.rock, fade, 0.35);
    ctx.fill(crag);
    // The inner face, lit: the side the body walks into.
    const face = new Path2D();
    face.moveTo(edge + inward * FOOT * 0.55 * t, r.top - RISE * 0.8 * t);
    face.lineTo(edge + inward * FOOT * 0.7 * t, r.top - RISE * 0.45 * t);
    face.quadraticCurveTo(
      edge + inward * FOOT * t,
      r.top - 0.1 * t,
      edge + inward * FOOT * 1.4 * t,
      r.top,
    );
    ctx.strokeStyle = faded(PALETTE.rock, fade);
    ctx.lineWidth = t * 0.12;
    ctx.lineCap = "round";
    ctx.stroke(face);
    // The hook: down the face and curling back into the field.
    const hx = edge + inward * FOOT * 0.3 * t;
    const hook = new Path2D();
    hook.moveTo(hx, r.top - RISE * 0.75 * t);
    hook.lineTo(hx, r.top - RISE * 0.35 * t);
    hook.quadraticCurveTo(hx, r.top - 0.05 * t, hx + inward * 0.75 * t, r.top - 0.15 * t);
    hook.moveTo(hx + inward * 0.5 * t, r.top - 0.4 * t);
    hook.lineTo(hx + inward * 0.75 * t, r.top - 0.15 * t);
    hook.lineTo(hx + inward * 0.48 * t, r.top + 0.08 * t);
    ctx.strokeStyle = faded(PALETTE.sheenRim, fade, 0.85);
    ctx.lineWidth = t * 0.09;
    ctx.lineJoin = "round";
    ctx.stroke(hook);
  }
  ctx.restore();
}
