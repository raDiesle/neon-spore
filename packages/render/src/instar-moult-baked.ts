import type { PaleSkin } from "./instar-moult.js";
import { PALETTE } from "./palette.js";
import { type Sprite, type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's new body, baked** — the fifth example (`sprite-bake.ts`), and
 * the second laid as a pattern (`instar-hide-baked.ts`): the pale skin in the
 * moult's split, crumpled and wet as it comes out of the old hide.
 *
 * `instar-moult.ts` fills the split with two flat colours. Here the fill keeps
 * them and lays over it a tile of soft folds running along the back, each
 * with its crease dark and its crown catching the light, short wrinkles
 * across them, and beads of wet standing on the skin — none of which a frame
 * could afford to stroke along a split that changes shape with every swipe.
 * The tile turns with the back, so the folds always run along the body.
 *
 * Not drawn by the game: offered in VERSUS on `instar:moult`
 * (`tools/versus/candidates/instar-moult/baked`).
 */

/** The tile is `ASPECT` heights wide; `FOLDS` folds run across it, each `WAVES` waves long. */
const ASPECT = 2;
const FOLDS = 3;
const WAVES = 2;
const BEADS = 16;
/** How tall the tile plays, in head radii. */
const TILE = 0.42;

interface Fold {
  y: number;
  a: number;
  b: number;
  p: number;
  q: number;
}

function folds(): Fold[] {
  const rnd = spriteRng(31);
  return Array.from({ length: FOLDS }, (_, i) => ({
    y: (i + 0.3 + rnd() * 0.4) / FOLDS,
    a: 0.03 + rnd() * 0.05,
    b: 0.01 + rnd() * 0.02,
    p: rnd() * Math.PI * 2,
    q: rnd() * Math.PI * 2,
  }));
}

/**
 * A fold's crease across the tile, `dy` heights down: whole waves, so it
 * meets itself at the seam, and deepest where `f.p` puts it, shallowing to
 * nothing between — a fold that runs out and starts again, not a stripe.
 */
function crease(
  g: CanvasRenderingContext2D,
  fold: Fold,
  w: number,
  h: number,
  dy: number,
  alpha: number,
): void {
  const k = (Math.PI * 2) / w;
  const at = (x: number): number =>
    (fold.y +
      dy +
      fold.a * Math.sin(WAVES * k * x + fold.p) +
      fold.b * Math.sin(3 * k * x + fold.q)) *
    h;
  const step = w / 48;
  // Butt ends: round ones overlap where the segments meet and bead the line.
  g.lineCap = "butt";
  for (let x = 0; x < w; x += step) {
    const deep = Math.max(0, Math.sin(k * x + fold.q)) ** 1.5;
    if (deep < 0.02) continue;
    g.globalAlpha = alpha * deep;
    g.beginPath();
    g.moveTo(x, at(x));
    g.lineTo(x + step, at(x + step));
    g.stroke();
  }
  g.globalAlpha = 1;
  g.lineCap = "round";
}

/** Every mark at each wrap it could reach across, so the tile has no edge. */
function wrapped(w: number, h: number, draw: (dx: number, dy: number) => void): void {
  for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) draw(dx, dy);
}

