import { bakedCache } from "./baked.js";

/**
 * **The two scratch canvases a glancing part is laid down on**
 * (`glance-layer.ts`): the part drawn, and its two halves put together. One
 * pair serves every part, since parts are drawn one after another, and each
 * is wiped before it is drawn on.
 */

/**
 * The scratch canvases, held as baked work so whatever empties the sprite
 * caches empties them too: a test that swaps the stub canvas for Skia's
 * (`pixel-harness.ts`) must not be handed a stub's layer to blit, which is
 * what THE INSTAR's pixel test was handed once its head was laid down here.
 */
const SCRATCH = bakedCache<"part" | "halves", HTMLCanvasElement>();

/**
 * Pixels wiped past the box's far edges as well as inside it. A half is drawn
 * from the layer through a squeeze, and the filter reads a pixel past the
 * box's edge — which on a scratch canvas held over from a bigger part was that
 * part's, and came through as a faint dash or a doubled outline beside the
 * body being drawn (THE WELL, THE CRYSTAL, 15 October 2026). The near edges
 * are the canvas's own, and read nothing.
 */
const EDGE = 2;

/** A scratch canvas, at least `w` by `h`: the part drawn, or its two halves put together. */
export function layerOf(which: "part" | "halves", w: number, h: number): HTMLCanvasElement {
  let scratch = SCRATCH.get(which);
  if (scratch === undefined) {
    scratch = document.createElement("canvas");
    // Drawn into every frame, so a frame's cost is in it: the test stub counts
    // a `layer:` canvas's ops as the screen's (`test/canvas-stub-layer.ts`).
    scratch.id = `layer:glance-${which}`;
    SCRATCH.set(which, scratch);
  }
  if (scratch.width < w) scratch.width = w;
  if (scratch.height < h) scratch.height = h;
  return scratch;
}

/** `c` emptied over the box a part is drawn in, and as far past it as a filter reads; left untransformed. */
export function wipe(c: CanvasRenderingContext2D, box: { w: number; h: number }): void {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, box.w + EDGE, box.h + EDGE);
}
