import {
  computeLayout,
  computeStage,
  type Layout,
  pointOnStage,
  type Renderer,
  type Stage,
  type ViewRole,
} from "@neon-spore/render";
import type { SimConfig } from "@neon-spore/sim";

/**
 * The window's size, and the two things every listener in the app asks of it:
 * the layout a frame is drawn against, and where a pointer landed on it.
 *
 * Input hit-tests against the same layout the renderer draws, so both are
 * derived the same way: from the stage rather than the window, and for
 * whichever role the view switch is showing. Cheap enough to compute per
 * event, which is why they are functions rather than a cached pair — the
 * screen changes size, the role changes, and a stale rectangle sends a touch
 * to the wrong column.
 *
 * The stage itself is no longer handed out. It was, and five listeners each
 * used it for the same three lines of arithmetic (`inStage` below).
 */
export interface Geometry {
  layout: () => Layout;
  /**
   * A pointer event in the coordinates the renderer drew in, or null when it
   * landed beside the picture — the game is drawn into a phone-shaped
   * rectangle, and a touch outside it belongs to nothing.
   *
   * Five listeners each wrote this out as `e.clientX - stage.left`, which is
   * right only while the canvas covers the window exactly and is the size the
   * renderer was told about. Nothing said so and nothing failed when it
   * stopped being true; the director had the same three lines in four files
   * and every one of them was wrong (`render/stage-point.ts`). So it is one
   * function now, and the canvas is measured at the moment of the event.
   */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
}

export function bindViewport(
  canvas: HTMLCanvasElement,
  renderer: Renderer,
  cfg: SimConfig,
  role: () => ViewRole,
): Geometry {
  let viewport = { width: 1, height: 1, dpr: 1 };

  const resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // A zero-sized viewport happens for real: a hidden tab, and on a phone the
    // moment the address bar animates. Sizing the canvas to it once would leave
    // it at zero for good, because no further resize event need follow.
    if (width < 1 || height < 1) return;
    viewport = { width, height, dpr: Math.min(window.devicePixelRatio || 1, 2) };
    renderer.resize(viewport);
  };

  const stage = (): Stage => computeStage(viewport, cfg, role());
  const layout = (): Layout => {
    const s = stage();
    return computeLayout({ width: s.width, height: s.height, dpr: viewport.dpr }, cfg, role());
  };

  window.addEventListener("resize", resize);
  new ResizeObserver(resize).observe(document.documentElement);
  resize();

  // The window is still what the renderer is *sized* to: `renderer.resize`
  // writes that size onto the canvas as a CSS width, so measuring the canvas
  // to decide how big to make it would pin the game at whatever size it first
  // opened at. The canvas's own box is what a pointer is measured against,
  // which is a different question and the one that was being guessed.
  const inStage = (e: { clientX: number; clientY: number }): { x: number; y: number } | null => {
    const s = stage();
    const p = pointOnStage(e, canvas.getBoundingClientRect(), viewport, s);
    return p.x < 0 || p.y < 0 || p.x > s.width || p.y > s.height ? null : p;
  };

  return { layout, inStage };
}
