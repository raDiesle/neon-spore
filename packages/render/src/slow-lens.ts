import type { Layout } from "./layout.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **What a lens over THE SLOW's window needs and is not about**: the frame's
 * own pixels, and where the boss stands on them.
 *
 * Came out of the `slow:pull` slot (`tools/versus/DECIDED.md`, 26 September
 * 2026) with the prism the owner took from it. A lens is a picture of the
 * frame already drawn, moved or recoloured about one point, so every one
 * shares the three steps here: copy what is on the canvas, find the boss in
 * device pixels, and work there with the play area as the only place paint
 * can land.
 *
 * **The station makes it honest.** `SLOW_LOOK.paint` runs over every body and
 * under the ship (`canvas2d.ts`), so the copy is the field and nothing else:
 * the hull, the band and the fuse are drawn after it and stay sharp whatever
 * a lens does to the room.
 */

/** Two scratch surfaces, one per channel a split has to hold apart. */
const SCRATCH: (HTMLCanvasElement | null)[] = [null, null];

/**
 * The frame as it stands, copied into scratch surface `slot` at device size.
 *
 * Kept between frames only as memory to draw into, never as a picture: every
 * call overwrites the whole surface before anything reads it, so nothing a
 * window drew can outlive it (`slow-look.ts`).
 */
export function snapshot(ctx: CanvasRenderingContext2D, slot: 0 | 1): HTMLCanvasElement {
  const src = ctx.canvas;
  let s = SCRATCH[slot] ?? null;
  if (s === null) {
    s = document.createElement("canvas");
    SCRATCH[slot] = s;
  }
  if (s.width !== src.width || s.height !== src.height) {
    s.width = src.width;
    s.height = src.height;
  }
  const sc = s.getContext("2d");
  if (sc === null) return s;
  sc.setTransform(1, 0, 0, 1, 0, 0);
  sc.globalCompositeOperation = "copy";
  sc.globalAlpha = 1;
  sc.drawImage(src, 0, 0);
  sc.globalCompositeOperation = "source-over";
  return s;
}

/** Where the lens is centred, in device pixels, and how many of them one layout pixel is. */
export interface Eye {
  readonly x: number;
  readonly y: number;
  readonly px: number;
  readonly w: number;
  readonly h: number;
}

/**
 * Runs `draw` in device pixels, clipped to the play area.
 *
 * The clip is laid in layout coordinates first and survives the reset, so
 * nothing a lens moves can land on the band — the band is drawn over the
 * field later anyway, but a copy scaled outward would otherwise carry the
 * field's light down into the letterbox beside it.
 */
export function inField(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  draw: (eye: Eye) => void,
): void {
  const m = ctx.getTransform();
  const eye: Eye = {
    x: m.a * x + m.c * y + m.e,
    y: m.b * x + m.d * y + m.f,
    px: Math.hypot(m.a, m.b),
    w: ctx.canvas.width,
    h: ctx.canvas.height,
  };
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, l.width, l.bandTop);
  ctx.clip();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  draw(eye);
  ctx.restore();
}

/** `img` drawn at scale `s` about the eye — below one it falls in, above one it swells out. */
export function drawAbout(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  eye: Eye,
  s: number,
): void {
  ctx.drawImage(img, eye.x * (1 - s), eye.y * (1 - s), img.width * s, img.height * s);
}

/** How far through its current beat the window stands, 0 to 1. */
export function beatFrac(win: SlowWindow): number {
  const done = win.beats - win.left;
  return done - Math.floor(done);
}
