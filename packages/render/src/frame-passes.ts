import { hullPercent, type World } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBoss } from "./boss-draw.js";
import { drawWaveOpening } from "./briefing.js";
import { drawBullets } from "./bullets.js";
import { drawCreatures } from "./creatures.js";
import { drawDartGuides } from "./dart-path.js";
import { drawDartQueries } from "./dart-query.js";
import type { Effects } from "./effects.js";
import { drawBackground, drawGrid, drawRadar } from "./field.js";
import { drawGhostRows } from "./ghost-row.js";
import { drawGhostTrails } from "./ghost-trail.js";
import { drawGrips } from "./grip.js";
import type { GuideStage } from "./guide-scene.js";
import { drawGyres } from "./gyre.js";
import { drawGyreWind } from "./gyre-wind.js";
import { drawHud, drawOverlay } from "./hud.js";
import { drawHull, type HullMood, hullSkinY, type LobePositions } from "./hull.js";
import { frame } from "./hull-frame.js";
import { drawLanceMark } from "./lance.js";
import type { Layout } from "./layout.js";
import { drawLureAlarms } from "./lure-alarm.js";
import type { OpeningFx } from "./opening-fx.js";
import { drawOtherHand } from "./other-hand.js";
import { drawPods } from "./pods.js";
import { hullShake, torchTremor } from "./queen.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShellArmour } from "./shell-draw.js";
import { drawShipHand } from "./ship-hand.js";
import { drawCommsSiren } from "./siren.js";
import { drawTorchAlarm } from "./torch-alarm.js";
import { drawVeilMarks } from "./veil-marks.js";

/**
 * The four passes `Canvas2DRenderer.draw` assembles a frame from, in the
 * order a reader looks for them: the field's back, the bodies on it, the
 * ship and its controls, and the overlays on top of a finished frame. Every
 * call here is one this file's caller used to make directly — the split
 * moves lines, not behaviour, so nothing about what is drawn or when may
 * change without also changing `packages/render/test/frame.test.ts`.
 */

/**
 * The empty field: fill, backdrop, radar and the grid the columns sit on.
 *
 * `grid` is `Effects.coordGrid.shown` — how far up the lettered lattice is.
 * It is threaded through rather than read here, because it is a fade and this
 * file draws, it does not remember (`coord-grid.ts`).
 */
