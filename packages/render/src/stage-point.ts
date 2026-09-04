import type { Stage } from "./layout.js";
import type { Viewport } from "./renderer.js";

/**
 * WHERE A POINTER ON THE CANVAS ACTUALLY LANDS.
 *
 * The renderer does not draw into the whole canvas. `computeStage` cuts a
 * phone-shaped rectangle out of it — as wide as the columns and no wider —
 * centres it, and everything the players are meant to see is drawn inside
 * that. Two numbers stand between a `clientX` and the coordinates that picture
 * was drawn in: where the canvas itself starts on the screen, and whether the
 * box it occupies is the size the renderer was told about.
 *
 * The director wrote that conversion by hand in four listeners and every one
 * of them was wrong: each control was answered to the left of where it was
 * drawn, by a layout that also thought it was bigger than it was. The game got
 * away with `e.clientX - stage.left` for as long as its canvas covered the
 * window exactly — nothing said so, and nothing failed when it stopped being
 * true. So the rule is written once, here, and both hosts call it: a
 * hand-written second copy of where something lands will drift, which is the
 * same thing CLAUDE.md says about `mapCol`.
 */

/** The canvas's box on the screen, as `getBoundingClientRect` gives it. */
export interface CanvasBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * A pointer event, in the coordinates the renderer drew in.
 *
 * `box` is read per event by both callers rather than cached: a panel is
 * resized, a phone's address bar slides away, and a stale rectangle sends a
 * touch to the wrong column. The scale it produces also absorbs a canvas whose
 * CSS box is not the size the renderer was given, which is what browser zoom
 * and a `ResizeObserver` that has not caught up both look like from in here.
 */
export function pointOnStage(
  client: { clientX: number; clientY: number },
  box: CanvasBox,
  viewport: Viewport,
  stage: Stage,
): { x: number; y: number } {
  // CSS pixels the canvas occupies, back into the pixels it was laid out in.
  const kx = box.width > 0 ? viewport.width / box.width : 1;
  const ky = box.height > 0 ? viewport.height / box.height : 1;
  return {
    x: (client.clientX - box.left) * kx - stage.left,
    y: (client.clientY - box.top) * ky - stage.top,
  };
}
