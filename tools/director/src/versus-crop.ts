import { Canvas2DRenderer, type ViewRole } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import { poseCropRect } from "./pose-art.js";
import type { Pose } from "./pose-kit.js";

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
 * whatever the slot is about arrives at exactly the size a thumb meets it at.
 * `panel:action-face` is the slot that asked for this and is decided and gone;
 * two buttons 130 px from the bottom of an 820 px phone were the case that
 * showed a whole phone is the wrong picture to offer a vote on.
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

/**
 * The window both sides are shown through, kept on the body it is about.
 *
 * `fitCrop` above is a single application of one rectangle; this owns the
 * rectangle over time. A crop was worked out once, from the world as the pose
 * handed it over, and that was right for as long as every pose replayed every
 * two seconds — a body falls a third of a tile in two seconds, so the window
 * it started in is the window it is still in. A pose held for a whole fall is
 * not: `CHOIR · TWO VOICES` and `THROB · TURNING` run for nine seconds, and a
 * tile crop centred on where the body started is a window the body drops
 * straight out of. Both had to be widened to the whole field, which is honest
 * and costs exactly the magnification a tile crop is for.
 *
 * So the rectangle is re-derived from the world both sides are about to be
 * drawn from. **Once, and handed to both** — the pair's one claim is that the
 * two sides differ only by the patch, and two rectangles worked out separately
 * would be a second thing that could disagree.
 *
 * Only a `tile` crop moves. The band, the field, the ship and the whole phone
 * are named parts of a layout that does not change while a pose runs, so
 * asking for them again every frame would be arithmetic with a known answer.
 */
export class CropWindow {
  private rect: Rect;
  private zoom = 1;

  constructor(
    private readonly sides: readonly CropSide[],
    private readonly phone: { width: number; height: number },
    private readonly pose: Pose,
    private readonly role: ViewRole,
    world: World,
  ) {
    this.rect = this.rectFor(world);
    this.fit();
  }

  private rectFor(world: World): Rect {
    return poseCropRect(this.pose, world, this.role, { ...this.phone, dpr: 1 });
  }

  /** The rectangle as it stands — what a test asks whether a body is inside. */
  get window(): Rect {
    return { ...this.rect };
  }

  /** Re-derive from the world of the frame about to be drawn. */
  follow(world: World): void {
    if (this.pose.crop !== "tile" || !this.pose.at) return;
    const next = this.rectFor(world);
    if (next.x === this.rect.x && next.y === this.rect.y) return;
    this.rect = next;
    this.fit();
  }

  /** CSS pixels per phone pixel: 1 is true size, 2 is the magnifier. */
  setZoom(n: number): void {
    this.zoom = n;
    this.fit();
  }

  private fit(): void {
    fitCrop(this.sides, this.phone, this.rect, this.zoom);
  }
}
