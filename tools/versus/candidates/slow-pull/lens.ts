import type { Layout } from "../../../../packages/render/src/layout.js";
import type { SlowWindow } from "../../../../packages/render/src/slow-look.js";
import type { SimConfig } from "../../../../packages/sim/src/index.js";
import { beatSeconds, MILLI } from "../../../../packages/sim/src/index.js";

/**
 * **What every `slow:pull` answer needs and none of them is about**: the
 * frame's own pixels, and where the boss stands on them.
 *
 * The owner asked on 25 September 2026 for the window to feel like light being
 * *sucked into the middle of the boss*, and named four screen effects to try —
 * a zoom blur, a colour split, a lens punch and a grade. Every one of them is a
 * picture of the frame already drawn, moved or recoloured about one point, so
 * they share the three steps here: copy what is on the canvas, find the boss
 * in device pixels, and work there with the play area as the only place paint
 * can land.
 *
 * **The station makes it honest.** `SLOW_LOOK.paint` runs over every body and
 * under the ship (`canvas2d.ts`), so the copy is the field and nothing else:
 * the hull, the band and the fuse are drawn after it and stay sharp whatever
 * a candidate does to the room.
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

/**
 * Keeps the light and drops the room: the surface multiplied by itself
 * `times` times, so the field's dark ground goes to black long before anything
 * lit does. Without it a copy added over the frame adds the ground too — the
 * whole room lifts, and the edge of the stage shows as a box.
 */
export function key(img: HTMLCanvasElement, times: number): void {
  const c = img.getContext("2d");
  if (c === null) return;
  c.globalCompositeOperation = "multiply";
  for (let i = 0; i < times; i++) c.drawImage(img, 0, 0);
  c.globalCompositeOperation = "source-over";
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

/**
 * Seconds the window has run and has left, **in the hand** — the exchange
 * `slow-intake-aim.ts`' `ramp` makes, for a candidate whose motion is a snap
 * an eye judges in seconds rather than a sweep that keeps the beat.
 */
export function handSeconds(win: SlowWindow, cfg: SimConfig): { since: number; until: number } {
  const perBeat = beatSeconds(cfg) * (MILLI / cfg.slowRateMilli);
  return { since: (win.beats - win.left) * perBeat, until: win.left * perBeat };
}

/** How far through its current beat the window stands, 0 to 1. */
export function beatFrac(win: SlowWindow): number {
  const done = win.beats - win.left;
  return done - Math.floor(done);
}
