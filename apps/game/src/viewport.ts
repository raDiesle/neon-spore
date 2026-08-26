import {
  computeLayout,
  computeStage,
  type Layout,
  type Renderer,
  type Stage,
  type ViewRole,
} from "@neon-spore/render";
import type { SimConfig } from "@neon-spore/sim";

/**
 * The window's size, and the two pieces of geometry everything else asks for.
 *
 * Input hit-tests against the same layout the renderer draws, so both are
 * derived the same way: from the stage rather than the window, and for
 * whichever role the view switch is showing. Cheap enough to compute per
 * event, which is why they are functions rather than a cached pair — the
 * screen changes size, the role changes, and a stale rectangle sends a touch
 * to the wrong column.
 */
export interface Geometry {
  /** The phone-shaped rectangle the game is drawn into. */
  stage: () => Stage;
  layout: () => Layout;
}

export function bindViewport(renderer: Renderer, cfg: SimConfig, role: () => ViewRole): Geometry {
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

  return { stage, layout };
}
