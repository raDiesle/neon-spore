import { drawQuill } from "./chrysalis-coat.js";
import type { ChrysalisFx } from "./chrysalis-fx.js";
import { type At, quillWay } from "./chrysalis-shape.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CHRYSALIS's receipts, drawn (§11.63): the quills ripped out flying off
 * along their ways and dropping, the globs of a wiped half falling down the
 * field, and the spores in a cloud — down a column to the hull, or back up
 * off the shield into the sac. Kept by `chrysalis-fx.ts`.
 */

/** How far a ripped quill flies, in tiles, and how far a glob falls. */
const FLY = 5;
const DROP = 9;
/** Specks in a cloud of spores. */
const SPECKS = 14;

export function drawChrysalisReceipts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  fx: ChrysalisFx,
): void {
  for (const f of fx.flung) {
    const k = 1 - f.now;
    const w = quillWay(f.piece);
    const ox = w.x * k * FLY * l.tile;
    const oy = w.y * k * FLY * l.tile + k * k * DROP * l.tile * 0.5;
    drawQuill(ctx, l, c, f.piece, ox, oy, 0, f.now);
  }
  for (const g of fx.globs) {
    const k = 1 - g.now;
    const y = g.y + k * k * DROP * l.tile;
    const r = l.tile * (0.22 + 0.1 * k);
    ctx.fillStyle = rgba(PALETTE.chrysalisSlime, 0.75 * g.now);
    ctx.beginPath();
    ctx.ellipse(g.x, y, r * 0.8, r * (1 + 0.6 * k), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const s of fx.spores) {
    const k = 1 - s.now;
    for (let j = 0; j < SPECKS; j++) {
      const lag = sinHash(j, 7) * 0.35;
      const t = Math.max(0, Math.min(1, k * 1.35 - lag));
      if (t <= 0 || t >= 1) continue;
      const spread = l.tile * 0.5 * Math.sin(t * Math.PI);
      const x = s.from.x + (s.to.x - s.from.x) * t + (sinHash(j, 13) - 0.5) * spread * 2;
      const y = s.from.y + (s.to.y - s.from.y) * t;
      halo(ctx, x, y, l.tile * 0.22, PALETTE.chrysalisSpore, 0.8 * s.now + 0.2);
    }
  }
}
