import type { Form } from "./instar-hide.js";
import { PALETTE } from "./palette.js";
import { type Sprite, type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's hide, baked** — the third example (`sprite-bake.ts`), and the
 * first laid as a **pattern** rather than blitted at a point: a tile of
 * scales that repeats without a seam, filled over a plate in one call.
 *
 * `drawScales` in `instar-hide.ts` strokes each scale as one arc, a row at a
 * time. Here every scale is a lit shape: a keel down its middle, a shadow
 * under its free edge where it laps the next, a rim, a glint, and a pit or
 * two — each a little different, from a seeded stream — none of which a frame
 * could afford to stroke over a whole body. It takes the same plate, `Form`
 * and scale size as `drawScales`, so a caller can offer one for the other.
 *
 * Not drawn by the game: offered in VERSUS on every plate `drawScales` lays
 * (`tools/versus/candidates/instar-hide/baked`). The side tube's scales are
 * laid round its rings instead (`instar-profile-surface.ts`) and keep theirs.
 */

/** Scales across one tile, and rows down it; rows are `ROW` scales apart and every other is half a scale along. */
const COLS = 4;
const ROWS = 4;
const ROW = 0.8;

/** Where the scales go in a `w` × `h` tile: centre and size, wrapped so the tile repeats. */
function scales(w: number, h: number): { x: number; y: number; s: number; k: number }[] {
  const s = w / COLS;
  const out: { x: number; y: number; s: number; k: number }[] = [];
  const rnd = spriteRng(11);
  for (let j = 0; j < ROWS; j++)
    for (let i = 0; i < COLS; i++) {
      const k = rnd();
      const x = (i + (j % 2) * 0.5) * s;
      const y = (j + 0.5) * ROW * s;
      // Drawn at every wrap it could reach across, so the tile has no edge.
      for (const dx of [-w, 0, w])
        for (const dy of [-h, 0, h]) out.push({ x: x + dx, y: y + dy, s, k });
    }
  // Bottom row first: each row's free edge laps over the root of the one below.
  return out.sort((a, b) => b.y - a.y);
}

/** One scale's outline: a shield with its point down the body, `s` across. */
function outline(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.moveTo(x - s * 0.6, y - s * 0.4);
  p.bezierCurveTo(x - s * 0.66, y + s * 0.15, x - s * 0.35, y + s * 0.5, x, y + s * 0.66);
  p.bezierCurveTo(x + s * 0.35, y + s * 0.5, x + s * 0.66, y + s * 0.15, x + s * 0.6, y - s * 0.4);
  p.closePath();
  return p;
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  for (const { x, y, s, k } of scales(w, h)) {
    const p = outline(x, y, s);
    // The lap: a shadow on the scale below, under this one's free edge.
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.save();
    g.translate(0, s * 0.08);
    g.fill(p);
    g.restore();
    const fill = g.createLinearGradient(x, y - s * 0.35, x, y + s * 0.62);
    const top = Math.round(150 + 60 * k);
    fill.addColorStop(0, `rgb(${top},${top},${top})`);
    fill.addColorStop(1, "rgb(90,90,90)");
    g.fillStyle = fill;
    g.fill(p);
    // The keel, and the pits.
    g.strokeStyle = "rgba(255,255,255,0.35)";
    g.lineWidth = Math.max(0.5, s * 0.04);
    g.beginPath();
    g.moveTo(x, y - s * 0.25);
    g.lineTo(x, y + s * 0.45);
    g.stroke();
    g.fillStyle = "rgba(0,0,0,0.5)";
    for (let d = 0; d < 1 + Math.floor(k * 2.5); d++) {
      g.beginPath();
      g.arc(x + (d - 0.5) * s * 0.22, y + s * (0.1 + 0.12 * d), s * 0.025, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "rgba(0,0,0,0.7)";
    g.lineWidth = Math.max(0.5, s * 0.05);
    g.stroke(p);
  }
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  for (const { x, y, s, k } of scales(w, h)) {
    g.strokeStyle = `rgba(255,255,255,${(0.35 + 0.4 * k).toFixed(3)})`;
    g.lineWidth = Math.max(0.5, s * 0.05);
    g.beginPath();
    g.moveTo(x - s * 0.5, y - s * 0.28);
    g.quadraticCurveTo(x - s * 0.52, y + s * 0.2, x - s * 0.2, y + s * 0.42);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)";
    g.beginPath();
    g.arc(x - s * 0.22, y - s * 0.12, Math.max(0.5, s * 0.05), 0, Math.PI * 2);
    g.fill();
  }
}

export const HIDE_SPRITE: SpriteSpec = {
  name: "instar-hide",
  frames: 1,
  aspect: COLS / (ROWS * ROW),
  body: paintBody,
  light: paintLight,
};

const patterns = new WeakMap<Sprite, CanvasPattern | null>();

function patternOf(ctx: CanvasRenderingContext2D, s: Sprite): CanvasPattern | null {
  if (!patterns.has(s)) patterns.set(s, ctx.createPattern(s.canvas, "repeat"));
  return patterns.get(s) ?? null;
}

/** The scales over plate `p`, as `drawScales` lays them, from the baked tile: one fill. */
export function drawBakedScales(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  form: Form,
  size: number,
  fade: number,
  dpr: number,
): void {
  if (size < 2 || fade <= 0) return;
  const tileH = ROWS * ROW * size;
  const tile = tintedSprite(HIDE_SPRITE, spritePx(tileH, dpr), PALETTE.hullRim, PALETTE.text);
  const pattern = patternOf(ctx, tile);
  if (!pattern) return;
  const ry = form.ry ?? form.r;
  const k = tileH / tile.h;
  ctx.save();
  ctx.clip(p);
  ctx.translate(form.x, form.y);
  ctx.rotate(form.angle ?? 0);
  ctx.scale(k, k);
  ctx.globalAlpha *= 0.4 * fade;
  ctx.fillStyle = pattern;
  ctx.fillRect(-form.r / k, -ry / k, (form.r * 2) / k, (ry * 2) / k);
  ctx.restore();
}
