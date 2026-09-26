import { bakedCache } from "./baked.js";

/**
 * **A SPRITE BAKED AT LOAD**: detail drawn by our own code, once, onto an
 * offscreen canvas, and blitted after that. It downloads nothing — the bytes
 * it costs are the code that paints it — and a frame pays one `drawImage`
 * for it however much is in the picture (`docs/style-guide.md`, **Depth**:
 * *detail that would be an image is baked, not shipped*).
 *
 * A sprite is painted in **two grey layers**, so one painting serves every
 * colour the game needs it in (`docs/raster.md` rule 7):
 *
 * - `body` — the material, in greys: white where it takes its colour fully,
 *   black where it is ink. It is **multiplied** by the base colour.
 * - `light` — what glows or shines on it, in white with alpha as strength. It
 *   is **added** in the light colour.
 *
 * `tintedSprite` composes the two for a colour pair once and keeps the result,
 * so the frame blits one canvas. Nothing here reads pixels back: the tint is
 * three composite operations, which the headless stub counts like any other.
 *
 * A sprite may be several **frames** side by side, painted by one function
 * called once per frame index — a few poses, with the motion between them done
 * by the transform it is blitted under (`blitFrame`), never by more frames.
 *
 * **The key is the size in device pixels, quantised.** A caller rounds with
 * `spritePx` and nothing else, so a body growing through its flight-in bakes
 * at its full size once and is scaled down, rather than baking every size it
 * passes through (`.claude/skills/depth`, *a key that moves*).
 */

export interface SpriteSpec {
  /** Names the painting; part of every cache key. */
  readonly name: string;
  /** How many frames, side by side. */
  readonly frames: number;
  /** One frame's width over its height. */
  readonly aspect: number;
  /** Paints frame `i` of the material layer into a `w` × `h` box at the origin. */
  body(g: CanvasRenderingContext2D, w: number, h: number, i: number): void;
  /** Paints frame `i` of the light layer, white with alpha as strength. */
  light?(g: CanvasRenderingContext2D, w: number, h: number, i: number): void;
}

/** A baked strip and the size of one frame in it, in device pixels. */
export interface Sprite {
  readonly canvas: HTMLCanvasElement;
  readonly w: number;
  readonly h: number;
  readonly frames: number;
}

/** The step a sprite's height is rounded up to, in device pixels. */
export const SPRITE_STEP = 8;

/** A height in device pixels, rounded up to the step: the only key a sprite takes. */
export function spritePx(cssHeight: number, dpr: number): number {
  return Math.max(SPRITE_STEP, Math.ceil((cssHeight * dpr) / SPRITE_STEP) * SPRITE_STEP);
}

const greys = bakedCache<string, { body: Sprite; light?: Sprite }>();
const tinted = bakedCache<string, Sprite>();

function canvasOf(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext("2d")];
}

function strip(
  spec: SpriteSpec,
  h: number,
  paint: (g: CanvasRenderingContext2D, w: number, h: number, i: number) => void,
): Sprite {
  const w = Math.max(1, Math.round(h * spec.aspect));
  const [canvas, g] = canvasOf(w * spec.frames, h);
  if (g)
    for (let i = 0; i < spec.frames; i++) {
      g.save();
      g.translate(i * w, 0);
      g.beginPath();
      g.rect(0, 0, w, h);
      g.clip();
      paint(g, w, h, i);
      g.restore();
    }
  return { canvas, w, h, frames: spec.frames };
}

/** The two grey layers of `spec` at height `px`, painted on first use. */
export function greySprite(spec: SpriteSpec, px: number): { body: Sprite; light?: Sprite } {
  const key = `${spec.name}@${px}`;
  const held = greys.get(key);
  if (held) return held;
  const light = spec.light;
  const made = {
    body: strip(spec, px, spec.body),
    light: light ? strip(spec, px, light) : undefined,
  };
  greys.set(key, made);
  return made;
}

/** `spec` at height `px` in `base`, lit in `glow`: composed once, then held. */
export function tintedSprite(spec: SpriteSpec, px: number, base: string, glow: string): Sprite {
  const key = `${spec.name}@${px}:${base}:${glow}`;
  const held = tinted.get(key);
  if (held) return held;
  const { body, light } = greySprite(spec, px);
  const [canvas, g] = canvasOf(body.canvas.width, body.canvas.height);
  if (g) {
    g.drawImage(body.canvas, 0, 0);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = base;
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.globalCompositeOperation = "destination-in";
    g.drawImage(body.canvas, 0, 0);
    if (light) {
      const [lit, lg] = canvasOf(canvas.width, canvas.height);
      if (lg) {
        lg.drawImage(light.canvas, 0, 0);
        lg.globalCompositeOperation = "source-in";
        lg.fillStyle = glow;
        lg.fillRect(0, 0, lit.width, lit.height);
      }
      g.globalCompositeOperation = "lighter";
      g.drawImage(lit, 0, 0);
    }
  }
  const made = { canvas, w: body.w, h: body.h, frames: body.frames };
  tinted.set(key, made);
  return made;
}

/**
 * A height in device pixels, rounded up to a power of two: the key for a
 * sprite drawn at a size that swells every frame (a thump, a growing glob),
 * so the swell bakes a few sizes rather than one per step.
 */
export function spritePow2(cssHeight: number, dpr: number): number {
  return 2 ** Math.ceil(Math.log2(Math.max(SPRITE_STEP, cssHeight * dpr)));
}

/**
 * Frame `i` of `s`, centred on `(x, y)`, `h` CSS pixels tall, turned by `rot`
 * and at `alpha` — the in-between motion a baked frame does not carry.
 */
export function blitFrame(
  ctx: CanvasRenderingContext2D,
  s: Sprite,
  i: number,
  x: number,
  y: number,
  h: number,
  rot = 0,
  alpha = 1,
): void {
  if (alpha <= 0) return;
  const w = (h * s.w) / s.h;
  const f = Math.max(0, Math.min(s.frames - 1, Math.floor(i)));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  if (rot !== 0) ctx.rotate(rot);
  ctx.drawImage(s.canvas, f * s.w, 0, s.w, s.h, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** A small seeded stream for a painting's scatter: same seed, same sprite. */
export function spriteRng(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a ^= a << 13;
    a ^= a >>> 17;
    a ^= a << 5;
    return (a >>> 0) / 4294967296;
  };
}
