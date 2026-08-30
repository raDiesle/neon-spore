import { hullPercent, type World } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBoss } from "./boss-draw.js";
import { drawWaveOpening } from "./briefing.js";
import { drawBullets } from "./bullets.js";
import { drawCreatures } from "./creatures.js";
import type { Effects } from "./effects.js";
import { drawBackground, drawGrid, drawRadar } from "./field.js";
import { drawGrips } from "./grip.js";
import { drawHud, drawOverlay } from "./hud.js";
import { drawHull, type HullMood, hullSkinY, type LobePositions } from "./hull.js";
import { drawLanceMark } from "./lance.js";
import type { Layout } from "./layout.js";
import { drawLureAlarms } from "./lure-alarm.js";
import { drawOtherHand } from "./other-hand.js";
import { PALETTE } from "./palette.js";
import { drawPods } from "./pods.js";
import { hullShake, torchTremor } from "./queen.js";
import type { ViewState } from "./renderer.js";
import { drawShellDamage } from "./shell-draw.js";
import { drawTorchAlarm } from "./torch-alarm.js";

/**
 * The four passes `Canvas2DRenderer.draw` assembles a frame from, in the
 * order a reader looks for them: the field's back, the bodies on it, the
 * ship and its controls, and the overlays on top of a finished frame. Every
 * call here is one this file's caller used to make directly — the split
 * moves lines, not behaviour, so nothing about what is drawn or when may
 * change without also changing `packages/render/test/frame.test.ts`.
 */

/** The empty field: fill, backdrop, radar and the grid the columns sit on. */
export function drawFieldBack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  flash: number,
): void {
  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);
  drawBackground(ctx, l, world.wave, view.time);
  drawRadar(ctx, l, world, view.time);
  drawGrid(ctx, l, world.cannonCol, flash, view.beatPhase);
}

/** Everything that lives on the field between the two hulls. */
export function drawBodies(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  effects: Effects,
): void {
  // Under the creatures: the mark is on the column, not on anything in it.
  drawLanceMark(ctx, l, world);
  drawCreatures(ctx, l, world, view.beatPhase, view.time, effects.blocked);
  // Over the same bodies drawCreatures just drew, and nowhere else: the
  // missing-piece wound recomputes fresh from world.creatures every frame
  // (see shell-draw.ts), so it belongs beside the pass that owns bodies, not
  // inside Effects with the transients.
  drawShellDamage(ctx, l, world, view.beatPhase, view.time);
  // Player 2's alarm, over the body it is about and on that device only. It is
  // the single difference between the two screens in this whole pass, and it
  // is drawn after the bodies rather than as part of them so that nothing in
  // `drawCreatures` ever has to know which seat it is running on.
  drawLureAlarms(ctx, l, world, view.beatPhase);
  // Over the creatures, under everything the ship does: a hand on something
  // is not an effect this file owns — it is world state, read fresh.
  drawGrips(ctx, l, world, view.beatPhase, view.time);
  drawBoss(ctx, l, view, effects);
  drawPods(ctx, l, world.pods, view.time);
  drawBullets(ctx, l, world.bullets);
  effects.draw(ctx);
}

/** The player's own hull, its controls, and the transients glued to them. */
export function drawShip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  effects: Effects,
  mood: HullMood,
  at: LobePositions,
): void {
  // Queen boss only: the ship's own render-only echo of her torch tremor
  // (queen.ts's `hullShake`); undefined everywhere else, so `drawHull` falls
  // back to its own no-shake default.
  const shake =
    world.boss?.kind === "queen"
      ? hullShake(torchTremor(l.tile, world.boss, world.beat, view.time))
      : undefined;
  drawHull(
    ctx,
    l,
    world.scars,
    view.time,
    mood,
    hullPercent(world),
    at,
    (x) => !effects.rockCoversCrater(x, l.tile),
    (col, beat) => effects.hasArrived(col, beat),
    undefined,
    shake,
  );
  // A hand on the lance, read straight off the world both devices share (other-hand.ts).
  drawOtherHand(ctx, l, world, view.time, mood, at);
  // In front of the hull, unlike the rest of Effects.draw() — see Effects.drawRockImpact.
  effects.drawRockImpact(ctx, l, view.time, (x) => hullSkinY(l, view.time, mood, at, x));
  effects.drawBanner(ctx, l);
  if (world.boss?.kind === "mirror") {
    effects.mirror.draw(ctx, l, world.cfg, world.boss, world.beat, view.beatPhase);
  }
}

/** What sits on top of a finished frame: HUD, alarms and the wave's opening. */
export function drawOverlays(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  isArmed: boolean,
  isOpen: boolean,
): void {
  drawHud(ctx, l, view);
  drawTorchAlarm(ctx, l, world, view.time);
  drawBand(ctx, l, world, isArmed, isOpen, view.controls);
  drawOverlay(ctx, l, view);
  // Over the pause overlay and everything else: while a wave's introduction or
  // its guide is up the world is not ticking, so nothing under it is doing
  // anything worth seeing.
  drawWaveOpening(ctx, l, world, view.role);
}
