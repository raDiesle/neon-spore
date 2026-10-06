import type { SimConfig } from "@neon-spore/sim";
import { flueCentre, flueEmberAt, flueEmberR, flueSlotHalf } from "./flue-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { neonHue } from "./splash-blob.js";

/**
 * **What the screen without the spore sees in the gullet**: a neon rainbow
 * fluid running the flue's whole length, and now and then a spore that is
 * not there. The owner, 6 October 2026: *for p2 show in the area where ball
 * moves left and right some visual, that it's unclear where ball is … show
 * like indifferences of where ball is right now and some neon rainbow fluid
 * colouring across full horizontal pipe*.
 *
 * **THE GAUGE's mirage again** (`gauge-mirage.ts`): it says nothing true, on
 * purpose. Nothing here is handed the flue's state — not where the spore is,
 * not which way it runs — so a frame of it is the same wherever the real one
 * is, and the only way to the spore stays the partner's voice. The phantoms
 * are drawn from a hash of the render clock, and are plainly ghosts: split in
 * two and shivering, hollow, additive and in every colour but the spore's.
 *
 * Only on a screen that is not shown the spore (`showsFlueEmber`); the fluid
 * runs low between levels and the phantoms only while a level is lit.
 */

/** Seconds the hue wheel takes to flow once along the gullet. */
const FLOW = 2.2;
/** Colour stops along the gullet: one and a half wheels across it. */
const STOPS = 9;
const WHEELS = 1.5;
/** Bright slugs of fluid, half of them running each way. */
const SLUGS = 6;
/** How long a slug is against how tall, and how far it reaches in tiles. */
const SLUG_STRETCH = 3.2;
const SLUG_R = 0.42;
/** Phantom spores that may be up at once, and the seconds one lives. */
const PHANTOMS = 3;
const PHANTOM_LIFE = 0.85;
/** One life in this many is skipped, so a phantom is a *sometimes*. */
const SKIP_ONE_IN = 3;
/** How far a phantom drifts in its life, in columns, either way. */
const DRIFT = 1.4;
/** How far its two halves split, as a share of the spore's radius. */
const SPLIT = 0.3;

/** A coin for phantom `k`'s life `n`: the same frame twice, never the state. */
function coin(n: number, k: number, salt: number): number {
  let h = (n * 374761393 + k * 668265263 + salt * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * The fluid in the gullet, under the marks. `slot` is the gullet's own path,
 * so the colour stays inside it, with a faint glow spilling over its lips.
 */
export function drawFlueMirageFluid(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  slot: Path2D,
  lit: boolean,
  time: number,
): void {
  const c = flueCentre(l, cfg);
  const half = flueSlotHalf(l, cfg) + l.tile * 0.3;
  const x0 = c.x - half;
  const x1 = c.x + half;
  const strength = lit ? 1 : 0.45;
  const flow = (time / FLOW) * 360;
  const wash = ctx.createLinearGradient(x0, c.y, x1, c.y);
  for (let i = 0; i < STOPS; i++) {
    const u = i / (STOPS - 1);
    wash.addColorStop(u, neonHue(u * 360 * WHEELS - flow, 0.85, 1));
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The glow over the lips first, so the gullet reads as lit from inside.
  ctx.globalAlpha = 0.22 * strength;
  ctx.lineWidth = l.tile * 0.32;
  ctx.strokeStyle = wash;
  ctx.stroke(slot);
  ctx.clip(slot);
  ctx.globalAlpha = 0.42 * strength;
  ctx.fillStyle = wash;
  ctx.fillRect(x0, c.y - l.tile, x1 - x0, l.tile * 2);
  // Slugs running both ways through it, so it moves like a fluid and not a
  // stripe: each in the colour of where it is, a little ahead of the wash.
  const reach = SLUG_R * l.tile;
  for (let i = 0; i < SLUGS; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const speed = 0.12 + 0.05 * i;
    const run = (((i * 0.37 + dir * time * speed) % 1) + 1) % 1;
    const x = x0 + run * (x1 - x0);
    const hue = run * 360 * WHEELS - flow + 40;
    ctx.save();
    ctx.translate(x, c.y + Math.sin(time * 3.1 + i) * l.tile * 0.05);
    ctx.scale(SLUG_STRETCH, 1);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
    g.addColorStop(0, rgba(neonHue(hue, 0.75, 1), 0.7 * strength));
    g.addColorStop(1, rgba(neonHue(hue, 1, 1), 0));
    ctx.fillStyle = g;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(0, 0, reach, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * The phantoms, where the real spore would be drawn on the other screen: a
 * spore that is not there, up for under a second somewhere along the gullet,
 * drifting, split and shivering. Only while a level is lit.
 */
export function drawFlueMiragePhantoms(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
): void {
  const r = flueEmberR(l);
  const span = cfg.flueSpanMilli;
  ctx.save();
  for (let k = 0; k < PHANTOMS; k++) {
    const life = PHANTOM_LIFE * (1 + 0.3 * k);
    const run = time / life + k * 0.41;
    const n = Math.floor(run);
    if (Math.floor(coin(n, k, 1) * SKIP_ONE_IN) === 0) continue;
    const f = run - n;
    const env = Math.sin(Math.PI * f) ** 2;
    const from = (coin(n, k, 2) * 2 - 1) * span;
    const milli = from + (coin(n, k, 3) * 2 - 1) * DRIFT * 1000 * f;
    const at = flueEmberAt(l, cfg, Math.max(-span, Math.min(span, milli)));
    const hue = coin(n, k, 4) * 360 + time * 140;
    // A shadow cut out of the fluid first, so a phantom is a shape against it
    // and not one more colour in it.
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = env * 0.7;
    ctx.fillStyle = PALETTE.flueSlot;
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, r * (1 + SPLIT), r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    for (const side of [-1, 1]) {
      const shiver = Math.sin(time * 43 + k * 2.1 + side) * 0.12;
      const x = at.x + side * r * (SPLIT + shiver);
      const tint = neonHue(hue + side * 60, 0.9, 1);
      ctx.globalAlpha = env * (side < 0 ? 0.9 : 0.7);
      const g = ctx.createRadialGradient(x, at.y, 0, x, at.y, r * 1.15);
      g.addColorStop(0, rgba(tint, 0.5));
      g.addColorStop(1, rgba(tint, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, at.y, r * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = tint;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, at.y, r * (0.72 + 0.06 * Math.sin(time * 29 + side)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
