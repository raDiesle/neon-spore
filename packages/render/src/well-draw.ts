import {
  bodyCenterCol,
  bulletShown,
  hullRow,
  isBossBody,
  recoilTurn,
  type World,
} from "@neon-spore/sim";
import { bodyDraw } from "./creature-body.js";
import { byDepth, depthScale, drawnCol, drawnRow, glidePhase, nearness } from "./depth.js";
import type { Effects } from "./effects.js";
import { drawBackground } from "./field.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { blipColor, radarBlips } from "./radar-blip.js";
import type { ViewState } from "./renderer.js";
import {
  WELL_BODY,
  wellAngle,
  wellAt,
  wellFall,
  wellPlace,
  wellRim,
  wellSectorAngle,
} from "./well.js";
import { drawWellFace } from "./well-face.js";

/**
 * THE WELL's board and the bodies on it, in place of the flat field's two
 * field passes. The ship at the middle is `well-ship.ts`, cut off when this
 * file reached its length limit along the seam `frame-field.ts` and
 * `frame-ship.ts` already draw.
 *
 * They are called from exactly where the flat passes are (`frame-field.ts`,
 * `frame-ship.ts`), so the frame's order, the pose's easing, the band, the HUD
 * and the wave's opening are all untouched: what this file replaces is *where
 * things are*, which is the whole boss (`well.ts`).
 *
 * **Nothing here computes gameplay.** Every number comes off the world the flat
 * passes read — the same `drawnRow` glide, the same `depthScale`, the same
 * `bodyDraw` table, the same `bulletShown` — so a body drawn here is the body
 * the other seat is being drawn on a straight grid, in the same place in its
 * fall. A second answer to any of those would be a well that disagreed with
 * the field it is a picture of.
 *
 * **What it does not draw yet**, and each one is in `docs/queue.md`: the
 * transients (a spark, a crater, a scar, a grip's ring), a crossing rock's
 * blip, and the two hit tests that would let the ship's own lobes be grabbed
 * where they are drawn — until those land, the pilot's field answers no finger
 * at all on a well wave and the rails do everything (`touch.ts`).
 */

/** How far a body is allowed to be drawn outside the rim, in rows, before the
 * well stops drawing it: an arrival glides in from above row nought and would
 * otherwise be placed *outside* its own clock. */
const ABOVE_RIM = 0;

/** The board: the backdrop, the face, and what is about to come over the rim. */
export function drawWellBack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  flash: number,
): void {
  drawBackground(ctx, l, world.wave, view.time);
  drawWellFace(ctx, l, flash);
  drawWellArrivals(ctx, l, world, view.time);
}

/**
 * The warning strip, bent into a ring outside the rim.
 *
 * It is the same walk, the same gate and the same colours the flat strip uses
 * (`radar-blip.ts`): a mark in the lane the thing is coming down, growing and
 * brightening as it nears. What it cannot carry is the strip's own second axis
 * — height for *how soon* — because outside the rim there is nowhere to put it,
 * so the size and the alpha the walk already computes do all of the telling.
 *
 * A crossing rock is skipped rather than placed: it has no column at all, and
 * the flat blip for one is drawn *inside* the field against the wall it comes
 * over, which is a picture the circle has no equivalent for yet.
 */
function drawWellArrivals(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const rim = wellRim(l);
  const pulse = 0.75 + 0.25 * Math.sin(time * 6);
  for (const blip of radarBlips(l, world)) {
    if (blip.cross !== undefined) continue;
    const a = wellAngle(l, bodyCenterCol(blip.entry, blip.entry.col));
    const tip = wellAt(l, a, rim + blip.s * 0.4);
    const back = wellAt(l, a, rim + blip.s * 1.6);
    const side = wellAt(l, a + wellSectorAngle(l) * 0.22 * blip.span, rim + blip.s * 1.3);
    const other = wellAt(l, a - wellSectorAngle(l) * 0.22 * blip.span, rim + blip.s * 1.3);
    ctx.globalAlpha = blip.alpha * pulse;
    ctx.fillStyle = blipColor(blip.entry);
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(side.x, side.y);
    ctx.lineTo(back.x, back.y);
    ctx.lineTo(other.x, other.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Every body on the field, placed in its lane and **turned to face the ship**.
 *
 * The turn is the one thing here that is not the flat field's: a canvas rotated
 * by the lane's own angle sends a body's underside toward the centre
 * (`wellFall`), so a slick comes in nose-first down its hour instead of
 * sliding sideways across a dial. Its size is `WELL_BODY` against the flat
 * footprint — a sector at the hub is the narrowest lane there is — times the
 * depth the field already gives its row, so a body still grows as it arrives.
 *
 * The kinds skipped are the ones the flat pass skips for reasons that hold here
 * twice over: a boss body, a tether, a hub, a worm and a wall are none of them
 * a thing standing on one tile, and a well wave carries none of them.
 */
export function drawWellBodies(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  effects: Effects,
): void {
  const beats = world.beat + view.beatPhase;
  const deepest = hullRow(world.cfg);
  for (const c of byDepth(world.creatures, view.beatPhase)) {
    if (isBossBody(c.kind) || c.kind === "tether") continue;
    if (c.kind === "gyre" || c.kind === "crawler" || c.kind === "fence") continue;
    const glide = glidePhase(world.cfg, world.beat, c, view.beatPhase);
    const row = Math.min(deepest, Math.max(ABOVE_RIM, drawnRow(c, glide)));
    const col = drawnCol(c, glide);
    const at = wellPlace(l, bodyCenterCol(c, col), row);
    const k = WELL_BODY * depthScale(world.cfg, l, row);
    ctx.save();
    ctx.translate(at.x, at.y);
    ctx.rotate(wellFall(l, col));
    ctx.scale(k, k);
    ctx.translate(-at.x, -at.y);
    bodyDraw(c.kind)({
      ctx,
      l,
      world,
      c,
      x: at.x,
      y: at.y,
      time: view.time,
      beats,
      beatPhase: view.beatPhase,
      near: nearness(l, row),
      blocked: effects.blocked,
      turn: recoilTurn(c, view.beatPhase),
    });
    ctx.restore();
  }
  drawWellBolts(ctx, l, world);
  // And the one transient a well wave can throw: the burst a kill leaves, in
  // the lane it was killed in. It is ingested with the well in mind so the
  // particles are already in the right place (`effects.ts`), and it is the only
  // member of `Effects` drawn here — the rest are placed off a flat field and
  // are queued with the two hit tests.
  effects.sparks.draw(ctx);
}

/**
 * The shots, climbing their lanes outward.
 *
 * A bolt leaves the ship at the centre and runs for the rim, so its tail hangs
 * *behind* it down the lane rather than below it — which is the flat tail's own
 * rule (`bullets.ts`: back to the tile centre it left) read in the only
 * direction this picture has. The colour is `bulletShown`, never `b.color`, so
 * a bolt under THE CODEX is drawn as the colour the thumb pressed here exactly
 * as it is there.
 */
function drawWellBolts(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  for (const b of world.bullets) {
    const hex = bulletShown(b) === "red" ? PALETTE.red : PALETTE.cyan;
    const frac = b.subMilli / 1000;
    const col = b.col + b.driftMilli / 1000;
    const head = wellPlace(l, col, b.row - frac);
    const tail = wellPlace(l, col, b.row);
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = hex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);
    ctx.lineTo(head.x, head.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    halo(ctx, head.x, head.y, l.tile * 0.3, hex, 0.85);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(head.x, head.y, l.tile * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
}