export function drawFieldBack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  flash: number,
  grid: number,
): void {
  // No flat fill here: drawBackground's radial gradient is opaque over the
  // same rect, so a fill under it never reaches the screen (canvas2d.ts's
  // own viewport fill covers the letterbox this pass does not reach).
  drawBackground(ctx, l, world.wave, view.time);
  drawRadar(ctx, l, world, view.time);
  drawGrid(ctx, l, world.cannonCol, flash, view.beatPhase, grid);
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
  // The wind between every wheel and the mouth, under everything: it is the
  // one picture in the pass that must never cross in front of a colour, and
  // it reaches from the middle of the field down to the hull (`gyre-wind.ts`).
  drawGyreWind(ctx, l, world, view.beatPhase, view.time);
  // Then the wheels themselves, in one pass and behind their own bodies —
  // an armature five rows tall cannot take its turn inside a loop that
  // sorts body by body (`gyre.ts`).
  drawGyres(ctx, l, world, view.beatPhase, view.time);
  // Where a ghost has just been, under every body on the field: a stamp drawn
  // over the slick in the next column would read as a body in front of it.
  drawGhostTrails(ctx, l, world, effects.ghostTrail, view.beatPhase, view.time);
  drawCreatures(ctx, l, world, view.beatPhase, view.time, effects.blocked);
  // Over the same bodies drawCreatures just drew, and nowhere else: the
  // plating recomputes fresh from world.creatures every frame (see
  // shell-draw.ts), so it belongs beside the pass that owns bodies, not
  // inside Effects with the transients.
  drawShellArmour(ctx, l, world, view.beatPhase, view.time);
  // Player 2's alarm, over the body it is about and on that device only. It is
  // the single difference between the two screens in this whole pass, and it
  // is drawn after the bodies rather than as part of them so that nothing in
  // `drawCreatures` ever has to know which seat it is running on.
  drawLureAlarms(ctx, l, world, view.beatPhase, view.time, view.bare);
  // Player 2's other half-picture, on the same terms and for the same reason:
  // the arrow, the dotted legs and the placeholder say where a dart is going
  // and where it goes after that, and player 1 — who holds the cannon that has
  // to be standing there — is shown none of it.
  drawDartGuides(ctx, l, world, view.beatPhase, view.time);
  // And the other half of that same creature, on the other device: two arrows
  // a target lock around the body, which is the pilot being told that this
  // column is not one they can read — only one they can be told.
  drawDartQueries(ctx, l, world, view.beatPhase, view.time);
  // The third half-picture, and the first that is *both* screens carrying one
  // each rather than one screen carrying something the other has not got: a
  // draining clock over every cloud on player 1's, a target lock on player
  // 2's. `veil-marks.ts` owns which is which, so nothing in `drawCreatures`
  // has to know what seat it is running on.
  drawVeilMarks(ctx, l, world, view.beatPhase, view.time);
  // And the fourth, which is the only one that stands in for a body rather
  // than describing one: a band across the row a ghost is in, on the screen
  // that is not drawn the ghost. Under everything the ship does and over the
  // grid, so the pilot reads it as a row of the field.
  drawGhostRows(ctx, l, world, view.beatPhase, view.time);
  // Over the creatures, under everything the ship does: a hand on something
  // is not an effect this file owns — it is world state, read fresh.
  drawGrips(ctx, l, world, view.beatPhase, view.time);
  drawBoss(ctx, l, view, effects);
  drawPods(ctx, l, world.pods, view.time);
  drawBullets(ctx, l, world.bullets);
  // Last of the pass, and over every body in it. The world goes in for the
  // ward's bolts and the shell they take off a clasp: both are drawn around a
  // creature the world still holds, from the same `creatureCenter` the body
  // was — not from where the event happened to fire.
  effects.draw(ctx, l, world, view.beatPhase);
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
  // Built once for the whole ship pass: `drawHull`, `drawOtherHand` and the
  // rock-impact overlay below all sample the same breathing membrane this
  // tick, and `frame()` is not free — see hull-frame.ts.
  const f = frame(l, view.time, mood, at);
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
    // Whose ship this is. Violet on player one's screen, amber on player two's
    // — the one thing on either screen that says which of the two it is without
    // being read (`seat-skin.ts`).
    seatSkin(view.role).hull,
    shake,
    f,
  );
  // A hand on the lance, read straight off the world both devices share (other-hand.ts).
  drawOtherHand(ctx, l, world, view.time, mood, at, f);
  // In front of the hull, unlike the rest of Effects.draw() — see Effects.drawRockImpact.
  effects.drawRockImpact(ctx, l, view.time, (x) => hullSkinY(l, view.time, mood, at, x, f));
  effects.drawBanner(ctx, l);
  if (world.boss?.kind === "mirror") {
    effects.mirror.draw(ctx, l, world.cfg, world.boss, world.beat, view.beatPhase);
  }
  // Last of the ship pass and over all of it: a ring that says which swelling
  // this phone's own finger has hold of. It is drawn from the world's columns
  // rather than from `at`, because that is where the press was answered — a
  // ring that followed the eased lobe would drift off its own hit region
  // (`touch-ship.ts`).
  drawShipHand(ctx, l, world.cannonCol, world.shieldCol, view.hand, view.time);
}

/** The frame's two windows, and whatever the wave's opening needs drawing. */
export interface OverlayState {
  armed: boolean;
  open: boolean;
  /** A rehearsal the caller owns, on a host that has one. */
  scene?: GuideStage;
  /** The opening's own clock (`opening-fx.ts`). */
  fx?: OpeningFx;
}

/** What sits on top of a finished frame: HUD, alarms and the wave's opening. */
export function drawOverlays(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  state: OverlayState,
): void {
  const { armed: isArmed, open: isOpen, scene, fx } = state;
  drawHud(ctx, l, view);
  drawTorchAlarm(ctx, l, world, view.time);
  // Over the HUD and under the band: the one instrument that says *talk*, for
  // every creature that needs it. It is an overlay rather than part of the
  // field because it is about the pair rather than about anything standing in
  // a column (`siren.ts`).
  drawCommsSiren(ctx, l, world, view.time);
  drawBand(ctx, l, world, isArmed, isOpen, view.time, view.controls);
  drawOverlay(ctx, l, view);
  // Over the pause overlay and everything else: while a wave's introduction or
  // its guide is up the world is not ticking, so nothing under it is doing
  // anything worth seeing.
  drawWaveOpening(ctx, l, world, {
    role: view.role,
    scene,
    time: view.time,
    fx,
    names: view.names,
  });
}
