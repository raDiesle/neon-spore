import { LIGHT_HALF } from "@neon-spore/content";
import type { ChrysalisSkin } from "@neon-spore/sim";
import type { ChrysalisPose } from "./chrysalis-pose.js";
import {
  type At,
  CHRYSALIS_GRUB_TILES,
  CHRYSALIS_TALL,
  chrysalisHidePath,
} from "./chrysalis-shape.js";
import { halo, strokeGlowFaded } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE CHRYSALIS's hide** (§11.63): the living body under the slime — a
 * bruised plum teardrop ridged from end to end, hung between the field's
 * walls on strands of silk, with the grub inside glowing through it.
 *
 * **The ridges and the markings are drawn round the body**, so the cocoon is
 * seen in the round: each ridge a meridian at its own longitude, foreshortened
 * as it goes round and gone on the far side; two eye spots on its face and a
 * row of breathing holes on its back. The pose's `yaw` turns them all, so a
 * skin peeled turns the cocoon half round (`chrysalis-pose.ts`).
 *
 * **The deeper the skin, the thinner the hide**: the grub inside shows as a
 * glow under the quills' leather, plainer under the sacs', and under the
 * heart's membrane as itself, curled, beating. With every skin off it is
 * bare, and it dies (`die`) — writhing, going dark and gone.
 */

/** How much of the grub each skin lets through. */
const THIN: Record<ChrysalisSkin, number> = { slime: 0, quills: 0.18, sacs: 0.4, heart: 0.75 };

/** The grub's body segments. */
const GRUB_SEGMENTS = 7;

/** The ridges round the body. */
const RIDGES = 7;

/** The strands of silk it hangs by: from its shoulders out to each wall. */
export function drawChrysalisSilk(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  r: number,
): void {
  const anchorY = tileCY(l, 0.9);
  ctx.save();
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    for (let j = 0; j < 3; j++) {
      const from = {
        x: c.x + side * r * (0.35 + 0.18 * j),
        y: c.y - r * CHRYSALIS_TALL * (0.85 - 0.12 * j),
      };
      const wall = side < 0 ? l.gridLeft : l.gridLeft + l.gridWidth;
      const to = { x: wall, y: anchorY + j * l.tile * 0.55 };
      const strand = new Path2D();
      strand.moveTo(from.x, from.y);
      strand.quadraticCurveTo(
        (from.x + to.x) / 2,
        Math.max(from.y, to.y) + l.tile * 0.5,
        to.x,
        to.y,
      );
      ctx.strokeStyle = rgba(PALETTE.chrysalisSheen, 0.4 - 0.08 * j);
      ctx.lineWidth = STROKE.inner;
      ctx.stroke(strand);
    }
  }
  ctx.restore();
}

/**
 * The hide of `skin`, `r` across, and the grub through it — or, with no skin
 * left, the grub bare. Answers the outline, for the blow and the slime.
 */
export function drawChrysalisHide(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: ChrysalisPose,
  skin: ChrysalisSkin | null,
  r: number,
  time: number,
): Path2D {
  if (skin === null) return drawGrubBare(ctx, l, p, time);
  const c = p.c;
  const hide = chrysalisHidePath(c, {
    r,
    breathe: p.breathe,
    bloat: p.bloat,
    squeeze: p.squeeze,
    time,
  });
  ctx.save();
  ctx.fillStyle = PALETTE.chrysalisHideDark;
  ctx.translate(0, l.tile * 0.14);
  ctx.fill(hide);
  ctx.restore();
  ctx.save();
  const thin = THIN[skin];
  ctx.fillStyle = mixHex(PALETTE.chrysalisHide, PALETTE.chrysalisRidge, thin * 0.35);
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha * (1 - 0.35 * thin);
  ctx.fill(hide);
  ctx.globalAlpha = alpha;
  ctx.clip(hide);
  litRound(ctx, c.x, c.y, r * CHRYSALIS_TALL, LIGHT_HALF.creature);
  drawGrubInside(ctx, l, c, p, thin);
  drawRidges(ctx, c, r, p.yaw, thin);
  drawFace(ctx, l, c, r, p);
  ctx.restore();
  strokeGlowFaded(ctx, hide, PALETTE.chrysalisRidge, STROKE.outline, 1 + 0.6 * p.pulse * thin);
  return hide;
}

/** Half the body's width at `y` from its centre: the teardrop's, without its ripple. */
function widthAt(r: number, y: number): number {
  const ry = r * CHRYSALIS_TALL;
  const v = Math.max(-1, Math.min(1, y / ry));
  const lower = Math.max(0, v);
  return r * (1 - 0.3 * lower * lower) * Math.sqrt(1 - v * v);
}

