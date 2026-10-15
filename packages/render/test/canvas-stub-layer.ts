/**
 * **A scratch layer's ops counted as the frame's.** A glancing part is drawn
 * onto an offscreen canvas and laid on the screen as one `drawImage`
 * (`src/glance-layer.ts`), so the screen's own tally saw the blit and none of
 * the part's strokes, fills and gradients: THE FLEET's p1 `stroke` fell from
 * 87 to 59 the day its hulls began to turn, and colour tests had to hold the
 * boss still to read it at all.
 *
 * So a canvas whose `id` starts with `layer:` — the name `glance-layer.ts`
 * gives the two it draws through every frame — counts every op it takes
 * against the frame's context too: its tally, its log and its `calls`, the
 * way `new Path2D` already does. A sprite baked once and blitted after is not
 * named so, and stays off the frame's books, because a budget counts what a
 * frame costs and not what the first one paid.
 */

/** What the frame keeps that a layer's ops are written into. */
export interface LayerTarget {
  readonly tally: Map<string, number>;
  readonly log: string[] | undefined;
  calls: number;
}

/** The `id` prefix that makes an offscreen canvas part of the frame. */
export const LAYER_ID = "layer:";

let frame: LayerTarget | undefined;

/** Which context is the frame — `stubCanvas`'s to decide, as it decides the tally. */
export function setLayerFrame(f: LayerTarget | undefined): void {
  frame = f;
}

/** The frame a context's ops are counted against as well, if its canvas is a layer. */
export function layerFrame(canvas: unknown, self: LayerTarget): LayerTarget | undefined {
  if (frame === undefined || frame === self) return undefined;
  const id = (canvas as { id?: unknown }).id;
  return typeof id === "string" && id.startsWith(LAYER_ID) ? frame : undefined;
}
