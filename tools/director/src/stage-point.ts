import {
  computeLayout,
  computeStage,
  type Layout,
  type Stage,
  type Viewport,
  type ViewRole,
} from "@neon-spore/render";
import type { SimConfig } from "@neon-spore/sim";

/**
 * WHERE A CLICK ON THE DIRECTOR'S CANVAS ACTUALLY LANDS.
 *
 * The renderer does not draw into the whole canvas. `computeStage` cuts a
 * phone-shaped rectangle out of it — as wide as the columns and no wider —
 * centres it, and everything the players are meant to see is drawn inside
 * that (`packages/render/src/layout.ts`). The game already knows this: its
 * `inStage` subtracts the same offset before hit-testing, and its layout comes
 * from the stage rather than the window (`apps/game/src/viewport.ts`).
 *
 * The director did neither. Four files each turned a `PointerEvent` into
 * canvas coordinates with the same three lines and handed them to a layout
 * built from the *canvas*, so every control was answered to the left of where
 * it was drawn, by a layout that also thought it was bigger than it was. At
 * the sizes the panel actually takes, the first lobe is drawn near x=93 with a
 * radius of 17 and answered near x=61 with a ring of 28 — the two graze, which
 * is why a click on a button worked some of the time and not the rest, and why
 * it changed with the height of the window.
 *
 * So the conversion is written once, here, and the four listeners call it. It
 * is the same rule CLAUDE.md states about `mapCol`: a hand-written second copy
 * of where something lands will drift, and this one had drifted before it was
 * ever written down.
 *
 * `rect` is read per event rather than cached because the panel is resizable
 * and the role switches under it; the scale factor it produces also absorbs
 * the case the owner suspected — a canvas whose CSS box is not the size the
 * renderer was told about, which is what browser zoom and a stale
 * `ResizeObserver` both look like from in here.
 */
export interface StagePoint {
  /** A pointer event, in the coordinates the renderer drew in. */
  at: (e: { clientX: number; clientY: number }) => { x: number; y: number };
}

export function stagePoint(
  canvas: HTMLCanvasElement,
  viewport: () => Viewport,
  stage: () => Stage,
): StagePoint["at"] {
  return (e) => {
    const rect = canvas.getBoundingClientRect();
    const v = viewport();
    const s = stage();
    // CSS pixels the canvas occupies, back into the pixels it was laid out in.
    const kx = rect.width > 0 ? v.width / rect.width : 1;
    const ky = rect.height > 0 ? v.height / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * kx - s.left,
      y: (e.clientY - rect.top) * ky - s.top,
    };
  };
}

/**
 * Everything about where things are on a stage canvas, in one call.
 *
 * It measures the canvas and keeps that size — the `Viewport` the renderer is
 * told about — then derives the stage from it, the layout from the stage and
 * the pointer through both. That is the order `Canvas2DRenderer.draw` uses
 * before it puts down a single pixel, and it is a function rather than the
 * same fifteen lines in each host because there are two hosts (`stage.ts` and
 * `raster-field.ts`) and both of them had the fault above.
 *
 * `onResize` is handed the new size rather than the renderer being called
 * here: this file draws nothing and should not know that one exists.
 */
export interface StageGeometry extends StagePoint {
  /** The canvas, as last measured. */
  viewport: () => Viewport;
  stage: () => Stage;
  layout: () => Layout;
}

export function stageGeometry(
  canvas: HTMLCanvasElement,
  cfg: SimConfig,
  role: () => ViewRole,
  onResize: (viewport: Viewport) => void,
): StageGeometry {
  let viewport: Viewport = { width: 0, height: 0, dpr: 1 };
  const measure = (): void => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    viewport = {
      width: rect.width,
      height: rect.height,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    };
    onResize(viewport);
  };
  new ResizeObserver(measure).observe(canvas);
  measure();

  const stage = (): Stage => computeStage(viewport, cfg, role());
  const layout = (): Layout => {
    const s = stage();
    return computeLayout({ width: s.width, height: s.height, dpr: viewport.dpr }, cfg, role());
  };
  return { viewport: () => viewport, stage, layout, at: stagePoint(canvas, () => viewport, stage) };
}
