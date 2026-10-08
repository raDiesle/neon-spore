import { bastionPlateWay } from "@neon-spore/sim";
import type { Arc, Flung } from "./bastion-fx.js";
import { drawPlate } from "./bastion-plates.js";
import {
  type At,
  BASTION_PLATE_IN,
  BASTION_SHELL_TILES,
  bastionPlateAngle,
} from "./bastion-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE BASTION's receipts, drawn (`bastion-fx.ts` holds them): a torn plate
 * flying out along its way, faster as it goes and tumbling about its own
 * middle, until it is off the field; and a bolt of lightning, a jagged line
 * that jumps a dozen times a second while it fades.
 */

/** How far a torn plate has flown by the end of its flight, in tiles, and how far it tumbles, in turns. */
const FLIGHT = 12;
const TUMBLE = 1.2;
/** The lightning's kinks, and how far one strays from the straight line against its length. */
const KINKS = 9;
const STRAY = 0.08;

export function drawBastionFlung(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  flung: readonly Flung[],
): void {
  for (const f of flung) {
    const gone = 1 - f.now;
    const out = gone * gone * FLIGHT * l.tile;
    const [wx, wy] = bastionPlateWay(f.piece);
    const angle = bastionPlateAngle(f.piece);
    const mid = ((BASTION_SHELL_TILES.plates + BASTION_PLATE_IN) / 2) * l.tile;
    const px = c.x + Math.sin(angle) * mid + (wx / 1000) * out;
    const py = c.y - Math.cos(angle) * mid + (wy / 1000) * out;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(gone * TUMBLE * Math.PI * 2 * (wx < 0 ? -1 : 1));
    ctx.translate(-px, -py);
    drawPlate(ctx, l, c, angle, (wx / 1000) * out, (wy / 1000) * out, Math.min(1, f.now * 2));
    ctx.restore();
  }
}

export function drawBastionArcs(
  ctx: CanvasRenderingContext2D,
  arcs: readonly Arc[],
  time: number,
): void {
  const tick = Math.floor(time * 12);
  for (const a of arcs) {
    const dx = a.to.x - a.from.x;
    const dy = a.to.y - a.from.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const bolt = new Path2D();
    bolt.moveTo(a.from.x, a.from.y);
    for (let k = 1; k < KINKS; k++) {
      const u = k / KINKS;
      const off = (sinHash(tick, k) - 0.5) * 2 * STRAY * len;
      bolt.lineTo(a.from.x + dx * u + nx * off, a.from.y + dy * u + ny * off);
    }
    bolt.lineTo(a.to.x, a.to.y);
    strokeGlowFaded(ctx, bolt, PALETTE.bastionNode, STROKE.outline, 2.5, a.now);
  }
}
