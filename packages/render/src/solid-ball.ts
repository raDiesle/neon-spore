import { KEY } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { mixHex, rgba } from "./hex.js";
import type { Skin } from "./solid-tube-draw.js";

/**
 * A ROUND PART OF A RIG — a head, a knuckle, an eye, a nest — lit once and
 * stamped.
 *
 * A ball looks the same from every side under a light that does not turn, so
 * its whole picture is a function of its size and its skin and nothing else:
 * the one shape in a rig that can be **baked**. The sprite is the five zones
 * in one image — the base, the lit shoulder toward `KEY`, the specular, the
 * terminator's core shadow, and the reflected light on the rim opposite — and
 * a frame's cost for a ball is one `drawImage` however many stops it has.
 *
 * The radius is rounded to four pixels, `key-light.ts`'s step, so a ball that
 * breathes by a pixel keeps hitting the one sprite; the skin is three hexes a
 * caller does not mix continuously (the style guide's "a key that moves").
 * Depth haze is applied by picking a hazed skin, in six steps (`solid-haze.ts`).
 */

const SHADOW = "#0B1024";
const BOUNCE = "#9FB4E8";
const STEP = 4;

const sprites = bakedCache<string, HTMLCanvasElement>();

function ballSprite(skin: Skin, q: number): HTMLCanvasElement {
  const key = `${skin.base}|${skin.lift}|${skin.sheen}@${q}`;
  const cached = sprites.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = q * 2;
  c.height = q * 2;
  const g = c.getContext("2d");
  if (g) {
    g.beginPath();
    g.arc(q, q, q, 0, Math.PI * 2);
    g.fillStyle = skin.base;
    g.fill();
    g.clip();
    // The lit shoulder and its core shadow: a radial ramp centred toward the key.
    const hx = q + KEY.x * q * 0.42;
    const hy = q + KEY.y * q * 0.42;
    const body = g.createRadialGradient(hx, hy, 0, hx, hy, q * 1.55);
    body.addColorStop(0, rgba(mixHex(skin.lift, skin.sheen, 0.3), 0.75));
    body.addColorStop(0.3, rgba(skin.lift, 0.4));
    body.addColorStop(0.62, rgba(SHADOW, 0.15));
    body.addColorStop(0.86, rgba(SHADOW, 0.62));
    body.addColorStop(1, rgba(SHADOW, 0.5));
    g.fillStyle = body;
    g.fillRect(0, 0, q * 2, q * 2);
    // The reflected light: a cool crescent on the rim away from the key.
    const bx = q - KEY.x * q * 0.9;
    const by = q - KEY.y * q * 0.9;
    const bounce = g.createRadialGradient(bx, by, 0, bx, by, q * 0.7);
    bounce.addColorStop(0, rgba(BOUNCE, 0.3));
    bounce.addColorStop(1, rgba(BOUNCE, 0));
    g.fillStyle = bounce;
    g.fillRect(0, 0, q * 2, q * 2);
    // The specular: small and hard, where the surface is square to the key.
    const sx = q + KEY.x * q * 0.5;
    const sy = q + KEY.y * q * 0.5;
    const spec = g.createRadialGradient(sx, sy, 0, sx, sy, q * 0.26);
    spec.addColorStop(0, rgba(skin.sheen, 0.8));
    spec.addColorStop(1, rgba(skin.sheen, 0));
    g.fillStyle = spec;
    g.fillRect(0, 0, q * 2, q * 2);
  }
  sprites.set(key, c);
  return c;
}

/** A lit ball of screen radius `r` at `(x, y)`. */
export function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  skin: Skin,
  alpha = 1,
): void {
  if (alpha <= 0 || r < 0.5) return;
  const q = Math.max(STEP, Math.round(r / STEP) * STEP);
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * alpha;
  ctx.drawImage(ballSprite(skin, q), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = prev;
}
