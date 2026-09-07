import { Canvas2DRenderer } from "@neon-spore/render";

/**
 * One side of a VERSUS pair: a whole phone, drawn, shown through the window
 * its pose's own `crop` cuts in it.
 *
 * Both sides stay whole 380 x 820 phones however little of one is on screen.
 * The pair's single claim is that the two differ only by the patch, and a
 * second, smaller render path — a canvas sized to the band, a renderer told to
 * draw less — would be a second thing to keep honest for no gain. So what is
 * *shown* is cut instead, by an overflow-hidden window with the canvas
 * positioned inside it at a negative offset: no scaling, no resampling, and
 * the two buttons `panel:action-face` is decided on arrive at exactly the size
 * a thumb meets them at.
 *
 * Its own file because `versus-pair.ts` is at CLAUDE.md's line ceiling, and
 * because this is a different subject from the loop next door: that file is
 * about two pictures being the same frame, and this one is about which part of
 * a picture a reader is handed.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CropSide {
  canvas: HTMLCanvasElement;
  /** The window the crop cuts; the canvas is its only child. */
  frame: HTMLDivElement;
  renderer: Canvas2DRenderer;
}

/** A canvas at `phone` size and the window it will be shown through. The
 * window is left unsized: `fitCrop` gives it the rectangle and the zoom. */
export function makeCropSide(phone: { width: number; height: number }, dpr: number): CropSide {
  const canvas = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ ...phone, dpr });
  const frame = document.createElement("div");
  frame.className = "versus-crop";
  frame.appendChild(canvas);
  return { canvas, frame, renderer };
}

/** Show `crop` of each side at `n` CSS pixels per phone pixel — 1 is true
 * size, 2 is the magnifier the controls bar offers. */
export function fitCrop(
  sides: readonly CropSide[],
  phone: { width: number; height: number },
  crop: Rect,
  n: number,
): void {
  for (const side of sides) {
    side.canvas.style.width = `${phone.width * n}px`;
    side.canvas.style.height = `${phone.height * n}px`;
    side.canvas.style.left = `${-crop.x * n}px`;
    side.canvas.style.top = `${-crop.y * n}px`;
    side.frame.style.width = `${crop.w * n}px`;
    side.frame.style.height = `${crop.h * n}px`;
  }
}
