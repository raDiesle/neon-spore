import { LIGHT_HALF } from "@neon-spore/content";
import {
  BASTION_PLATES_A_SIDE,
  type BastionState,
  bastionGone,
  bastionPlateOf,
  bastionPlateWay,
} from "@neon-spore/sim";
import {
  type At,
  BASTION_PLATE_HALF,
  BASTION_PLATE_IN,
  BASTION_SHELL_TILES,
  bastionPlateAngle,
  bastionPlatePath,
  bastionPlateSeat,
} from "./bastion-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE BASTION's armour** (§11.62), the outermost shell: eight curved slabs
 * of blue gunmetal, four down each side, with a command tower on top and a
 * keel underneath that come away with the last of them.
 *
 * A slab is drawn thick — its edge first, a shade down and dropped below it,
 * then its face, lit as part of the ball it is cut from, a bevelled panel
 * line inset round it with a rivet at each corner, and a pair of amber
 * stencil marks. **A slab being pulled stands out along its own way by as
 * much as the thumb has it**, and the seam it leaves behind glows hotter the
 * nearer it is to tearing.
 */

export function drawBastionPlates(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  s: BastionState,
  lit: boolean,
  pullMilli: number,
  pulse: number,
): void {
  drawTower(ctx, l, c, pulse);
  drawKeel(ctx, l, c);
  const outer = BASTION_SHELL_TILES.plates * l.tile;
  const inner = BASTION_PLATE_IN * l.tile;
  for (let i = 0; i < BASTION_PLATES_A_SIDE * 2; i++) {
    if (lit && bastionGone(s, i)) continue;
    const held = lit && bastionPlateOf(s, bastionPlateSeat(i)) === i;
    const pulled = held ? s.pullMilli[bastionPlateSeat(i)] : 0;
    const [wx, wy] = bastionPlateWay(i);
    const out = (pulled / 1000) * l.tile;
    const angle = bastionPlateAngle(i);
    if (pulled > 0) {
      // The seam left behind, hot with how near it is to tearing.
      const seam = bastionPlatePath(c, angle, outer, inner);
      strokeGlowFaded(ctx, seam, PALETTE.bastionLight, STROKE.outline, 2 * (pulled / pullMilli));
    }
    drawPlate(ctx, l, c, angle, (wx / 1000) * out, (wy / 1000) * out, 1);
  }
}

/** One slab, stood `ox`, `oy` out from its place: what a torn one flies as, too. */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  angle: number,
  ox: number,
  oy: number,
  alpha: number,
): void {
  const outer = BASTION_SHELL_TILES.plates * l.tile;
  const inner = BASTION_PLATE_IN * l.tile;
  const lip = l.tile * 0.16;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.bastionArmourDark;
  ctx.fill(bastionPlatePath(c, angle, outer, inner, ox, oy + lip));
  const face = bastionPlatePath(c, angle, outer, inner, ox, oy);
  ctx.save();
  ctx.fillStyle = PALETTE.bastionArmour;
  ctx.fill(face);
  ctx.clip(face);
  litRound(ctx, c.x + ox, c.y + oy, outer, LIGHT_HALF.rock);
  ctx.restore();
  const inset = l.tile * 0.2;
  const panel = bastionPlatePath(
    c,
    angle,
    outer - inset,
    inner + inset,
    ox,
    oy,
    BASTION_PLATE_HALF * 0.78,
  );
  ctx.strokeStyle = rgba(PALETTE.bastionArmourDark, 0.8);
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(panel);
  ctx.fillStyle = PALETTE.bastionEdge;
  const a = angle - Math.PI / 2;
  for (const rr of [outer - inset, inner + inset]) {
    for (const side of [-1, 1]) {
      const t = a + side * BASTION_PLATE_HALF * 0.78;
      ctx.beginPath();
      ctx.arc(
        c.x + ox + Math.cos(t) * rr,
        c.y + oy + Math.sin(t) * rr,
        l.tile * 0.045,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  // Two stencil marks across the middle of the slab.
  ctx.strokeStyle = rgba(PALETTE.bastionLight, 0.75);
  ctx.lineWidth = l.tile * 0.06;
  const mid = (outer + inner) / 2;
  ctx.beginPath();
  for (const d of [-0.05, 0.05]) {
    const t = a + d;
    ctx.moveTo(
      c.x + ox + Math.cos(t) * (mid - l.tile * 0.2),
      c.y + oy + Math.sin(t) * (mid - l.tile * 0.2),
    );
    ctx.lineTo(
      c.x + ox + Math.cos(t) * (mid + l.tile * 0.2),
      c.y + oy + Math.sin(t) * (mid + l.tile * 0.2),
    );
  }
  ctx.stroke();
  strokeGlowFaded(ctx, face, PALETTE.bastionEdge, STROKE.inner, 0.8);
  ctx.restore();
}

/** The command tower on top: a tapered fin, a mast and a light that blinks on the beat. */
function drawTower(ctx: CanvasRenderingContext2D, l: Layout, c: At, pulse: number): void {
  const t = l.tile;
  const base = c.y - BASTION_PLATE_IN * t;
  const top = c.y - (BASTION_SHELL_TILES.plates + 0.35) * t;
  const fin = new Path2D();
  fin.moveTo(c.x - 0.9 * t, base);
  fin.lineTo(c.x - 0.45 * t, top);
  fin.lineTo(c.x + 0.45 * t, top);
  fin.lineTo(c.x + 0.9 * t, base);
  fin.closePath();
  ctx.fillStyle = PALETTE.bastionArmourDark;
  ctx.fill(fin);
  ctx.fillStyle = rgba(PALETTE.bastionEdge, 0.25);
  ctx.fillRect(c.x - 0.4 * t, top + 0.2 * t, 0.8 * t, 0.08 * t);
  ctx.fillRect(c.x - 0.5 * t, top + 0.45 * t, 1.0 * t, 0.08 * t);
  strokeGlowFaded(ctx, fin, PALETTE.bastionEdge, STROKE.inner, 0.6);
  ctx.strokeStyle = PALETTE.bastionStrut;
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  ctx.moveTo(c.x + 0.15 * t, top);
  ctx.lineTo(c.x + 0.15 * t, top - 0.6 * t);
  ctx.stroke();
  halo(ctx, c.x + 0.15 * t, top - 0.6 * t, t * (0.2 + 0.3 * pulse), PALETTE.bastionLight, 0.9);
}

/** The keel underneath: a blunt prow of dark plating with three exhaust bells. */
function drawKeel(ctx: CanvasRenderingContext2D, l: Layout, c: At): void {
  const t = l.tile;
  const base = c.y + BASTION_PLATE_IN * t;
  const tip = c.y + (BASTION_SHELL_TILES.plates + 0.1) * t;
  const keel = new Path2D();
  keel.moveTo(c.x - 1.0 * t, base);
  keel.lineTo(c.x - 0.55 * t, tip);
  keel.lineTo(c.x + 0.55 * t, tip);
  keel.lineTo(c.x + 1.0 * t, base);
  keel.closePath();
  ctx.fillStyle = PALETTE.bastionArmourDark;
  ctx.fill(keel);
  strokeGlowFaded(ctx, keel, PALETTE.bastionEdge, STROKE.inner, 0.6);
  for (const dx of [-0.35, 0, 0.35]) {
    const bell = new Path2D();
    bell.ellipse(c.x + dx * t, tip, 0.13 * t, 0.07 * t, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.bastionLight;
    ctx.fill(bell);
    halo(ctx, c.x + dx * t, tip + 0.05 * t, 0.25 * t, PALETTE.bastionLight, 0.5);
  }
}