function beads(w: number, h: number): { x: number; y: number; s: number }[] {
  const rnd = spriteRng(37);
  return Array.from({ length: BEADS }, () => ({
    x: rnd() * w,
    y: rnd() * h,
    s: h * (0.015 + rnd() * 0.025),
  }));
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.lineCap = "round";
  // Each crease: a soft dark trough, then its narrow bottom.
  for (const fold of folds())
    for (const dy of [-1, 0, 1]) {
      g.strokeStyle = "#fff";
      g.lineWidth = h * 0.09;
      crease(g, fold, w, h, dy, 0.3);
      g.lineWidth = h * 0.035;
      crease(g, fold, w, h, dy, 0.4);
      g.lineWidth = h * 0.01;
      crease(g, fold, w, h, dy, 0.6);
    }
  // Short wrinkles across the folds, where the skin bunched as it came out.
  const rnd = spriteRng(41);
  g.strokeStyle = "rgba(255,255,255,0.3)";
  g.lineWidth = h * 0.006;
  for (let i = 0; i < 12; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const len = h * (0.06 + rnd() * 0.08);
    const bend = (rnd() - 0.5) * len;
    wrapped(w, h, (dx, dy) => {
      g.beginPath();
      g.moveTo(x + dx, y + dy - len / 2);
      g.quadraticCurveTo(x + dx + bend, y + dy, x + dx, y + dy + len / 2);
      g.stroke();
    });
  }
  // A shadow under each bead of wet.
  g.fillStyle = "rgba(255,255,255,0.5)";
  for (const { x, y, s } of beads(w, h))
    wrapped(w, h, (dx, dy) => {
      g.beginPath();
      g.ellipse(x + dx + s * 0.2, y + dy + s * 0.4, s, s * 0.8, 0, 0, Math.PI * 2);
      g.fill();
    });
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.lineCap = "round";
  // The crown of each fold, just above its crease, catches the key.
  for (const fold of folds())
    for (const dy of [-1, 0, 1]) {
      g.strokeStyle = "#fff";
      g.lineWidth = h * 0.03;
      crease(g, fold, w, h, dy - 0.05, 0.5);
    }
  // A wet sheen in soft patches, where the skin is still slick.
  const rnd = spriteRng(43);
  for (let i = 0; i < 5; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const s = h * (0.2 + rnd() * 0.2);
    wrapped(w, h, (dx, dy) => {
      const wet = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, s);
      wet.addColorStop(0, "rgba(255,255,255,0.18)");
      wet.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = wet;
      g.fillRect(x + dx - s, y + dy - s, s * 2, s * 2);
    });
  }
  // The beads: a lit drop with a hard glint.
  for (const { x, y, s } of beads(w, h))
    wrapped(w, h, (dx, dy) => {
      const cx = x + dx;
      const cy = y + dy;
      const drop = g.createRadialGradient(cx - s * 0.3, cy - s * 0.3, 0, cx, cy, s);
      drop.addColorStop(0, "rgba(255,255,255,0.9)");
      drop.addColorStop(0.35, "rgba(255,255,255,0.35)");
      drop.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = drop;
      g.fillRect(cx - s, cy - s, s * 2, s * 2);
    });
}

export const PALE_SPRITE: SpriteSpec = {
  name: "instar-moult",
  frames: 1,
  aspect: ASPECT,
  body: paintBody,
  light: paintLight,
};

const patterns = new WeakMap<Sprite, CanvasPattern | null>();

function patternOf(ctx: CanvasRenderingContext2D, s: Sprite): CanvasPattern | null {
  if (!patterns.has(s)) patterns.set(s, ctx.createPattern(s.canvas, "repeat"));
  return patterns.get(s) ?? null;
}

/** `paint` first — the shipped two fills — then the baked folds over the split, turned along the back: one fill. */
export function drawBakedPale(
  ctx: CanvasRenderingContext2D,
  skin: PaleSkin,
  paint: (ctx: CanvasRenderingContext2D, skin: PaleSkin) => void,
  dpr: number,
): void {
  paint(ctx, skin);
  const { pale, back, crest, r, fade, breath } = skin;
  const tileH = TILE * r;
  if (tileH < 2 || fade <= 0) return;
  const tile = tintedSprite(PALE_SPRITE, spritePx(tileH, dpr), PALETTE.sheenMid, PALETTE.text);
  const pattern = patternOf(ctx, tile);
  if (!pattern) return;
  const a = back[0] ?? crest;
  const b = back[back.length - 1] ?? crest;
  const k = tileH / tile.h;
  ctx.save();
  ctx.clip(pale);
  ctx.translate(crest.x, crest.y);
  ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
  ctx.scale(k, k);
  ctx.globalAlpha *= fade * breath;
  ctx.fillStyle = pattern;
  const reach = (r * 3) / k;
  ctx.fillRect(-reach, -reach, reach * 2, reach * 2);
  ctx.restore();
}
