import { drawEggCrack } from "./instar-egg-crack.js";
import { PALETTE } from "./palette.js";
import { blitFrame, type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's egg, baked** — the first example of detail drawn once at load
 * (`sprite-bake.ts`), offered beside the shipped egg (`instar-eggs.ts`) and not
 * in place of it. Its sheet is `bun run sprite instar-egg`.
 *
 * The shipped egg is a fill, a clip, a radial gradient built fresh, a stroke
 * and a glow, per egg per frame, and a nest holds up to sixteen. This one has
 * more in it than that could ever afford — a shell lit through on the key's
 * side, veins, speckle, a hatchling curled dark inside with its wing bud and
 * its eye, a rim of light — and costs one blit.
 *
 * **Four frames, the hatchling stirring**: curled tight, shifting, pushing
 * its head up, eye open. The window picks the frame (`stirAt`); the shiver,
 * the tilt and the tumble of a falling egg are the transform it is blitted
 * under, not frames. The crack stays procedural on top (`instar-egg-crack.ts`),
 * because it moves with time and the window both.
 */

/** An egg's half-width and half-height, in head radii — the shipped egg's. */
const EGG_W = 0.1;
const EGG_H = 0.13;
/** The sprite's height over the egg's: room for the glow round the shell. */
const PAD = 1.4;

/** Which of the four frames the window is at, 0..3. */
export function stirAt(threat: number): number {
  return Math.min(3, Math.floor(Math.max(0, threat) * 4));
}

function shell(w: number, h: number): [number, number, number, number] {
  const ey = h / 2 / PAD;
  return [w / 2, h / 2, ey * (EGG_W / EGG_H), ey];
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number, i: number): void {
  const [cx, cy, ex, ey] = shell(w, h);
  const p = new Path2D();
  p.ellipse(cx, cy, ex, ey, 0, 0, Math.PI * 2);
  // The shell, lit through on the key's side and deep toward the far one.
  const lit = g.createRadialGradient(cx - ex * 0.35, cy - ey * 0.4, 0, cx, cy, ey * 1.1);
  lit.addColorStop(0, "#ffffff");
  lit.addColorStop(0.45, "#d4d4d4");
  lit.addColorStop(0.8, "#868686");
  lit.addColorStop(1, "#404040");
  g.fillStyle = lit;
  g.fill(p);
  g.save();
  g.clip(p);
  const rnd = spriteRng(11);
  // Veins from the rim toward the middle, forking once.
  g.strokeStyle = "rgba(24,24,24,0.4)";
  g.lineCap = "round";
  for (let v = 0; v < 6; v++) {
    const a = (v / 6) * Math.PI * 2 + rnd();
    let x = cx + Math.cos(a) * ex;
    let y = cy + Math.sin(a) * ey;
    let dir = a + Math.PI + (rnd() - 0.5);
    g.lineWidth = Math.max(0.6, h * 0.012);
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 7; s++) {
      dir += (rnd() - 0.5) * 0.9;
      x += Math.cos(dir) * ey * 0.1;
      y += Math.sin(dir) * ey * 0.1;
      g.lineTo(x, y);
      if (s === 3) {
        const fx = x + Math.cos(dir + 0.9) * ey * 0.18;
        const fy = y + Math.sin(dir + 0.9) * ey * 0.18;
        g.lineTo(fx, fy);
        g.moveTo(x, y);
      }
    }
    g.stroke();
  }
  // Speckle.
  for (let s = 0; s < 46; s++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd());
    g.fillStyle = `rgba(30,30,30,${(0.25 + rnd() * 0.35).toFixed(2)})`;
    g.beginPath();
    g.arc(
      cx + Math.cos(a) * ex * d,
      cy + Math.sin(a) * ey * d,
      h * (0.004 + rnd() * 0.01),
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  hatchling(g, cx, cy, ey, i);
  // The far side of the shell, deeper again.
  const deep = g.createRadialGradient(
    cx + ex * 0.5,
    cy + ey * 0.55,
    0,
    cx + ex * 0.5,
    cy + ey * 0.55,
    ey,
  );
  deep.addColorStop(0, "rgba(0,0,0,0.35)");
  deep.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = deep;
  g.fillRect(cx - ex, cy - ey, ex * 2, ey * 2);
  g.restore();
  g.strokeStyle = "rgba(0,0,0,0.55)";
  g.lineWidth = Math.max(1, h * 0.022);
  g.stroke(p);
}

/** The hatchling, seen dark through the shell: a coil that loosens frame by
 * frame, its head coming up to the top of the egg. */
function hatchling(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  ey: number,
  i: number,
): void {
  const k = i / 3;
  const ox = cx + ey * 0.04;
  const oy = cy + ey * (0.12 - 0.08 * k);
  const rad = ey * (0.34 + 0.06 * k);
  const a0 = Math.PI * (0.35 + 0.35 * k);
  const a1 = Math.PI * (1.95 - 0.25 * k);
  for (const [spread, alpha] of [
    [1.6, 0.22],
    [1, 0.75],
  ] as const) {
    g.strokeStyle = `rgba(18,18,18,${alpha})`;
    // The body tapers toward the tail: three strokes, each shorter and wider.
    for (let s = 0; s < 3; s++) {
      g.lineWidth = ey * (0.1 + 0.05 * s) * spread;
      g.beginPath();
      g.arc(ox, oy, rad, a0 + (a1 - a0) * s * 0.28, a1);
      g.stroke();
    }
    const hx = ox + Math.cos(a1) * rad;
    const hy = oy + Math.sin(a1) * rad - ey * 0.12 * k;
    g.fillStyle = `rgba(18,18,18,${alpha})`;
    g.beginPath();
    g.ellipse(hx, hy, ey * 0.16 * spread, ey * 0.12 * spread, a1 + Math.PI / 2, 0, Math.PI * 2);
    g.fill();
    // A wing bud off the back.
    const bx = ox + Math.cos((a0 + a1) / 2) * rad;
    const by = oy + Math.sin((a0 + a1) / 2) * rad;
    g.beginPath();
    g.moveTo(bx, by);
    g.lineTo(bx - ey * 0.22, by - ey * (0.1 + 0.12 * k));
    g.lineTo(bx - ey * 0.06, by + ey * 0.08);
    g.closePath();
    g.fill();
  }
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number, i: number): void {
  const [cx, cy, ex, ey] = shell(w, h);
  const p = new Path2D();
  p.ellipse(cx, cy, ex, ey, 0, 0, Math.PI * 2);
  // The glow round the shell: layered strokes, never a blur.
  for (const [width, alpha] of [
    [0.09, 0.08],
    [0.05, 0.16],
    [0.02, 0.5],
  ] as const) {
    g.strokeStyle = `rgba(255,255,255,${alpha})`;
    g.lineWidth = h * width;
    g.stroke(p);
  }
  g.save();
  g.clip(p);
  const through = g.createRadialGradient(
    cx - ex * 0.3,
    cy - ey * 0.35,
    0,
    cx - ex * 0.3,
    cy - ey * 0.35,
    ey * 0.9,
  );
  through.addColorStop(0, "rgba(255,255,255,0.35)");
  through.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = through;
  g.fillRect(cx - ex, cy - ey, ex * 2, ey * 2);
  g.restore();
  // The rim on the key's side, and the specular: a soft spot and a sharp one.
  g.strokeStyle = "rgba(255,255,255,0.75)";
  g.lineWidth = Math.max(1, h * 0.014);
  g.beginPath();
  g.ellipse(cx, cy, ex * 0.94, ey * 0.95, 0, Math.PI * 1.02, Math.PI * 1.62);
  g.stroke();
  const sx = cx - ex * 0.4;
  const sy = cy - ey * 0.5;
  const spot = g.createRadialGradient(sx, sy, 0, sx, sy, ex * 0.35);
  spot.addColorStop(0, "rgba(255,255,255,0.8)");
  spot.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = spot;
  g.fillRect(sx - ex * 0.35, sy - ex * 0.35, ex * 0.7, ex * 0.7);
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.arc(sx, sy, Math.max(0.8, h * 0.014), 0, Math.PI * 2);
  g.fill();
  if (i < 2) return;
  // The eye, open once it stirs.
  const k = i / 3;
  const a1 = Math.PI * (1.95 - 0.25 * k);
  const rad = ey * (0.34 + 0.06 * k);
  const hx = cx + ey * 0.04 + Math.cos(a1) * rad;
  const hy = cy + ey * (0.12 - 0.08 * k) + Math.sin(a1) * rad - ey * 0.12 * k;
  g.fillStyle = `rgba(255,255,255,${i === 3 ? 1 : 0.6})`;
  g.beginPath();
  g.arc(hx + ey * 0.05, hy - ey * 0.02, Math.max(0.8, ey * 0.035), 0, Math.PI * 2);
  g.fill();
}

export const EGG_SPRITE: SpriteSpec = {
  name: "instar-egg",
  frames: 4,
  aspect: (EGG_W / EGG_H) * 1.12,
  body: paintBody,
  light: paintLight,
};

/** One egg, baked: the shipped egg's place, size and tilt, one blit and its crack. */
export function drawBakedEgg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  tilt: number,
  fade: number,
  threat: number,
  time: number,
  turn: number,
  dpr: number,
): void {
  const h = r * EGG_H * 2 * PAD;
  const s = tintedSprite(EGG_SPRITE, spritePx(h, dpr), PALETTE.bile, PALETTE.bileRim);
  blitFrame(ctx, s, stirAt(threat), x, y, h, tilt, fade);
  drawEggCrack(ctx, x, y, r * EGG_W, r * EGG_H, tilt, threat, fade, time, turn);
}
