import {
  clientOfStage,
  computeLayout,
  computeStage,
  type Insets,
  type Layout,
  NO_INSET,
  pointOnStage,
  type Renderer,
  type Stage,
  type ViewRole,
} from "@neon-spore/render";
import type { SimConfig } from "@neon-spore/sim";
import type { RunState } from "./run-state.js";
import { safeArea, smallHeight } from "./safe-area.js";

/** The rectangle actually showing, in CSS pixels, how dense it is, and the
 * strips of it the phone keeps for itself (`safe-area.ts`). */
interface Viewport {
  width: number;
  height: number;
  dpr: number;
  inset: Insets;
}

/**
 * How big the picture may be right now.
 *
 * `window.innerHeight` is the *layout* viewport, which on a phone includes the
 * strip the address bar is sitting over: it grows by the bar's height the
 * moment the bar collapses and shrinks again when it comes back, and it reports
 * each of those after the fact. `visualViewport` is the rectangle the player
 * can actually see — the bar excluded, the on-screen keyboard excluded — and it
 * reports the change while it is still animating. Where there is no such
 * object, the window's own numbers are all there is.
 *
 * Rounded, because the visual viewport is fractional under a pinch and the
 * renderer is sized in whole pixels.
 *
 * The inset is handed in, not read here: reading it forces a style and layout
 * flush, and this runs on every event of an address bar's slide. `small` is
 * the same kind of reading and is handed in beside it: the height with the
 * bars out (`safe-area.ts`), which the picture is never taller than — so a
 * height frozen for a run can never put the lobes under a bar coming back.
 */
function measure(inset: Insets, small: number): Viewport {
  const seen = window.visualViewport;
  const height = Math.round(seen?.height ?? window.innerHeight);
  return {
    width: Math.round(seen?.width ?? window.innerWidth),
    height: small > 0 ? Math.min(height, small) : height,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    inset,
  };
}

/**
 * The measurement in two halves, each as one string.
 *
 * *Did anything move* is asked twice below and about different halves of the
 * answer, and spelling either out as four comparisons is how a field comes to
 * be left out of one of them. Across: the width, the density, and the
 * furniture at the sides. Down: the height and the furniture above and below
 * it — which is the half the address bar moves and the half a run refuses.
 */
function across(v: Viewport): string {
  return `${v.width}:${v.dpr}:${v.inset.left}:${v.inset.right}`;
}

function down(v: Viewport): string {
  return `${v.height}:${v.inset.top}:${v.inset.bottom}`;
}

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
  /**
   * Draw something over the frame, in the coordinates the frame was drawn in.
   *
   * The renderer clips to the stage and translates to its corner before it
   * paints anything (`render/canvas2d.ts`); a caller that paints *after* it
   * gets a canvas back at the window's own origin. On a phone those are the
   * same point and nothing said otherwise — on a desktop the intro's six pages
   * were painted flush against the left edge of the window with the game
   * showing beside them, and their SKIP and NEXT answered a press one stage
   * offset to the right, over the field. So the offset is applied in the one
   * place that already owns it rather than by the overlay.
   */
  onStage: (
    ctx: CanvasRenderingContext2D,
    draw: (ctx: CanvasRenderingContext2D, layout: Layout) => void,
  ) => void;
  /**
   * `inStage` the other way: a point in the frame's coordinates, as the
   * `clientX`/`clientY` a pointer would carry to land on it. For the one
   * caller that puts a pointer down rather than reading one — `bun run frames
   * --hand` presses a grab circle with a real mouse (`handle.ts`).
   */
  toClient: (p: { x: number; y: number }) => { clientX: number; clientY: number };
}

/**
 * `run` is here because **the field is measured when the wave opens and not
 * again until it ends**.
 *
 * `computeLayout` divides the height into the play area and the control band,
 * so `bandTop` is a share of the height: a height that changes mid-wave moves
 * the band, the strips and the lobes down or up, and a thumb already resting on
 * a lobe is now resting beside it without having moved. The pair's own report
 * of that is *it sometimes does not react*. On a phone the height changes for
 * no reason of the player's at all — the address bar collapses on a scroll the
 * game never asked for — so a resize during a run is a thing to survive, not a
 * thing to honour.
 *
 * Only the vertical is frozen. A change of width is a rotation or a desktop
 * window being dragged, which is deliberate, visible and impossible to play
 * through unanswered; when it moves the whole measurement is taken, height and
 * all, because half of a rotation is not a stage.
 *
 * Outside a run the viewport is answered as it always was: a keyboard opening
 * over the room code on the join screen is a resize that has to be obeyed. And
 * the run *ending* re-measures, because whatever was ignored during it is still
 * true.
 */
export function bindViewport(
  canvas: HTMLCanvasElement,
  renderer: Renderer,
  cfg: SimConfig,
  role: () => ViewRole,
  run: RunState,
): Geometry {
  let viewport: Viewport = { width: 1, height: 1, dpr: 1, inset: NO_INSET };
  // The phone's furniture moves on a rotation and the first layout only, so it
  // is read then — `orientationchange`, the observer, a run's edge — and kept.
  let inset = safeArea();
  let small = smallHeight();

  const apply = (forced: boolean): void => {
    if (forced) {
      inset = safeArea();
      small = smallHeight();
    }
    const next = measure(inset, small);
    // A zero-sized viewport happens for real: a hidden tab, and on a phone the
    // moment the address bar animates. Sizing the canvas to it once would leave
    // it at zero for good, because no further resize event need follow.
    if (next.width < 1 || next.height < 1) return;
    const sameAcross = across(next) === across(viewport);
    if (sameAcross && down(next) === down(viewport)) return;
    // Nothing moved across, so what moved is the height or the furniture around
    // it — the address bar, or a keyboard. Not a wave's business.
    if (sameAcross && !forced && run.running()) return;
    viewport = next;
    renderer.resize(viewport);
  };

  const resize = (): void => apply(false);
  const refresh = (): void => {
    inset = safeArea();
    small = smallHeight();
    apply(false);
  };

  const stage = (): Stage => computeStage(viewport);
  const layout = (): Layout => {
    const s = stage();
    return computeLayout({ width: s.width, height: s.height, dpr: viewport.dpr }, cfg, role());
  };

  window.addEventListener("resize", resize);
  // The one listener that hears the address bar *while* it moves rather than
  // once it has stopped. Both are bound: a desktop window has no visual
  // viewport worth the name, and a phone fires both.
  window.visualViewport?.addEventListener("resize", resize);
  window.addEventListener("orientationchange", refresh);
  new ResizeObserver(refresh).observe(document.documentElement);
  // Both edges. The wave opening takes the measurement it is then frozen at,
  // and the wave ending takes the one that was ignored while it ran.
  run.onChange(() => apply(true));
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

  const onStage = (
    ctx: CanvasRenderingContext2D,
    draw: (ctx: CanvasRenderingContext2D, layout: Layout) => void,
  ): void => {
    const s = stage();
    if (s.width < 1 || s.height < 1) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(s.left, s.top, s.width, s.height);
    ctx.clip();
    ctx.translate(s.left, s.top);
    // `layout()` rather than a second derivation of it: the overlay has to be
    // drawn against the very layout its own hit test reads, and two spellings
    // of that would drift the way `mapCol` does.
    draw(ctx, layout());
    ctx.restore();
  };

  const toClient = (p: { x: number; y: number }): { clientX: number; clientY: number } =>
    clientOfStage(p, canvas.getBoundingClientRect(), viewport, stage());

  return { layout, inStage, onStage, toClient };
}
