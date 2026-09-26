import type { SeenRing } from "@neon-spore/content";

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

/**
 * The flight scale at and below which a body is a speck: THE INSTAR at a
 * third of its size or less is 60 to 120 px across on a phone, the style
 * guide's "turning body" row, where parts on a rim survive and surface
 * texture does not (`docs/style-guide.md`, *Complexity, by drawn size*).
 */
const SPECK = 0.3;

/**
 * **Whether the body is drawn too small for its surface texture.** Under it,
 * the scales, the horn's ridges and the belly's scutes are left out, a glow's
 * layered passes are one, and a tube is shaded only by rings `STEP_PX` apart
 * on the screen. The owner, 26 September 2026: *yes drop details if its
 * reasonable save battery*. It changes pixels a stroke wide on a body a
 * thumb across; its outline, colour, light and parts are all still drawn.
 */
export function speck(): boolean {
  return onScreen <= SPECK;
}

/**
 * A speck's rings with those under `px` screen pixels past the last one kept
 * left out, the first and the last always kept. Only the light across a tube
 * is read off these (`drawTube`); its outline keeps every ring.
 */
export function thinned(rings: readonly SeenRing[], px: number): readonly SeenRing[] {
  if (!speck() || rings.length < 3) return rings;
  let last = rings[0] as SeenRing;
  const out = [last];
  for (let i = 1; i < rings.length - 1; i++) {
    const g = rings[i] as SeenRing;
    if (Math.hypot(g.c.x - last.c.x, g.c.y - last.c.y) * onScreen < px) continue;
    out.push(g);
    last = g;
  }
  out.push(rings[rings.length - 1] as SeenRing);
  return out;
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
