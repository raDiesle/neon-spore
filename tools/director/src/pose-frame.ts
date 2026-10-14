import {
  Canvas2DRenderer,
  computeLayout,
  computeStage,
  type Layout,
  type Stage,
  type Thumb,
  type Viewport,
  type ViewRole,
} from "@neon-spore/render";
import { framePhase, type World } from "@neon-spore/sim";

/**
 * **The two halves of a posed picture**: the whole phone drawn once by the
 * shipping renderer, and a rectangle of it cut into a card.
 *
 * Out of `pose-art.ts` on 9 October 2026, when CONTROLS › ON THE FIELD began
 * cutting a rectangle no `CropKind` names — the box round a control
 * (`field-focus.ts`) — and enlarging it on a click, which wants the phone
 * drawn at more than two device pixels to a CSS pixel or the enlargement is
 * a blur. `frameWorld` there is still the one way a crop by kind is drawn; it
 * is these two, called in order.
 */

/** The phone the frame is drawn into before it is cut. Bigger than a card. */
export const PHONE: Viewport = { width: 380, height: 820, dpr: 2 };
/** Frames spent settling the eased pose before the one that is kept. */
const SETTLE = 40;

/** A whole phone, drawn, and the arithmetic it was drawn with. */
export interface DrawnPhone {
  canvas: HTMLCanvasElement;
  layout: Layout;
  stage: Stage;
  /** Device pixels per CSS pixel of `canvas`. */
  dpr: number;
}

/**
 * One settled frame of a world on the whole phone.
 *
 * The renderer eases: the shield swells towards armed, the maw travels
 * through flat, the cannon glides to its column. A single frame would catch
 * all three at zero, so the pose is drawn a few dozen times with a long `dt`
 * first and only the last frame is kept — the easing settled, the effects
 * fresh. `dpr` above `PHONE`'s is for a picture that will be enlarged.
 */
export function drawPhone(
  world: World,
  role: ViewRole,
  bare = false,
  dpr = PHONE.dpr,
  thumb?: { col: number; row: number },
): DrawnPhone {
  const cfg = world.cfg;
  const off = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(off);
  renderer.resize({ ...PHONE, dpr });
  const stage = computeStage(PHONE);
  const layout = computeLayout({ width: stage.width, height: stage.height, dpr }, cfg, role);
  const view = {
    world,
    beatPhase: framePhase(world),
    role,
    time: world.tick / cfg.tickHz,
    running: true,
    banner: null,
    bare,
    // Down through all the settling frames, so its ring has had them to open.
    thumbs: thumb === undefined ? undefined : [thumbOnStage(layout, thumb)],
  };
  // Settled first, with nothing reported: a long `dt` walks the eased pose to
  // where it belongs without spending the events on frames nobody keeps.
  for (let i = 0; i < SETTLE; i++) renderer.draw({ ...view, dt: 1 / 20, events: [] });
  // Then the frame that is kept, carrying whatever the last tick reported —
  // so a deflection is drawn with its flash on rather than a second later.
  renderer.draw({ ...view, dt: 1 / 60, events: world.events });
  renderer.dispose();
  return { canvas: off, layout, stage, dpr };
}

/** A thumb on the middle of a tile, in the stage's coordinates — the layout's. */
function thumbOnStage(l: Layout, at: { col: number; row: number }): Thumb {
  return { id: 1, x: l.gridLeft + (at.col + 0.5) * l.tile, y: l.gridTop + (at.row + 0.5) * l.tile };
}

/**
 * `rect` of a drawn phone on a canvas of its own, `width` CSS pixels across
 * unless that would make it taller than `cap`. The height follows from the
 * rectangle, so a tile stays square.
 */
export function cutCard(
  phone: DrawnPhone,
  rect: { x: number; y: number; w: number; h: number },
  width: number,
  cap: number,
): { canvas: HTMLCanvasElement; scale: number } {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  // The crop decides the shape; the cap decides how much of the row it takes.
  const wide = Math.min(width, Math.round((cap * rect.w) / rect.h));
  const height = Math.round((wide * rect.h) / rect.w);
  const card = document.createElement("canvas");
  card.width = Math.round(wide * dpr);
  card.height = Math.round(height * dpr);
  card.style.width = `${wide}px`;
  card.style.height = `${height}px`;
  const ctx = card.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingQuality = "high";
    const d = phone.dpr;
    ctx.drawImage(
      phone.canvas,
      rect.x * d,
      rect.y * d,
      rect.w * d,
      rect.h * d,
      0,
      0,
      card.width,
      card.height,
    );
  }
  return { canvas: card, scale: wide / rect.w };
}
