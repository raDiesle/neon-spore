import { bulletShown, isBossBody, recoilTurn, type World } from "@neon-spore/sim";
import { bodyDraw } from "./creature-body.js";
import { byDepth, depthScale, drawnCol, glidePhase, nearness } from "./depth.js";
import type { Effects } from "./effects.js";
import { drawBackground } from "./field.js";
import { halo } from "./glow.js";
import { drawGrips } from "./grip.js";
import type { Layout } from "./layout.js";
import { drawLockMarks } from "./lock-mark.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { WELL_BODY, wellFall, wellPlace } from "./well.js";
import { drawWellArrivals } from "./well-arrivals.js";
import { wellBodyAt } from "./well-body.js";
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
 * The warning ring outside the rim is `well-arrivals.ts`, cut off on the
 * same line limit when the crossing rock's mark joined it.
 *
 * **What it does not draw yet**, and it is in `docs/queue.md`: the transients
 * drawn *on the hull* — a crater, a scar, a deflected rock's tumble — which
 * are placed against a hull line the ring at the middle has not got
 * (`well-ship.ts`). Everything drawn *around a body* is drawn, since 13
 * September 2026, by the same calls the flat pass makes: `creatureCenter`
 * answers for this picture now (`creature-place.ts`).
 */

/** The board: the backdrop, the face, and what is about to come over the rim. */
export function drawWellBack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  flash: number,
): void {
  drawBackground(ctx, l, world.wave, view.time);
  drawWellFace(ctx, l, flash, view.time);
  drawWellArrivals(ctx, l, world, view.time);
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
  /** Where the cannon lobe is *drawn*, in fractional columns — the eased one,
   * for the lock's line back to it (`frame-field.ts` says why not
   * `world.cannonCol`). */
  cannonCol = world.cannonCol,
): void {
  const beats = world.beat + view.beatPhase;
  for (const c of byDepth(world.creatures, view.beatPhase)) {
    if (isBossBody(c.kind) || c.kind === "tether") continue;
    if (c.kind === "gyre" || c.kind === "crawler" || c.kind === "fence") continue;
    const glide = glidePhase(world.cfg, world.beat, c, view.beatPhase);
    const col = drawnCol(c, glide);
    const at = wellBodyAt(l, world.cfg, c, glide);
    const k = WELL_BODY * depthScale(world.cfg, l, at.row);
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
      near: nearness(l, at.row),
      blocked: effects.blocked,
      turn: recoilTurn(c, view.beatPhase),
    });
    ctx.restore();
  }
  // Over the bodies, in the flat pass's own order (`frame-field.ts`): the
  // hand on one and, over the hand, the frame that says the cannon has it.
  // Both place themselves by `creatureCenter`, which answers for this picture
  // — a ring round a body at its hour, at `WELL_BODY` of its flat size.
  drawGrips(ctx, l, world, view.beatPhase, view.time, view.names);
  drawLockMarks(ctx, l, world, cannonCol, view.beatPhase, view.time);
  drawWellBolts(ctx, l, world);
  // And the transients that were *placed* when their event arrived — every
  // spark the game throws, a kill's sprite — already in their lanes, because
  // `Effects.ingest` was told this screen is the well and put each pixel
  // through `wellFromFlat`. Then the ones drawn *around a creature the world
  // still holds* — a clasp's shell coming apart, a rind's shed skin, a coil's
  // charge — which find the body where this picture draws it, as above.
  //
  // What is not drawn here, and why, in two classes. The transients drawn
  // *on the hull* — a rock's last step and its crater (`rockImpact`), a
  // deflected rock's tumble — are placed against a hull line the ring at the
  // middle has not got (`well-ship.ts`). And the ones that belong to a body
  // no well wave carries — a worm's goo, a box's discharge, a salvo — would
  // be drawn for nothing.
  effects.sparks.draw(ctx);
  effects.spriteBursts.draw(ctx);
  effects.bodies.drawOnBodies(ctx, l, world, view.beatPhase, effects.recoilLeap);
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
