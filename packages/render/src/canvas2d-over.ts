import type { World } from "@neon-spore/sim";
import { bandControlSet } from "./band.js";
import type { BossCue } from "./boss-cue-shape.js";
import { drawFireButtonMarks } from "./fire-button-mark.js";
import type { Layout } from "./layout.js";
import type { RenderState } from "./render-state.js";
import type { ViewState } from "./renderer.js";

/**
 * **What goes over the finished band and HUD**, last in a field frame. Cut out
 * of `canvas2d.ts` at its line limit, when the fire button's mark joined the
 * list (`fire-button-mark.ts`): every pass here stands on a button or on the
 * whole screen, and the drawing file keeps the order of the field.
 *
 * `cue` is the one the field drew this frame (`drawFieldBossCue`), so the
 * mark round the button is the mark on the target and never a second reading.
 */
export function drawOverBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  held: RenderState,
  cue: BossCue | null,
): void {
  // The fire button the shot's mark asks for, ringed with the same mark.
  if (cue !== null) drawFireButtonMarks(ctx, l, world, cue, view.time, view.controls);
  // Over the ship too, because it is about the ship: a lure shot by mistake (`lure-blast.ts`).
  held.lureBlast.draw(ctx, l);
  // And THE STARE's catch, on the button the caught seat pressed
  // (`stare-fx.ts`). The panel is `bandControlSet`'s answer rather than a
  // second reading of `world.wave`, so the circle it lights is one of the
  // circles the band actually drew.
  held.effects.boss.stare.drawCaught(ctx, l, view.role, bandControlSet(view.controls, world));
  held.lanceFlash.draw(ctx, l);
  // Last, over everything: the wave arriving, once the pair has crossed the
  // gate — there is no opening left to draw it inside (`opening-fx.ts`).
  if (held.effects.opening.launching) {
    held.effects.opening.drawLaunch(ctx, l.width, l.height, l.playHeight * 0.4);
  }
}
