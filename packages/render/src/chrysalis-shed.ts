import type { ChrysalisSkin } from "@neon-spore/sim";
import { type At, CHRYSALIS_SKIN_TILES, chrysalisHidePath } from "./chrysalis-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A skin peeling away** (§11.63): THE BASTION's *visual of a successful
 * step level achieved* (§11.62) on a body that is alive, read off the pose
 * (`chrysalis-pose.ts`) and so the same on both screens and on a frame taken
 * cold.
 *
 * **The skin splits down its middle and its two halves fall away**, curling
 * out and dropping as they go, each in its own tissue so the pair sees which
 * skin it was — the slime as a wet lime sheet that throws globs, the quills'
 * leather throwing spines, the sacs' hide throwing burst bladders, the
 * heart's membrane in shreds. Behind it a flash, and a shockwave in the win's
 * green; under it all the cocoon left behind, rimmed in green, smaller.
 */

/** Each skin's tissue: its sheet, its edge, and what it throws as it goes. */
const TISSUE: Record<ChrysalisSkin, { sheet: string; edge: string; bits: string; long: number }> = {
  slime: {
    sheet: PALETTE.chrysalisSlime,
    edge: PALETTE.chrysalisSheen,
    bits: PALETTE.chrysalisSlime,
    long: 0.5,
  },
  quills: {
    sheet: PALETTE.chrysalisHide,
    edge: PALETTE.chrysalisRidge,
    bits: PALETTE.chrysalisQuill,
    long: 1.6,
  },
  sacs: {
    sheet: PALETTE.chrysalisHide,
    edge: PALETTE.chrysalisSpore,
    bits: PALETTE.chrysalisSac,
    long: 0.7,
  },
  heart: {
    sheet: PALETTE.chrysalisRidge,
    edge: PALETTE.chrysalisSheen,
    bits: PALETTE.chrysalisRidge,
    long: 1.0,
  },
};

/** How far the halves fall and the pieces fly, and the wave runs, in tiles, by the end. */
const FALL = 6;
const FLY = 6;
const WAVE = 8;
const BITS = 12;

export function drawChrysalisShed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  skin: ChrysalisSkin,
  k: number,
  /** How far the cocoon left behind reaches, in pixels: the rim the win lights. */
  reach: number,
): void {
  if (k >= 1) return;
  const from = CHRYSALIS_SKIN_TILES[skin] * l.tile;
  const fade = 1 - k;
  const look = TISSUE[skin];
  if (k < 0.2) halo(ctx, c.x, c.y, from * 1.6, "#FFFFFF", 1 - k / 0.2);
  const wave = new Path2D();
  wave.arc(c.x, c.y, from + k * WAVE * l.tile, 0, Math.PI * 2);
  strokeGlowFaded(ctx, wave, PALETTE.good, STROKE.outline * 2, 2, fade);
  const rim = new Path2D();
  rim.ellipse(c.x, c.y, reach, reach * 1.1, 0, 0, Math.PI * 2);
  strokeGlowFaded(ctx, rim, PALETTE.good, STROKE.outline, 2.5, fade);
  // The old skin, split down its middle, each half curling out and falling.
  const sheet = chrysalisHidePath(c, { r: from, breathe: 0, bloat: 0, squeeze: 0, time: 0 });
  const ease = 1 - (1 - k) * (1 - k);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.globalAlpha = fade * 0.85;
    ctx.translate(c.x + side * ease * l.tile * 2.2, c.y + k * k * FALL * l.tile);
    ctx.rotate(side * ease * 0.7);
    ctx.translate(-c.x, -c.y);
    ctx.beginPath();
    ctx.rect(side < 0 ? c.x - from * 2 : c.x, c.y - from * 2, from * 2, from * 4);
    ctx.clip();
    ctx.fillStyle = rgba(look.sheet, 0.55);
    ctx.fill(sheet);
    strokeGlowFaded(ctx, sheet, look.edge, STROKE.outline, 1.4);
    ctx.restore();
  }
  // What it throws as it goes, flung out and dropping.
  ctx.save();
  for (let j = 0; j < BITS; j++) {
    const a = (j / BITS) * Math.PI * 2 + sinHash(j, 3) * 0.4;
    const d = from + ease * FLY * l.tile * (0.6 + 0.6 * sinHash(j, 5));
    const x = c.x + Math.cos(a) * d;
    const y = c.y + Math.sin(a) * d + k * k * FALL * l.tile * 0.6;
    const w = l.tile * 0.22 * look.long * (0.7 + 0.6 * sinHash(j, 11));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + k * (3 + 3 * sinHash(j, 9)) * (j % 2 === 0 ? 1 : -1));
    ctx.globalAlpha = fade;
    ctx.fillStyle = look.bits;
    ctx.beginPath();
    ctx.ellipse(0, 0, w, l.tile * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * A skin growing back (§11.63): a red ring where it will stand, fading as it
 * comes whole, over the skin drawn small and filling out
 * (`chrysalis-draw.ts`) — the skin the pair has to take off again.
 */
export function drawChrysalisRegrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  skin: ChrysalisSkin,
  grow: number,
  pulse: number,
): void {
  if (grow >= 1) return;
  const r = CHRYSALIS_SKIN_TILES[skin] * l.tile;
  const ring = new Path2D();
  ring.ellipse(c.x, c.y, r, r * 1.1, 0, 0, Math.PI * 2);
  strokeGlowFaded(ctx, ring, PALETTE.red, STROKE.outline * 2, 1.5 + pulse, 1 - grow);
}
