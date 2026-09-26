import { LIGHT_HALF } from "@neon-spore/content";
import {
  VISE_SEAMS_PER_LOBE,
  type ViseState,
  viseLitStep,
  viseWindowBeats,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { ViseFx } from "./vise-fx.js";
import { drawViseFlash, drawViseKernel, drawViseLitSeam, viseColour } from "./vise-marks.js";
import {
  viseArrived,
  viseHeldShare,
  viseKernelHurt,
  viseLeft,
  viseLitSide,
  viseOpenAngle,
  viseSplit,
  viseSqueeze,
} from "./vise-pose.js";
import {
  viseCentre,
  viseHinge,
  viseHollowPath,
  viseLift,
  viseLobePath,
  viseRadius,
  viseSeamPath,
  viseSpinePath,
} from "./vise-shape.js";

/**
 * **THE VISE**: a seed-case of two lobes over the middle column, each pinched
 * shut by one seat's thumb and finger, and a kernel in the hollow between them
 * that both cannons are asked to hit (§11.45, `bosses-choreographed.md` §28).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: a pinch is
 * one seat's, but the other has to see which lobe is lit to say so, and a fire
 * step's colour says which cannon answers.
 *
 * **A husk, not flesh**: dry tan shell, the cracks a paler white, and the only
 * colour on it is what a step asks for — the lit seam in white, the kernel in
 * its cannon's colour. **Its health is the kernel**, smaller and brighter for
 * every hit it has taken.
 *
 * What outlives a frame — a crack's thud, a sprung lobe ringing, a kernel
 * hit's flash, the split's, the blow — is `fx` (`vise-fx.ts`), told the
 * kernel's colour here because the event that hits it does not carry one.
 */
export function drawVise(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ViseState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: ViseFx,
): void {
  const cfg = world.cfg;
  const arrived = viseArrived(s, cfg, beat, beatPhase);
  const split = viseSplit(s, cfg, beat, beatPhase);
  const home = viseCentre(l, cfg);

  ctx.save();
  ctx.globalAlpha = (0.2 + 0.8 * arrived) * (1 - 0.7 * split);
  ctx.translate(
    home.x + fx.hurt.shakeX(time, l.tile),
    home.y - viseLift(l, arrived) + fx.thud * l.tile,
  );

  ctx.fillStyle = rgba(PALETTE.background, 0.92);
  ctx.fill(viseHollowPath(l));
  const step = viseLitStep(s);
  if (step?.ask === "fire") fx.tell(viseColour(step.color).rim);
  const firing = step !== null && step.ask === "fire" && s.bared;
  const lit = firing
    ? { color: step.color, left: viseLeft(s, viseWindowBeats(world, step), beat, beatPhase) }
    : null;
  const hurt = viseKernelHurt(s.hits);
  drawViseKernel(ctx, l, hurt.size * (1 - 0.5 * split), hurt.bright, s.bared, lit, beatPhase);

  const held = viseHeldShare(world, s, beatPhase);
  // A pinch lights the seam it will crack; a `both` step lights the tight
  // seam by the spine on each lobe, the same word said to both seats at once.
  const both = step?.ask === "both";
  const litSide = viseLitSide(s);
  for (const side of [0, 1] as const) {
    const lean = viseOpenAngle(world, s, side, beat, beatPhase) + fx.spring(side);
    drawLobe(ctx, l, s, side, lean, viseSqueeze(cfg, s, side), split, time, fx.hurt.value);
    if (both || litSide === side) {
      ctx.save();
      lobeFrame(ctx, l, side, lean, viseSqueeze(cfg, s, side), split);
      const seam = both
        ? VISE_SEAMS_PER_LOBE - 1
        : Math.min(VISE_SEAMS_PER_LOBE - 1, s.cracks[side]);
      drawViseLitSeam(ctx, l, side, seam, held, beatPhase);
      ctx.restore();
    }
  }

  if (split <= 0) {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.viseCrack, 0.35);
    ctx.stroke(viseSpinePath(l));
  }
  drawViseFlash(ctx, l, fx.flash, fx.split);
  ctx.restore();
}

/**
 * Move the canvas into lobe `side`'s own frame: swung `lean` about the hinge
 * at the top of the spine, its bottom outward; narrowed toward the spine by
 * the pinch on it; and, as the case splits, thrown out and down.
 */
function lobeFrame(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  lean: number,
  squeeze: number,
  split: number,
): void {
  const out = side === 0 ? -1 : 1;
  if (split > 0) ctx.translate(out * split * l.tile * 0.9, split * l.tile * 0.7);
  const hinge = viseHinge(l);
  ctx.translate(hinge.x, hinge.y);
  ctx.rotate(-out * lean);
  ctx.translate(-hinge.x, -hinge.y);
  ctx.scale(1 - 0.18 * squeeze, 1);
}

/** One half-shell: tan fill, the key light on it, its bristled outline, the blow over it, and every seam already cracked. */
function drawLobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ViseState,
  side: 0 | 1,
  lean: number,
  squeeze: number,
  split: number,
  time: number,
  hurt: number,
): void {
  const shell = viseLobePath(l, side);
  const { ry, rx } = viseRadius(l);
  ctx.save();
  lobeFrame(ctx, l, side, lean, squeeze, split);
  ctx.fillStyle = rgba(PALETTE.viseCase, 0.95);
  ctx.fill(shell);
  ctx.save();
  ctx.clip(shell);
  litRound(ctx, 0, -ry * 0.2, Math.max(rx, ry), LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.5));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.viseCaseDark, 0.95);
  ctx.stroke(shell);
  drawHurt(ctx, shell, hurt);
  const cracked = Math.min(VISE_SEAMS_PER_LOBE, s.cracks[side]);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.viseCrack, 0.85);
  for (let k = 0; k < cracked; k++) ctx.stroke(viseSeamPath(l, side, k));
  ctx.restore();
}
