/**
 * **Where a tube of a rig lands on the screen**, for the one body drawn at
 * any size and anywhere: THE INSTAR's flight carries the whole body at an
 * eighth of its size and out past the edge of the field (`instar-flight.ts`).
 * `drawTube` (`solid-tube-draw.ts`) asks here how finely to slice a tube and
 * which of its slices land on the canvas at all.
 *
 * Both answers are the screen's, not the body's own pixels: its rings are a
 * few pixels apart *on the screen*, or a speck is sliced as finely as the
 * body filling the field; and a slice wholly off the canvas paints nothing,
 * so it is not filled. Neither changes a pixel.
 */

/** How many screen pixels one drawn pixel is while a body is drawn scaled (`tubesAt`). */
let onScreen = 1;
/** Whether the slices off the canvas are left out (`tubesAt`). */
let culling = false;
/** How far off the canvas, in device pixels, a slice may reach and still be drawn. */
const PAD = 4;

/**
 * Draw tubes under a scale the caller has put on the context, and — with
 * `cull` — leave out each slice that lands entirely off the canvas.
 */
export function tubesAt<T>(scale: number, cull: boolean, draw: () => T): T {
  const was = { onScreen, culling };
  onScreen = scale;
  culling = cull;
  try {
    return draw();
  } finally {
    onScreen = was.onScreen;
    culling = was.culling;
  }
}

/** The scale `tubesAt` put a tube under. */
export function tubeScale(): number {
  return onScreen;
}

/** The context's transform and its canvas's size, in device pixels. */
export interface Screen {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  w: number;
  h: number;
}

/** The screen one tube is drawn onto, or null when nothing is left out. */
export function tubeScreen(ctx: CanvasRenderingContext2D): Screen | null {
  const w = ctx.canvas?.width ?? 0;
  const h = ctx.canvas?.height ?? 0;
  if (!culling || w <= 0 || h <= 0) return null;
  const { a, b, c, d, e, f } = ctx.getTransform();
  return { a, b, c, d, e, f, w, h };
}

interface Pt {
  readonly x: number;
  readonly y: number;
}

/** Whether every one of `pts` lands past the same edge of the canvas. */
export function offScreen(s: Screen, pts: readonly Pt[]): boolean {
  let left = true;
  let right = true;
  let up = true;
  let down = true;
  for (const p of pts) {
    const x = s.a * p.x + s.c * p.y + s.e;
    const y = s.b * p.x + s.d * p.y + s.f;
    left &&= x < -PAD;
    right &&= x > s.w + PAD;
    up &&= y < -PAD;
    down &&= y > s.h + PAD;
  }
  return left || right || up || down;
}
