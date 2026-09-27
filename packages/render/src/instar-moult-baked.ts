import type { PaleSkin } from "./instar-moult.js";
import { fibres, veins, wrapped } from "./instar-moult-flesh.js";
import { drawWoundEdges } from "./instar-moult-wound.js";
import { PALETTE } from "./palette.js";
import { type Sprite, type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's moult as a wound, baked** — the fifth example
 * (`sprite-bake.ts`), and the second laid as a pattern
 * (`instar-hide-baked.ts`): the split along the back is raw flesh.
 *
 * The owner, 27 September 2026, on `instar:moult baked`: *this version is
 * better but not so recognisable — can we make it more visible, then build it
 * into the game? Maybe more like wounds and flesh and blood.* So the tile is
 * deep red and opaque. Muscle fibres run along the back, with soft folds
 * creased dark across them and veins branching over them. Blood pools dark
 * in the hollows. On the light layer are wet crowns, a slick sheen and a
 * glint on every bead, none of which a frame could afford to stroke along a
 * split that changes shape with every swipe. The tile turns with the back,
 * so the fibres always run along the body. The edges are per frame, because
 * only a frame knows where they are (`instar-moult-wound.ts`).
 *
 * The body layer is grey multiplied by `PALETTE.red`, so its dark greys are
 * the deep reds; the light layer is added in `PALETTE.redRim`.
 */

/** The tile is `ASPECT` heights wide; `FOLDS` folds run across it, each `WAVES` waves long. */
const ASPECT = 2;
const FOLDS = 3;
const WAVES = 2;
const BEADS = 14;
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

function beads(w: number, h: number): { x: number; y: number; s: number }[] {
  const rnd = spriteRng(37);
  return Array.from({ length: BEADS }, () => ({
    x: rnd() * w,
    y: rnd() * h,
    s: h * (0.018 + rnd() * 0.03),
  }));
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  // The flesh: opaque, so none of the pale skin shows through the wound.
  g.fillStyle = "rgb(120,120,120)";
  g.fillRect(0, 0, w, h);
  fibres(g, w, h, 53, 190);
  fibres(g, w, h, 59, 70);
  // Each crease: a soft dark trough, then its narrow bottom.
  g.lineCap = "round";
  g.strokeStyle = "#000";
  for (const fold of folds())
    for (const dy of [-1, 0, 1]) {
      g.lineWidth = h * 0.09;
      crease(g, fold, w, h, dy, 0.35);
      g.lineWidth = h * 0.03;
      crease(g, fold, w, h, dy, 0.6);
    }
  veins(g, w, h);
  // Blood standing in the hollows: dark beads, the deepest red on the tile.
  g.fillStyle = "rgb(55,55,55)";
  for (const { x, y, s } of beads(w, h))
    wrapped(w, h, (dx, dy) => {
      g.beginPath();
      g.ellipse(x + dx, y + dy, s * 1.3, s, 0, 0, Math.PI * 2);
      g.fill();
    });
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.lineCap = "round";
  g.strokeStyle = "#fff";
  // The crown of each fold, just above its crease, wet under the key.
  for (const fold of folds())
    for (const dy of [-1, 0, 1]) {
      g.lineWidth = h * 0.025;
      crease(g, fold, w, h, dy - 0.05, 0.55);
    }
  // A slick in soft patches, where the flesh is wettest.
  const rnd = spriteRng(43);
  for (let i = 0; i < 5; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const s = h * (0.2 + rnd() * 0.2);
    wrapped(w, h, (dx, dy) => {
      const wet = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, s);
      wet.addColorStop(0, "rgba(255,255,255,0.22)");
      wet.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = wet;
      g.fillRect(x + dx - s, y + dy - s, s * 2, s * 2);
    });
  }
  // Every bead of blood catches one hard glint up and to the left.
  g.fillStyle = "rgba(255,255,255,0.9)";
  for (const { x, y, s } of beads(w, h))
    wrapped(w, h, (dx, dy) => {
      g.beginPath();
      g.arc(x + dx - s * 0.45, y + dy - s * 0.35, s * 0.35, 0, Math.PI * 2);
      g.fill();
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

/**
 * The flesh laid over the split, turned along the back, then its edges. A
 * split too small to bake, or a canvas with no patterns, gets `paint`
 * instead: the pale skin as it was drawn before.
 */
export function drawBakedPale(
  ctx: CanvasRenderingContext2D,
  skin: PaleSkin,
  paint: (ctx: CanvasRenderingContext2D, skin: PaleSkin) => void,
  dpr: number,
): void {
  const { pale, back, crest, r, fade } = skin;
  const tileH = TILE * r;
  if (tileH < 2 || fade <= 0) {
    paint(ctx, skin);
    return;
  }
  const tile = tintedSprite(PALE_SPRITE, spritePx(tileH, dpr), PALETTE.red, PALETTE.redRim);
  const pattern = patternOf(ctx, tile);
  if (!pattern) {
    paint(ctx, skin);
    return;
  }
  const a = back[0] ?? crest;
  const b = back[back.length - 1] ?? crest;
  const k = tileH / tile.h;
  ctx.save();
  ctx.clip(pale);
  ctx.save();
  ctx.translate(crest.x, crest.y);
  ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
  ctx.scale(k, k);
  ctx.globalAlpha *= fade;
  ctx.fillStyle = pattern;
  const reach = (r * 3) / k;
  ctx.fillRect(-reach, -reach, reach * 2, reach * 2);
  ctx.restore();
  ctx.restore();
  drawWoundEdges(ctx, skin);
}
