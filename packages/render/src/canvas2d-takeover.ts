import { drawWaveOpening } from "./briefing.js";
import type { Layout, Stage } from "./layout.js";
import { openingKey } from "./opening-fx.js";
import type { RenderState } from "./render-state.js";
import type { ViewState } from "./renderer.js";
import { ROUND_DRAWS } from "./round-draw.js";

/**
 * **The two frames that are not the field**, and the clocks that run whether or
 * not one of them is up.
 *
 * A guide's rehearsal and a boss round have nothing in common except the thing
 * that matters to the caller: each takes the whole stage, and each means none
 * of the field passes below it may run. In `canvas2d.ts` they were two early
 * returns fifty lines apart with the frame's real work between them, and that
 * file was on its 250-line ceiling exactly — so the next pass anybody added
 * cost a comment somewhere else in it first.
 *
 * `true` means the frame is finished and the caller unwinds its clip. The order
 * inside is not free: the opening's own clock and the guide's are stepped
 * *before* either branch is tested, because the page number, the wave's name
 * dropping in and the blobs a READY throws are all read off them and none can
 * be read off a world holding still.
 */
export function drawTakeover(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  held: RenderState,
  stage: Stage,
): boolean {
  const { world } = view;
  // The wave's guide is carrying a rehearsal, and the two mini-screens in it
  // are the only thing on the stage worth a frame: the guide covers the
  // field with a scrim anyway, and drawing a field nobody can see behind two
  // that they can is the whole of what a second render per frame would cost.
  // The opening's own clock, whether or not a rehearsal is up: the page
  // number, the wave's name dropping in and the blobs a READY throws are all
  // read off it, and none of them can be read off a world holding still.
  held.effects.opening.update(view.dt, openingKey(world, view.role));
  held.guide.update(world, view.dt, view.role);
  if (held.guide.active) {
    // Nothing under it painted the ground, so this does. The guide's own
    // scrim is translucent, and translucent over nothing is the last frame.
    ctx.fillStyle = "#05040B";
    ctx.fillRect(0, 0, stage.width, stage.height);
    drawWaveOpening(ctx, l, world, {
      role: view.role,
      scene: held.guide,
      time: view.time,
      fx: held.effects.opening,
      names: view.names,
      pointer: view.pointer,
    });
    return true;
  }

  // A round takes the whole stage and this method ends here: the round's
  // first condition is that the field is *gone* (`gauge-round.ts`), and the
  // cheapest way to be sure of that is for none of the code below to run.
  // `ROUND_DRAWS` is the list and says why it is a list. Each draws the
  // wave's opening itself, last — without it the pair get a picture standing
  // still with nothing saying why.
  const round = ROUND_DRAWS[world.boss?.kind ?? ""];
  if (round !== undefined) {
    round(ctx, l, view);
    drawWaveOpening(ctx, l, world, {
      role: view.role,
      time: view.time,
      fx: held.effects.opening,
      names: view.names,
      pointer: view.pointer,
    });
    return true;
  }
  return false;
}
