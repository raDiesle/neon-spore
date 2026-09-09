import { blobPath } from "@neon-spore/content";

/**
 * ONE BLOB OF THE MOUSE'S INK — its size, its sag, and how it is put down.
 *
 * `splash-trail.ts` owns the *stroke*: where the hand has been, how far apart
 * to lay ink along it and what colour the next one is. This owns the *drop*:
 * what one of them is made of, how big it is born, how it swells and fades,
 * and the two flat fills that draw it. The two came apart when the trail grew
 * a scale and the file went past the limit, and the seam is a real one — the
 * class below has no opinion about a blob's insides and this has none about
 * where the mouse went.
 *
 * **Additive, and that is the whole trick.** Each blob is two flat fills under
 * `lighter` — a wide faint skirt and a small bright core — and nothing else.
 * No gradient is built per blob and no halo sprite is cached, because the hue
 * moves continuously and a cache keyed on it would grow a canvas a frame.
 * Twenty overlapping skirts are what makes the middle of a stroke bright,
 * which is what a fluid does and what a single translucent fill never does.
 */

/**
 * The ceiling, at full size. A fast circular drag on a wide monitor can ask
 * for hundreds; past this the oldest go, because the newest are the ones under
 * the eye. A scaled-down trail is allowed proportionally more of them — the
 * spacing shrinks with the blobs, so the same drag lays more, and each one
 * costs the square of the scale to fill. More, smaller, and cheaper than the
 * full-size stroke it replaces.
 */
export const MAX_BLOBS = 120;
/** How much wider a blob is at the end of its life than at the start. */
const SWELL = 2.6;

/**
 * `SplashTrail.scale` for a trail drawn over the field.
 *
 * The owner asked for the ink full size on the menu and much smaller in the
 * game. Two hosts need that number — the app, which switches between the two
 * as sheets come and go (`apps/game/src/trail.ts`), and the director's stage,
 * which is never anything but the field (`tools/director/src/stage-trail.ts`)
 * — so it is one exported value rather than the same fraction typed twice.
 * Small enough that the trail reads as a wake off the pointer and can never be
 * mistaken for a body with lobes on the field it crosses.
 */
export const FIELD_TRAIL_SCALE = 0.34;

export interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radius at birth, in CSS pixels. */
  r: number;
  age: number;
  life: number;
  hue: number;
  seed: number;
  lobes: number;
  /** The scale it was born at, so the sag matches the size for its whole life. */
  scale: number;
}

/**
 * A drop of ink, thrown from `(x, y)` along `(ux, uy)`.
 *
 * `n` is the trail's own counter and `scale` its current size. Everything that
 * would be random elsewhere is a turn of the counter, for the reason
 * `STROKE_TURN` gives in `splash-trail.ts`: a frame test has to be able to
 * diff a picture, and it cannot diff one that is a different colour every run.
 */
export function makeBlob(
  n: number,
  x: number,
  y: number,
  ux: number,
  uy: number,
  speed: number,
  scale: number,
): Blob {
  const along = ((n * 41) % 17) / 17 - 0.5;
  const across = ((n * 23) % 13) / 13 - 0.5;
  // **Sideways as well as along, and a size that is nobody's average.**
  // Without these two the blobs land in a line at one radius and the stroke
  // comes out an even ribbon — a highlighter, not ink. The perpendicular
  // throw and the size spread are what give the edge of a stroke lumps, and
  // lumps are the whole difference between a fluid and a felt tip.
  const size = 0.55 + ((n * 29) % 19) / 19;
  return {
    x: x + (ux * along * 7 - uy * across * 15) * scale,
    y: y + (uy * along * 7 + ux * across * 15) * scale,
    // The ink keeps going the way the hand threw it, and sags while it does.
    vx: (ux * speed * 46 - uy * across * 40) * scale,
    vy: (uy * speed * 46 + ux * across * 40 + 8) * scale,
    r: (8 + speed * 13) * size * scale,
    age: 0,
    life: 0.8 + ((n * 7) % 11) / 16,
    hue: 0,
    seed: n % 16,
    lobes: 3 + (n % 3),
    scale,
  };
}

/** A second older, sagging by as much as its own size and no more. */
export function ageBlob(b: Blob, dt: number, drag: number): void {
  b.age += dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.vx *= drag;
  // Slime, not smoke: what is left of a stroke slides down the glass.
  b.vy = b.vy * drag + 34 * b.scale * dt;
}

/** The skirt and the core, in that order. The caller owns the composite mode. */
export function drawBlob(ctx: CanvasRenderingContext2D, b: Blob, t: number): void {
  const k = b.age / b.life;
  // Up fast, down slow: a splash is at its widest almost at once and then
  // spends the rest of its life thinning, which is what makes it read as
  // liquid rather than as a dot being turned down.
  const fade = k < 0.18 ? k / 0.18 : 1 - (k - 0.18) / 0.82;
  const r = b.r * (1 + (SWELL - 1) * k);
  const skirt = new Path2D(
    blobPath(b.x, b.y, r, r * 0.92, b.lobes, 0.16, 0.1, t + b.seed, b.seed, 22),
  );
  ctx.fillStyle = neonHue(b.hue, 0.9, 0.5);
  ctx.globalAlpha = 0.13 * fade;
  ctx.fill(skirt);
  const core = new Path2D(
    blobPath(b.x, b.y, r * 0.44, r * 0.4, b.lobes, 0.2, 0.12, t * 1.3 + b.seed, b.seed, 18),
  );
  ctx.fillStyle = neonHue(b.hue, 0.5, 1);
  ctx.globalAlpha = 0.24 * fade * fade;
  ctx.fill(core);
}

/**
 * A hue as `#rrggbb`.
 *
 * `#rrggbb` and not `hsl(...)`: `packages/render/test/canvas-stub.ts` refuses
 * anything else, and it refuses it because a colour notation this renderer had
 * not agreed on is exactly the class of mistake that stub exists to catch.
 */
export function neonHue(deg: number, sat: number, val: number): string {
  const h = (((deg % 360) + 360) % 360) / 60;
  const c = val * sat;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = val - c;
  const wheel: readonly (readonly [number, number, number])[] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const rgb = wheel[Math.floor(h) % 6] as readonly [number, number, number];
  const byte = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${byte(rgb[0])}${byte(rgb[1])}${byte(rgb[2])}`;
}
