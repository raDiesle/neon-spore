import { drawBakedEgg } from "./instar-egg-baked.js";
import { SPOTS, SPOTS_NEST } from "./instar-egg-spots.js";
import { CLUTCH, NEST } from "./instar-eggs.js";
import { instarAt, type Point } from "./instar-place.js";
import { faded, type Look } from "./instar-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { blitFrame, type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's nests, baked** — the second example (`sprite-bake.ts`),
 * offered beside `drawNests` in `instar-eggs.ts` and drawing the same places.
 *
 * The shipped silk is a mound and four threads. Here it is a cocoon: a hundred
 * and sixty strands wound over the mound, clots where they bunch, and dew
 * caught on them in the light — a picture no frame could draw strand by strand,
 * and two blits because it was drawn once. **Two frames, a back and a front**:
 * the mound goes under the eggs and the threads that cross them over, so the
 * eggs sit *in* the silk. The slime under it stays one procedural ellipse,
 * because it is the venom's colour and the silk is the text's, and one sprite
 * takes one pair.
 */

/** The sprite's box in head radii about the nest's point: ±X across, TOP above, BOTTOM below. */
const X = 0.62;
const TOP = 0.46;
const BOTTOM = 0.16;

function frame(w: number, h: number): { ox: number; oy: number; s: number } {
  const s = h / (TOP + BOTTOM);
  return { ox: w / 2, oy: TOP * s, s };
}

/** A point on the mound's outline at angle `a` (π is the left foot, 2π the right). */
function onMound(ox: number, oy: number, s: number, a: number): [number, number] {
  return [ox + Math.cos(a) * 0.5 * s, oy + 0.05 * s + Math.sin(a) * 0.26 * s];
}

function strands(
  g: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  n: number,
  lift: number,
  alpha: number,
  seed: number,
): void {
  const rnd = spriteRng(seed);
  g.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const [ax, ay] = onMound(ox, oy, s, Math.PI * (1 + rnd() * 0.5));
    const [bx, by] = onMound(ox, oy, s, Math.PI * (1.5 + rnd() * 0.5));
    const mx = (ax + bx) / 2 + (rnd() - 0.5) * 0.2 * s;
    const my = Math.min(ay, by) - (0.1 + rnd() * lift) * s;
    g.strokeStyle = `rgba(255,255,255,${(alpha * (0.4 + rnd() * 0.6)).toFixed(3)})`;
    g.lineWidth = Math.max(0.5, s * (0.002 + rnd() * 0.006));
    g.beginPath();
    g.moveTo(ax, ay);
    g.quadraticCurveTo(mx, my, bx, by);
    g.stroke();
  }
}

