import type { BastionLayer } from "@neon-spore/sim";
import { type At, BASTION_SHELL_TILES } from "./bastion-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A shell coming away** (§11.62): the owner's *visual of a successful step
 * level achieved*, read off the pose (`bastion-pose.ts`) and so the same on
 * both screens and on a frame taken cold.
 *
 * Three things at once, in the order the eye takes them: **a flash** at the
 * moon's heart; **a shockwave** in the win's green running out from where the
 * shell stood to well past the field's edges; and **the shell itself in
 * pieces**, flung out tumbling and fading — each shell's pieces in its own
 * metal and its own cut, so the pair sees which shell it was that went.
 * Under it all the moon left behind is rimmed in green: smaller, and theirs.
 */

/** Each shell's fragments: how many, their colour and their edge. */
const SHARDS: Record<BastionLayer, { n: number; fill: string; edge: string; long: number }> = {
  plates: { n: 10, fill: PALETTE.bastionArmour, edge: PALETTE.bastionEdge, long: 0.7 },
  ring: { n: 12, fill: PALETTE.bastionBand, edge: PALETTE.bastionLight, long: 1.1 },
  lattice: { n: 14, fill: PALETTE.bastionStrut, edge: PALETTE.bastionNode, long: 1.4 },
  port: { n: 12, fill: PALETTE.bastionHull, edge: PALETTE.bastionCore, long: 0.8 },
};

/** How far the pieces fly and the wave runs, in tiles, by the end of the shed. */
const FLY = 7;
const WAVE = 8;

export function drawBastionShed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  layer: BastionLayer,
  k: number,
  /** How far the moon left behind reaches, in pixels: the rim the win lights. */
  reach: number,
): void {
  if (k >= 1) return;
  const from = BASTION_SHELL_TILES[layer] * l.tile;
  const fade = 1 - k;
  // The flash, over in the first fifth.
  if (k < 0.2) halo(ctx, c.x, c.y, from * 1.6, "#FFFFFF", 1 - k / 0.2);
  // The shockwave, and the rim of what is left.
  const wave = new Path2D();
  wave.arc(c.x, c.y, from + k * WAVE * l.tile, 0, Math.PI * 2);
  strokeGlowFaded(ctx, wave, PALETTE.good, STROKE.outline * 2, 2, fade);
  const rim = new Path2D();
  rim.arc(c.x, c.y, reach, 0, Math.PI * 2);
  strokeGlowFaded(ctx, rim, PALETTE.good, STROKE.outline, 2.5, fade);
  // The pieces, tumbling out.
  const look = SHARDS[layer];
  const ease = 1 - (1 - k) * (1 - k);
  ctx.save();
  for (let j = 0; j < look.n; j++) {
    const a = (j / look.n) * Math.PI * 2 + sinHash(j, 3) * 0.4;
    const d = from + ease * FLY * l.tile * (0.7 + 0.6 * sinHash(j, 5));
    const x = c.x + Math.cos(a) * d;
    const y = c.y + Math.sin(a) * d;
    const turn = a + k * (4 + 3 * sinHash(j, 9)) * (j % 2 === 0 ? 1 : -1);
    const w = l.tile * 0.35 * look.long * (0.7 + 0.6 * sinHash(j, 11));
    const h = l.tile * 0.16;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.globalAlpha = fade;
    const shard = new Path2D();
    shard.moveTo(-w, -h);
    shard.lineTo(w * 0.8, -h * 1.2);
    shard.lineTo(w, h);
    shard.lineTo(-w * 0.7, h * 0.9);
    shard.closePath();
    ctx.fillStyle = look.fill;
    ctx.fill(shard);
    strokeGlowFaded(ctx, shard, look.edge, STROKE.inner, 1.2);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * A shell growing back (§11.62): the shell drawn faint and filling in, and
 * a red ring at where it stands that fades as it comes whole — the shell
 * the pair has to take off again.
 */
export function drawBastionRegrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  layer: BastionLayer,
  grow: number,
  pulse: number,
): void {
  if (grow >= 1) return;
  const ring = new Path2D();
  ring.arc(c.x, c.y, BASTION_SHELL_TILES[layer] * l.tile, 0, Math.PI * 2);
  strokeGlowFaded(ctx, ring, PALETTE.red, STROKE.outline * 2, 1.5 + pulse, 1 - grow);
}
