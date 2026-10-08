import type { SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { TrapezeWord } from "./trapeze-fx.js";
import { trapezeZone } from "./trapeze-marks.js";
import type { Point } from "./trapeze-shape.js";

/**
 * **What THE TRAPEZE's receipts are drawn as**, off the numbers
 * `trapeze-fx.ts` keeps: the word a refused or slowing swipe stands in its
 * zone, the ring a kicked gong throws, and the lock's sight round the alien.
 */

/** The word's size, in tiles, and how long it takes to land and to fade, in seconds. */
const WORD = 0.46;
const LAND = 0.12;
const FADE = 0.3;
const STANDS = 1.1;
/** A gong's ring: how much wider it goes as it fades, in gong radii, and more per gong kicked. */
const RING_WIDE = 1.6;
const RING_MORE = 0.35;
/** The lock's sight: its ticks' length as a share of its radius. */
const TICK = 0.35;

/** The word standing in its zone, landing large and fading at the end. */
export function drawTrapezeWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  word: TrapezeWord | null,
): void {
  if (word === null) return;
  const z = trapezeZone(l, cfg, word.side);
  const land = Math.min(1, word.age / LAND);
  const fade = Math.min(1, (STANDS - word.age) / FADE);
  if (fade <= 0) return;
  ctx.save();
  ctx.font = `700 ${Math.round(l.tile * WORD * (1.25 - 0.25 * land))}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = z.x + z.w / 2;
  const y = z.y + z.h * 0.78;
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.background, 0.85 * fade);
  ctx.strokeText(word.text, x, y, z.w - 0.3 * l.tile);
  ctx.fillStyle = rgba(PALETTE.text, fade);
  ctx.fillText(word.text, x, y, z.w - 0.3 * l.tile);
  ctx.restore();
}

/** A kicked gong's ring off `at`, `r` its radius, wider and fainter as `ring` runs down. */
export function drawTrapezeGongRing(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  ring: number,
  gongs: number,
): void {
  if (ring <= 0) return;
  const path = new Path2D();
  path.arc(at.x, at.y, r * (1 + (RING_WIDE + RING_MORE * gongs) * (1 - ring)), 0, Math.PI * 2);
  strokeGlow(ctx, path, PALETTE.trapezeBrassLit, STROKE.outline * (0.5 + ring), ring, 1);
}

/**
 * The lock's sight round the alien: a ring with four ticks, closing in as
 * `snap` lands it, and pulsing on the beat while it holds.
 */
export function drawTrapezeLockRing(
  ctx: CanvasRenderingContext2D,
  c: Circle,
  snap: number,
  beatPhase: number,
): void {
  const r = c.r * (1 + 0.6 * snap);
  const sight = new Path2D();
  sight.arc(c.x, c.y, r, 0, Math.PI * 2);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    sight.moveTo(c.x + Math.cos(a) * r * (1 - TICK), c.y + Math.sin(a) * r * (1 - TICK));
    sight.lineTo(c.x + Math.cos(a) * r * (1 + TICK), c.y + Math.sin(a) * r * (1 + TICK));
  }
  const pulse = 0.7 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, sight, PALETTE.red, STROKE.outline, pulse, 1);
}

/** A shot into the alien: its body washed white for a moment. */
export function drawTrapezeFlash(ctx: CanvasRenderingContext2D, body: Path2D, flash: number): void {
  if (flash <= 0) return;
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.65 * flash);
  ctx.fill(body);
}
