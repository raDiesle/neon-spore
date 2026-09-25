import { blobPoints } from "@neon-spore/content";
import type { InstarState, World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { drawInstarChain } from "./instar-chain.js";
import type { InstarFx } from "./instar-fx.js";
import { drawInstarLimbs } from "./instar-limbs.js";
import { drawInstarMarks } from "./instar-marks.js";
import {
  type Figure,
  instarAt,
  instarFade,
  instarLen,
  instarMorphAt,
  type Point,
} from "./instar-shape.js";
import { instarBody } from "./instar-sway.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR**: a larva the size of the field, hung head-down over the ship
 * on a chain of plated segments that runs up out of the top of the frame —
 * a head with two pooled eyes and a mouth full of teeth, two hands on
 * jointed arms, and, pose by pose, a club in one hand, a clutch of eggs on
 * its flank, a tongue out and coiled, a barbed tail swung over the hull, the
 * whole head thrust at the ship (§11.32).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the segments, the husk if it is shedding, the head, the mouth, the eyes,
 * then the limbs and what they hold (`instar-limbs.ts`), then the marks
 * (`instar-marks.ts`). What outlives a frame — the jolt of a landing, the
 * flinch at a wrong thumb, the lash of a strike — is `effects.boss.instar`
 * (`instar-fx.ts`). Its health is its script: every pose is one the pair has
 * to undo, and after the last it sags, shuts its eyes and fades over
 * `instarOutBeats`.
 *
 * **Both screens see the same body.** This is the one boss whose split is
 * not in the eyes but in the hands: what a seat is told is which of the
 * marks on the body are its own (`view-role-clocks-b.ts`), so no predicate
 * reaches into the body itself.
 */
export function drawInstar(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: InstarState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: InstarFx,
): void {
  const cfg = world.cfg;
  const fade = instarFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const { f, sway } = instarBody(s, cfg, beat, beatPhase);
  const morph = instarMorphAt(s, beat, beatPhase);
  const head = instarAt(l, f.headX, f.headY);
  const r = instarLen(l, f.headR);

  ctx.save();
  const shake = fx.flinch * l.tile * 0.25 * Math.sin(time * 40) + fx.hurt.shakeX(time, l.tile);
  ctx.translate(shake, -fx.jolt * l.tile);
  const hurt = fx.hurt.value;
  const shoulders = drawInstarChain(ctx, l, f, head, r, time, fade, hurt);
  drawHead(ctx, f, head, r, time, fade, hurt);
  drawMouth(ctx, f, head, r, fade);
  drawEyes(ctx, f, head, r, time, fade);
  drawInstarLimbs(ctx, l, f, head, r, shoulders, time, fade);
  ctx.restore();
  fx.place(l, s, sway, r);
  drawInstarMarks(ctx, l, s, cfg, beat, beatPhase, time, morph, l.role, fx.verdicts);
}

/** A colour at the fade: the hex itself while the body hangs, so the frame tests can count it (`hive-draw.ts`). */
export function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** One plated blob of the body, filled dark and rimmed in the hull's violet —
 * and washed red while the body shows a blow (`boss-hurt.ts`). */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  fade: number,
  glow = 0.5,
  hurt = 0,
): void {
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, 0.9);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.hull, fade), STROKE.inner, glow * fade);
  drawHurt(ctx, p, hurt * fade);
}

/** The head: a lobed blob, wider than tall, taller as the mouth gapes and the lunge comes. */
function drawHead(
  ctx: CanvasRenderingContext2D,
  f: Figure,
  head: Point,
  r: number,
  time: number,
  fade: number,
  hurt: number,
): void {
  const ry = r * (0.85 + 0.2 * (f.jawUp + f.jawDown) * 0.5 + 0.1 * f.reach);
  const p = splinePath(blobPoints(head.x, head.y, r, ry, 6, 0.05, 0.02, time, 9, 24), true);
  drawPlate(ctx, p, fade, 0.6 + 0.4 * f.reach, hurt);
  if (f.back <= 0.01) return;
  // The back of the head: a spine of knuckles down its middle and no face.
  ctx.save();
  ctx.fillStyle = faded(PALETTE.hullRim, fade, 0.5 * f.back);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(head.x, head.y + i * ry * 0.32, r * 0.09, ry * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The mouth: a dark lens between the two jaws, toothed along both lips, gone on the turned back. */
function drawMouth(
  ctx: CanvasRenderingContext2D,
  f: Figure,
  head: Point,
  r: number,
  fade: number,
): void {
  const open = 1 - f.back;
  if (open <= 0.01) return;
  const bite = head.y + r * 0.15;
  const half = r * 0.7;
  const up = (0.06 + f.jawUp * 0.55) * r * open;
  const down = (0.06 + f.jawDown * 0.55) * r * open;
  const p = new Path2D();
  p.moveTo(head.x - half, bite);
  p.quadraticCurveTo(head.x, bite - up * 2, head.x + half, bite);
  p.quadraticCurveTo(head.x, bite + down * 2, head.x - half, bite);
  p.closePath();
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade, 0.95 * open);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.hullRim, fade), STROKE.inner, 0.6 * open * fade);
  // Teeth: five down from the upper lip, five up from the lower, each a
  // sliver, longer as the jaws gape.
  ctx.save();
  ctx.fillStyle = faded(PALETTE.rock, fade, 0.9 * open);
  for (let i = 0; i < 5; i++) {
    const x = head.x - half * 0.7 + (i * half * 1.4) / 4;
    const lipUp = bite - up * (1 - ((x - head.x) / half) ** 2);
    const lipDown = bite + down * (1 - ((x - head.x) / half) ** 2);
    const len = r * (0.06 + 0.1 * Math.max(f.jawUp, f.jawDown));
    ctx.beginPath();
    ctx.moveTo(x - r * 0.04, lipUp);
    ctx.lineTo(x + r * 0.04, lipUp);
    ctx.lineTo(x, lipUp + len);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - r * 0.04, lipDown);
    ctx.lineTo(x + r * 0.04, lipDown);
    ctx.lineTo(x, lipDown - len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Two eyes pooled in the head's fluid, a dark pupil in each, lidded shut as `eye` goes to nought. */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  f: Figure,
  head: Point,
  r: number,
  time: number,
  fade: number,
): void {
  const open = f.eye * (1 - f.back);
  if (open <= 0.02) return;
  const ry = r * 0.16 * open;
  const rx = r * 0.15;
  const look = Math.sin(time * 0.7) * rx * 0.3;
  for (const side of [-1, 1]) {
    const x = head.x + side * r * 0.42;
    const y = head.y - r * 0.3;
    const p = new Path2D();
    p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.save();
    ctx.fillStyle = faded(PALETTE.eyeFluid, fade, 0.85);
    ctx.fill(p);
    ctx.fillStyle = faded(PALETTE.background, fade);
    ctx.beginPath();
    ctx.ellipse(x + look, y, rx * 0.35, ry * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    strokeGlow(ctx, p, faded(PALETTE.eyeFluidRim, fade), STROKE.inner, 0.5 * fade);
  }
}
