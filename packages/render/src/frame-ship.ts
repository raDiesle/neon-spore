import { hullPercent, type World } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawWaveOpening } from "./briefing.js";
import type { Effects } from "./effects.js";
import type { GuideStage } from "./guide-scene.js";
import { drawControlHover } from "./hover.js";
import { drawHud, drawOverlay } from "./hud.js";
import { drawHull, type HullMood, hullSkinY, type LobePositions } from "./hull.js";
import { frame } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import type { OpeningFx } from "./opening-fx.js";
import { drawOtherHand } from "./other-hand.js";
import { hullShake, torchTremor } from "./queen.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShipHand } from "./ship-hand.js";
import { drawCommsSiren } from "./siren.js";
import { drawTorchAlarm } from "./torch-alarm.js";

/**
 * **The two passes that are about the ship**: the hull with its controls, and
 * the overlays laid over a finished frame.
 *
 * `frame-field.ts` next door is the other half, and the note at the top of it
 * says why the cut is here. `frame-passes.ts` is still what a caller reaches
 * for.
 */

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
    (x) => !effects.rockImpact.coversCrater(x, l.tile),
    (col, beat) => effects.arrivals.has(col, beat),
    // Whose ship this is. Violet on player one's screen, amber on player two's
    // — the one thing on either screen that says which of the two it is without
    // being read (`seat-skin.ts`).
    seatSkin(view.role).hull,
    shake,
    f,
  );
  // A hand on the lance, read straight off the world both devices share (other-hand.ts).
  drawOtherHand(ctx, l, world, view.time, mood, at, f);
  // In front of the hull, unlike the rest of Effects.draw() — `Effects.rockImpact`.
  effects.rockImpact.draw(ctx, l, view.time, (x) => hullSkinY(l, view.time, mood, at, x, f));
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
  // Over the finished band: whichever control a desk's mouse is resting on.
  drawControlHover(ctx, l, view);
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
    pointer: view.pointer,
  });
}
