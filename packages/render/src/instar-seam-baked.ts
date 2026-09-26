import type { BodyRing } from "./instar-profile.js";
import { PALETTE } from "./palette.js";
import { type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's body rings, baked** — the sixth example (`sprite-bake.ts`):
 * where two segments of the long body meet, side-on (`instar-profile.ts`).
 *
 * `drawProfile` strokes each ring as one glowing line from the back's edge to
 * the belly's. Here the ring is a joint in armour: a dark groove where the two
 * segments part, the lip of the rear one standing proud of it with its crown
 * lit from above, a row of knobs along the lip, and the whole of it fading
 * into shadow toward the belly and out at both ends, so it sits on the tube
 * rather than across it. Painted once in the ring's own frame — down is back
 * to belly, across is toward the rear — and drawn in one `drawImage` under the
 * map the ring's two ends give.
 *
 * Not drawn by the game: offered in VERSUS on `instar:seam`
 * (`tools/versus/candidates/instar-seam/baked`).
 */

/** Half the painting's width, in ring heights; the bow of the joint toward the rear. */
const HALF = 0.22;
const BOW = 0.08;
const KNOBS = 6;

/** Where the joint runs at height `v` (0 the back, 1 the belly), across, in ring heights. */
function joint(v: number): number {
  return BOW * 4 * v * (1 - v);
}

/** The painting's frame: ring heights onto a `w` × `h` box, the joint's line at `x = 0`. */
function frame(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.scale(w / (HALF * 2), h);
  g.translate(HALF, 0);
}

/** How strongly the ring shows at height `v`: out at both ends, dimmer toward the belly. */
function reach(v: number): number {
  const ends = Math.min(1, v / 0.12, (1 - v) / 0.12);
  return Math.max(0, ends) * (1 - 0.55 * v);
}

/** The joint as a band `from`..`to` ring heights across it, `v` by `v`. */
function band(
  g: CanvasRenderingContext2D,
  from: number,
  to: number,
  alpha: (v: number) => number,
): void {
  const steps = 64;
  for (let i = 0; i < steps; i++) {
    const v = i / steps;
    const u = (i + 1) / steps;
    g.globalAlpha = alpha((v + u) / 2);
    g.beginPath();
    g.moveTo(joint(v) + from, v);
    g.lineTo(joint(u) + from, u);
    g.lineTo(joint(u) + to, u);
    g.lineTo(joint(v) + to, v);
    g.closePath();
    g.fill();
  }
  g.globalAlpha = 1;
}

function knobs(): { v: number; s: number }[] {
  const rnd = spriteRng(53);
  return Array.from({ length: KNOBS }, (_, i) => ({
    v: (i + 0.6 + rnd() * 0.3) / (KNOBS + 0.5),
    s: 0.018 + rnd() * 0.01,
  }));
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  // The lip of the rear segment: its face shades off toward the rear.
  g.fillStyle = "#fff";
  for (let k = 0; k < 6; k++)
    band(g, 0.012 + k * 0.02, 0.032 + k * 0.02, (v) => reach(v) * 0.8 * (1 - k / 7));
  // The groove where the segments part: ink, soft at its edges.
  g.fillStyle = "#000";
  band(g, -0.045, 0.012, (v) => reach(v) * 0.6);
  band(g, -0.02, 0.01, (v) => reach(v));
  // The shadow the lip throws forward onto the front segment.
  band(g, -0.1, -0.045, (v) => reach(v) * 0.35);
  // Knobs along the lip, each with its shadow under it.
  for (const { v, s } of knobs()) {
    const x = joint(v) + 0.045;
    g.globalAlpha = reach(v) * 0.6;
    g.fillStyle = "#000";
    g.beginPath();
    g.ellipse(x + s * 0.3, v + s * 0.5, s, s * 0.8, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(x, v, s, s * 0.85, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  // The crown of the lip catches the key, strongest up on the back.
  g.fillStyle = "#fff";
  band(g, 0.012, 0.026, (v) => reach(v) * (1 - 0.6 * v));
  band(g, 0.004, 0.05, (v) => reach(v) * 0.45 * (1 - v));
  // A glint on the top of each knob.
  for (const { v, s } of knobs()) {
    const x = joint(v) + 0.045 - s * 0.3;
    const y = v - s * 0.35;
    const glint = g.createRadialGradient(x, y, 0, x, y, s * 0.7);
    glint.addColorStop(0, `rgba(255,255,255,${(0.9 * reach(v)).toFixed(3)})`);
    glint.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = glint;
    g.fillRect(x - s, y - s, s * 2, s * 2);
  }
}

export const SEAM_SPRITE: SpriteSpec = {
  name: "instar-seam",
  frames: 1,
  aspect: HALF * 2,
  body: paintBody,
  light: paintLight,
};

/** The ring drawn from the baked joint, stretched between its two ends: one draw. */
export function drawBakedSeam(ctx: CanvasRenderingContext2D, ring: BodyRing, dpr: number): void {
  const { top, bottom, fade } = ring;
  const dx = bottom.x - top.x;
  const dy = bottom.y - top.y;
  const tall = Math.hypot(dx, dy);
  if (tall < 2 || fade <= 0) return;
  const s = tintedSprite(SEAM_SPRITE, spritePx(tall, dpr), PALETTE.hull, PALETTE.hullRim);
  ctx.save();
  // Across is down turned a quarter toward the rear: the body runs to the right.
  ctx.transform(dy, -dx, dx, dy, top.x, top.y);
  ctx.globalAlpha *= fade;
  ctx.drawImage(s.canvas, 0, 0, s.w, s.h, -HALF, 0, HALF * 2, 1);
  ctx.restore();
}