/** The ridges, each a meridian round the body at its own longitude, turned by `yaw`. */
function drawRidges(
  ctx: CanvasRenderingContext2D,
  c: At,
  r: number,
  yaw: number,
  thin: number,
): void {
  const ry = r * CHRYSALIS_TALL;
  ctx.lineWidth = STROKE.outline * 1.4;
  for (let j = 0; j < RIDGES; j++) {
    const lon = (j / RIDGES) * Math.PI * 2 + yaw + 0.22;
    const facing = Math.cos(lon);
    if (facing <= 0.05) continue;
    const ridge = new Path2D();
    for (let k = 0; k <= 16; k++) {
      const y = -ry * 0.94 + (k / 16) * ry * 1.88;
      const x = c.x + widthAt(r, y) * Math.sin(lon);
      if (k === 0) ridge.moveTo(x, c.y + y);
      else ridge.lineTo(x, c.y + y);
    }
    ctx.strokeStyle = rgba(PALETTE.chrysalisRidge, (0.25 + 0.4 * facing) * (1 - 0.5 * thin));
    ctx.stroke(ridge);
  }
}

/** The face: two eye spots at its front, a row of breathing holes at its back, turned by `yaw`. */
function drawFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  r: number,
  p: ChrysalisPose,
): void {
  const ry = r * CHRYSALIS_TALL;
  for (const side of [-1, 1]) {
    const lon = side * 0.36 + p.yaw;
    const facing = Math.cos(lon);
    if (facing <= 0.1) continue;
    const y = -ry * 0.38;
    const x = c.x + widthAt(r, y) * Math.sin(lon);
    const w = l.tile * 0.42 * facing;
    const h = l.tile * 0.58;
    ctx.fillStyle = rgba(PALETTE.chrysalisHideDark, 0.9 * facing);
    ctx.beginPath();
    ctx.ellipse(x, c.y + y, w, h, side * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(PALETTE.chrysalisSpore, 0.75 * facing);
    ctx.beginPath();
    ctx.ellipse(x, c.y + y, w * 0.55, h * 0.55, side * 0.25, 0, Math.PI * 2);
    ctx.fill();
    halo(ctx, x + w * 0.2, c.y + y - h * 0.25, l.tile * 0.25, PALETTE.chrysalisSheen, 0.5 * facing);
  }
  for (let k = 0; k < 4; k++) {
    const lon = Math.PI + p.yaw;
    const facing = Math.cos(lon);
    if (facing <= 0.1) break;
    const y = -ry * 0.45 + k * ry * 0.3;
    const x = c.x + widthAt(r, y) * Math.sin(lon);
    const open = 0.4 + 0.6 * (0.5 + 0.5 * p.breathe);
    ctx.fillStyle = rgba(PALETTE.chrysalisHideDark, facing);
    ctx.beginPath();
    ctx.ellipse(x, c.y + y, l.tile * 0.16 * facing, l.tile * 0.1 * open, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.chrysalisRidge, 0.8 * facing);
    ctx.lineWidth = STROKE.inner * 1.5;
    ctx.stroke();
  }
}

/** The grub through the hide: a glow, and under a thin enough skin the curled body itself. */
function drawGrubInside(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  p: ChrysalisPose,
  thin: number,
): void {
  const g = CHRYSALIS_GRUB_TILES * l.tile;
  halo(ctx, c.x, c.y, g * 2.2, PALETTE.chrysalisGrub, thin * (0.3 + 0.45 * p.pulse));
  if (thin < 0.3) return;
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha * (thin - 0.2) * 0.8;
  ctx.fillStyle = PALETTE.chrysalisGrub;
  ctx.fill(grubPath(c, g, p.breathe));
  ctx.globalAlpha = alpha;
}

/** The grub's curled body: segments round a crook, about `c`, `g` its size. */
function grubPath(c: At, g: number, breathe: number): Path2D {
  const p = new Path2D();
  const curl = 2.3 + 0.15 * breathe;
  for (let k = 0; k < GRUB_SEGMENTS; k++) {
    // A C curled on its side, head at the top right, tail tucked in under it.
    const a = -0.6 + (k / (GRUB_SEGMENTS - 1)) * curl;
    const r = g * (0.34 - 0.025 * Math.abs(k - 2));
    const x = c.x + Math.cos(a) * g * 0.62;
    const y = c.y + Math.sin(a) * g * 0.62;
    p.moveTo(x + r, y);
    p.arc(x, y, r, 0, Math.PI * 2);
  }
  return p;
}

/** The grub with every skin off: pale, writhing, then dying dark and gone (`die`). */
function drawGrubBare(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: ChrysalisPose,
  time: number,
): Path2D {
  const g = CHRYSALIS_GRUB_TILES * l.tile * (1 - 0.35 * p.die);
  const writhe = Math.sin(time * 9) * (1 - p.die) * 0.25;
  const body = grubPath(p.c, g, writhe * 4);
  ctx.save();
  ctx.globalAlpha *= Math.max(0, 1 - p.die * p.die);
  ctx.fillStyle = mixHex(PALETTE.chrysalisGrub, PALETTE.chrysalisHideDark, p.die);
  ctx.fill(body);
  strokeGlowFaded(ctx, body, PALETTE.chrysalisSpore, STROKE.outline, 1.5 * (1 - p.die));
  ctx.restore();
  if (p.die < 0.25) halo(ctx, p.c.x, p.c.y, g * 3, "#FFFFFF", 1 - p.die / 0.25);
  return body;
}
