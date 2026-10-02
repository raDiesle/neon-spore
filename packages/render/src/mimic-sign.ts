import { GLYPHS } from "@neon-spore/sim";
import { strokeGlowFaded } from "./glow.js";
import { GLYPH_SHAPES } from "./glyph-shapes.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A sign on THE MIMIC's skin** (§42, *Colour*): one of the five, drawn from
 * the table the drawing phone listens for (`glyph-shapes.ts`), so what the
 * reader describes is the shape the pad hears.
 *
 * Two inks. **The sign** is a pale cyan line, the only bright line on the
 * body, surfacing from its middle outwards as it rises. **A mimicked sign**
 * is the skin's own drawing of what was drawn wrong, in the hull's red so a
 * wrong answer reads as wrong on both screens without a word, and shaken the
 * way a thumb's line is.
 */

/** How far a mimicked sign's line wanders off the template, in boxes. */
const WOBBLE = 0.045;
/** How thick a sign's line is against the mantle, in strokes of the outline. */
const THICK = 1.6;

/**
 * Sign `sign` centred on (`cx`, `cy`) in a `size` box, scaled out from its
 * middle by `rise` (0 sunk, 1 surfaced), each point pushed `wobble` boxes
 * off the line by a shake that turns with `wave`.
 */
export function glyphPath(
  sign: number,
  cx: number,
  cy: number,
  size: number,
  rise: number,
  wobble: number,
  wave: number,
): Path2D {
  const shape = GLYPH_SHAPES[GLYPHS[sign] ?? "ring"];
  const path = new Path2D();
  const k = size * rise;
  shape.at.forEach((p, i) => {
    const dx = wobble * Math.sin(i * 2.3 + wave) * size;
    const dy = wobble * Math.cos(i * 1.7 + wave * 1.3) * size;
    const x = cx + (p.x - 0.5) * k + dx;
    const y = cy + (p.y - 0.5) * k + dy;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  if (shape.closed) path.closePath();
  return path;
}

/** The sign surfaced on the skin, `rise` of the way up: pale cyan, glowing, the only bright line on the body. */
export function drawSkinSign(
  ctx: CanvasRenderingContext2D,
  sign: number,
  cx: number,
  cy: number,
  size: number,
  rise: number,
): void {
  if (sign < 0 || rise <= 0) return;
  const path = glyphPath(sign, cx, cy, size, rise, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  strokeGlowFaded(ctx, path, PALETTE.mimicSign, STROKE.outline * THICK, rise, 1);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
}

/** What was drawn wrong, worn on the skin in the hull's red and shaken, `fade` of its strength. */
export function drawMimickedSign(
  ctx: CanvasRenderingContext2D,
  drawn: number,
  cx: number,
  cy: number,
  size: number,
  wave: number,
  fade: number,
): void {
  if (drawn < 0 || fade <= 0) return;
  const path = glyphPath(drawn, cx, cy, size, 1, WOBBLE, wave);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE.outline * THICK;
  ctx.strokeStyle = rgba(PALETTE.red, 0.9 * fade);
  ctx.stroke(path);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
}
