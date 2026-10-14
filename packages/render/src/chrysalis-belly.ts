import { LIGHT_HALF } from "@neon-spore/content";
import {
  type ChrysalisState,
  type ChrysalisStep,
  chrysalisGone,
  chrysalisLitStep,
  chrysalisNext,
  type SimConfig,
} from "@neon-spore/sim";
import type { ChrysalisPose } from "./chrysalis-pose.js";
import { type At, chrysalisPoreAt, chrysalisSacAt } from "./chrysalis-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE CHRYSALIS's two inner skins** (§11.63): the sacs and the heart.
 *
 * **The sacs** hang off the cocoon's belly, each over its own column. The
 * one swelling swells — bigger, brighter, trembling, its veins lit — until
 * its spores come down that column; a sac burst on the shield is a puckered
 * scar with a few spores still clinging.
 *
 * **The heart** is under the last skin, a membrane gone thin enough to see
 * the grub through (`chrysalis-hide.ts`). On the pilot's screen alone
 * (`showsChrysalisHeart`) one pore stands open over its column and the heart
 * beats behind it in its colour, its veins lit in that colour too; a pore
 * shot is a stitched scar on both screens.
 */

export function drawChrysalisSacs(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  step: ChrysalisStep,
  p: ChrysalisPose,
  time: number,
): void {
  const lit = chrysalisLitStep(s)?.skin === "sacs";
  const swelling = lit && p.swell >= 0 ? chrysalisNext(s) : -1;
  (step.offsets ?? []).forEach((offset, i) => {
    const at = chrysalisSacAt(l, cfg, p.c, offset);
    if (lit && chrysalisGone(s, i)) {
      drawScar(ctx, l, at, PALETTE.chrysalisSac);
      return;
    }
    const swell = i === swelling ? p.swell : 0;
    drawVeins(ctx, l, p.c, at, PALETTE.chrysalisSac, 0.25 + 0.6 * swell);
    const shake = swell * l.tile * 0.05 * Math.sin(time * 40 + i);
    const r = l.tile * (0.42 + 0.36 * swell + 0.03 * p.breathe);
    const bulb = new Path2D();
    bulb.ellipse(at.x + shake, at.y + r * 0.25, r, r * 1.1, 0, 0, Math.PI * 2);
    if (swell > 0) halo(ctx, at.x, at.y, r * 2.6, PALETTE.chrysalisSpore, 0.25 + 0.6 * swell);
    ctx.save();
    ctx.fillStyle = PALETTE.chrysalisSac;
    ctx.fill(bulb);
    ctx.clip(bulb);
    litRound(ctx, at.x, at.y, r, LIGHT_HALF.creature);
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = rgba(PALETTE.chrysalisSpore, 0.45 + 0.5 * swell);
      ctx.beginPath();
      const a = k * 1.7 + i;
      ctx.arc(
        at.x + Math.cos(a) * r * 0.45,
        at.y + Math.sin(a) * r * 0.5,
        r * 0.14,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
    strokeGlowFaded(ctx, bulb, PALETTE.chrysalisSpore, STROKE.outline, 0.8 + 1.6 * swell);
  });
}

export function drawChrysalisHeart(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  p: ChrysalisPose,
  shown: boolean,
): void {
  const step = chrysalisLitStep(s);
  if (step?.skin !== "heart") return;
  const next = chrysalisNext(s);
  (step.offsets ?? []).forEach((offset, i) => {
    const at = chrysalisPoreAt(l, cfg, p.c, offset);
    if (chrysalisGone(s, i)) {
      drawScar(ctx, l, at, PALETTE.chrysalisRidge);
      return;
    }
    if (!shown || i !== next) return;
    const color = step.colors?.[i] === "cyan" ? PALETTE.cyan : PALETTE.red;
    drawVeins(ctx, l, p.c, at, color, 0.35 + 0.5 * p.pulse);
    const r = l.tile * 0.36;
    ctx.fillStyle = PALETTE.chrysalisHideDark;
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, r * 1.25, r * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    const beat = r * (0.62 + 0.3 * p.pulse);
    halo(ctx, at.x, at.y, r * (2 + 1.5 * p.pulse), color, 0.55 + 0.4 * p.pulse);
    const heart = new Path2D();
    heart.ellipse(at.x, at.y, beat, beat * 1.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill(heart);
    strokeGlowFaded(ctx, heart, color, STROKE.outline, 1.5 + p.pulse);
  });
}

/** Veins from the cocoon's middle out to `at`, lit by `glow`. */
function drawVeins(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  at: At,
  color: string,
  glow: number,
): void {
  ctx.save();
  ctx.strokeStyle = rgba(color, Math.min(1, glow));
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  for (const bend of [-1, 1]) {
    const v = new Path2D();
    v.moveTo(c.x + (at.x - c.x) * 0.3, c.y + (at.y - c.y) * 0.2);
    v.quadraticCurveTo(
      (c.x + at.x) / 2 + bend * l.tile * 0.4,
      (c.y + at.y) / 2,
      at.x + bend * l.tile * 0.15,
      at.y,
    );
    ctx.stroke(v);
  }
  ctx.restore();
}

/** Where a sac burst or a pore was shot: a puckered stitch, closed for good. */
function drawScar(ctx: CanvasRenderingContext2D, l: Layout, at: At, rim: string): void {
  const t = l.tile;
  ctx.fillStyle = PALETTE.chrysalisHideDark;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, t * 0.3, t * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(rim, 0.8);
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  for (const dx of [-0.18, 0, 0.18]) {
    ctx.moveTo(at.x + dx * t, at.y - 0.2 * t);
    ctx.lineTo(at.x + dx * t, at.y + 0.2 * t);
  }
  ctx.moveTo(at.x - 0.3 * t, at.y);
  ctx.lineTo(at.x + 0.3 * t, at.y);
  ctx.stroke();
}