function dew(
  g: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  n: number,
  seed: number,
): void {
  const rnd = spriteRng(seed);
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (1.05 + rnd() * 0.9);
    const d = 0.55 + rnd() * 0.45;
    const x = ox + Math.cos(a) * 0.5 * s * d;
    const y = oy + 0.05 * s + Math.sin(a) * 0.26 * s * d;
    const r = s * (0.006 + rnd() * 0.01);
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.beginPath();
    g.arc(x, y, r * 2.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.beginPath();
    g.arc(x - r * 0.3, y - r * 0.3, Math.max(0.6, r * 0.6), 0, Math.PI * 2);
    g.fill();
  }
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number, i: number): void {
  const { ox, oy, s } = frame(w, h);
  if (i === 1) {
    // The front: the four heavy threads over the eggs, and fine ones between.
    strands(g, ox, oy, s, 36, 0.22, 0.35, 5);
    g.strokeStyle = "rgba(255,255,255,0.55)";
    g.lineWidth = Math.max(1, s * 0.012);
    for (let k = 0; k < 4; k++) {
      const x = ox + (k - 1.5) * 0.26 * s;
      g.beginPath();
      g.moveTo(x - 0.2 * s, oy + 0.05 * s);
      g.quadraticCurveTo(x, oy - 0.42 * s, x + 0.22 * s, oy + 0.05 * s);
      g.stroke();
    }
    return;
  }
  // The back: the mound, filled translucent and wound over.
  const mound = new Path2D();
  mound.ellipse(ox, oy + 0.05 * s, 0.5 * s, 0.26 * s, 0, Math.PI, Math.PI * 2);
  mound.closePath();
  const fill = g.createLinearGradient(ox - 0.3 * s, oy - 0.25 * s, ox + 0.3 * s, oy + 0.05 * s);
  fill.addColorStop(0, "rgba(255,255,255,0.3)");
  fill.addColorStop(1, "rgba(150,150,150,0.1)");
  g.fillStyle = fill;
  g.fill(mound);
  strands(g, ox, oy, s, 160, 0.05, 0.22, 3);
  const rnd = spriteRng(9);
  for (let k = 0; k < 14; k++) {
    const [x, y] = onMound(ox, oy, s, Math.PI * (1.18 + rnd() * 0.64));
    g.fillStyle = "rgba(230,230,230,0.22)";
    g.beginPath();
    g.ellipse(
      x,
      y + 0.02 * s,
      s * (0.03 + rnd() * 0.04),
      s * (0.012 + rnd() * 0.015),
      rnd() - 0.5,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number, i: number): void {
  const { ox, oy, s } = frame(w, h);
  if (i === 1) {
    dew(g, ox, oy - 0.08 * s, s * 0.9, 8, 21);
    return;
  }
  g.strokeStyle = "rgba(255,255,255,0.3)";
  g.lineWidth = Math.max(1, s * 0.01);
  g.beginPath();
  g.ellipse(ox, oy + 0.05 * s, 0.47 * s, 0.24 * s, 0, Math.PI * 1.1, Math.PI * 1.55);
  g.stroke();
  dew(g, ox, oy, s, 22, 17);
}

export const NEST_SPRITE: SpriteSpec = {
  name: "instar-nest",
  frames: 2,
  aspect: (2 * X) / (TOP + BOTTOM),
  body: paintBody,
  light: paintLight,
};

/** The two nests, as `drawNests` places them, from the baked silk and eggs. */
export function drawBakedNests(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f } = look;
  drawNest(ctx, l, look, instarAt(l, f.nestX, f.nestY), Math.round(f.nest * NEST), SPOTS_NEST, 3);
  drawNest(ctx, l, look, instarAt(l, f.eggsX, f.eggsY), Math.round(f.eggs * CLUTCH), SPOTS, 7);
}

function drawNest(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  look: Look,
  at: Point,
  n: number,
  spots: readonly (readonly [number, number])[],
  seed: number,
): void {
  if (n <= 0) return;
  const { r, time, fade, threat } = look;
  ctx.fillStyle = faded(PALETTE.venom, fade, 0.22);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y + r * 0.06, r * 0.62, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  const h = r * (TOP + BOTTOM);
  const cy = at.y + ((BOTTOM - TOP) / 2) * r;
  const silk = tintedSprite(NEST_SPRITE, spritePx(h, l.dpr), PALETTE.text, PALETTE.text);
  blitFrame(ctx, silk, 0, at.x, cy, h, 0, fade);
  const rumble = 0.25 + 0.75 * threat;
  spots.slice(0, n).forEach(([dx, dy], i) => {
    const k = time * (24 + i) + i * 2.1 + seed;
    const x = at.x + dx * r + Math.sin(k) * r * 0.03 * rumble;
    const y = at.y + dy * r + Math.cos(k * 1.3) * r * 0.02 * rumble;
    const tilt = Math.sin(k * 0.5) * 0.2 * rumble;
    drawBakedEgg(ctx, x, y, r, tilt, fade, threat, time, i + seed, l.dpr);
  });
  blitFrame(ctx, silk, 1, at.x, cy, h, 0, fade);
}
