import { LIGHT_HALF } from "@neon-spore/content";
import {
  type MimicState,
  mimicDraws,
  mimicStep,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import type { MimicFx } from "./mimic-fx.js";
import { drawMimicPad } from "./mimic-pad.js";
import {
  mimicHalfSide,
  mimicPose,
  mimicRise,
  mimicSignAt,
  PART,
  PEELED_BACK,
} from "./mimic-pose.js";
import { drawMimicFlash, drawMimicPeel } from "./mimic-receipts.js";
import {
  type MimicPose,
  mimicCore,
  mimicMantle,
  mimicMottle,
  mimicReachArm,
} from "./mimic-shape.js";
import { drawMimickedSign, drawSkinSign } from "./mimic-sign.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";
import { showsMimicPad, showsMimicSign } from "./view-role-clocks-c.js";

/**
 * **THE MIMIC**: a soft round mantle with eight short arms hung over the top
 * of the field, its skin a mottle of two dark greens with a rim of marks
 * marching round its edge; a sign surfacing on it in pale cyan; then split
 * down the middle on a lit core (§42, `bosses-choreographed.md` §42).
 *
 * **The screens are not drawn the same**, and that is the fight
 * (`showsMimicSign`, `showsMimicPad`): the sign a seat must draw is drawn on
 * the *other* seat's screen only, and that seat's own screen shows the
 * mottle where it would be, and the faint pad over the lower field. Every
 * other thing — the mantle, its arms and the arm reaching for the hull, the
 * roll, the split and the core — is the same on both.
 *
 * **A mimicked sign is on both screens**, in the hull's red, so the drawer
 * sees what was drawn. Everything is read off `world` each frame but its
 * receipts — the peel, the core's flash and the blow it takes — which are
 * `fx` (`mimic-fx.ts`, drawn by `mimic-receipts.ts`), and its own blow at the
 * hull, which is `mimic-blow.ts`.
 */
export function drawMimic(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MimicState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: MimicFx,
): void {
  const cfg = world.cfg;
  const p = mimicPose(l, cfg, s, beat, beatPhase);
  fx.note(p);
  const split = p.split > 0;
  const hurt = fx.hurt.value;
  ctx.save();
  // Every glow under the fade is `strokeGlowFaded`, which leaves it standing.
  ctx.globalAlpha = 1 - 0.5 * p.spent;
  // The mantle shakes with the blow it took.
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);

  drawReach(ctx, l, p);
  if (split) drawCore(ctx, p, s);
  if (split) {
    for (const seat of [1, 2] as const) {
      const back = s.peeled[seat - 1] ? PEELED_BACK : 0;
      const dx = mimicHalfSide(l, seat) * Math.min(1, p.split + back) * PART * 0.5 * p.r;
      // Moved first and cut after, so the cut moves with its half and the core shows between.
      ctx.save();
      ctx.translate(dx, 0);
      clipHalf(ctx, l, p, seat);
      drawSkin(ctx, l, { ...p, face: seat }, hurt);
      ctx.restore();
    }
  } else drawSkin(ctx, l, p, hurt);
  drawMimicFlash(ctx, p, fx.flash);
  drawSigns(ctx, l, cfg, s, p, split, beat, beatPhase);
  ctx.restore();
  // The peel drifts free of the shake, but not of the fade.
  ctx.save();
  ctx.globalAlpha = 1 - 0.5 * p.spent;
  drawMimicPeel(ctx, l, fx.peel);
  ctx.restore();

  for (const seat of [1, 2] as const) {
    if (mimicDraws(s, seat) && showsMimicPad(l.role, seat)) {
      drawMimicPad(ctx, l, beatPhase);
      break;
    }
  }
}

/** The arm reaching down toward the hull, behind the mantle it hangs from. */
function drawReach(ctx: CanvasRenderingContext2D, l: Layout, p: MimicPose): void {
  const arm = mimicReachArm(l, p);
  if (arm === null) return;
  ctx.fillStyle = PALETTE.mimicSkin;
  ctx.fill(arm);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.mimicSkinDark;
  ctx.stroke(arm);
}

/** The core between the halves: lit in its cannon's colour while it is bare to be shot, dull otherwise. */
function drawCore(ctx: CanvasRenderingContext2D, p: MimicPose, s: MimicState): void {
  const core = mimicCore(p);
  ctx.fillStyle = PALETTE.mimicCore;
  ctx.fill(core);
  const step = mimicStep(s);
  if (p.core <= 0 || step === null) return;
  const lit = stepColour(step.ask === "core" ? step.color : "either").rim;
  ctx.fillStyle = rgba(lit, p.core);
  ctx.fill(core);
  strokeGlowFaded(ctx, core, lit, STROKE.outline, p.core, 1);
}

/** Only the half of the screen a seat's half of the skin lies on. */
function clipHalf(ctx: CanvasRenderingContext2D, l: Layout, p: MimicPose, seat: 1 | 2): void {
  const side = mimicHalfSide(l, seat);
  const half = new Path2D();
  half.rect(side < 0 ? 0 : p.x, 0, side < 0 ? p.x : l.width - p.x, l.height);
  ctx.clip(half);
}

/** The mantle: its shadow, the skin, the mottle, the key light, its outline round the arms and marks, and the blow's red. */
function drawSkin(ctx: CanvasRenderingContext2D, l: Layout, p: MimicPose, hurt: number): void {
  const mantle = mimicMantle(p);
  ctx.save();
  ctx.translate(0, l.tile * 0.12);
  ctx.fillStyle = PALETTE.mimicSkinDark;
  ctx.fill(mantle);
  ctx.restore();
  ctx.fillStyle = PALETTE.mimicSkin;
  ctx.fill(mantle);
  ctx.save();
  ctx.clip(mantle);
  ctx.fillStyle = PALETTE.mimicMottle;
  for (const spot of mimicMottle(p)) {
    const blot = new Path2D();
    blot.ellipse(spot.x, spot.y, spot.r, Math.max(1, spot.r * p.squash), 0, 0, Math.PI * 2);
    ctx.fill(blot);
  }
  litRound(ctx, p.x, p.y, p.r * 1.4, LIGHT_HALF.creature);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.mimicSkinDark;
  ctx.stroke(mantle);
  drawHurt(ctx, mantle, hurt);
}

/**
 * The signs: each seat's on this screen if this screen is shown it, rising
 * from the middle; or, while the skin is mimicking, what was drawn wrong in
 * the hull's red, on every screen.
 */
function drawSigns(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: MimicState,
  p: MimicPose,
  split: boolean,
  beat: number,
  beatPhase: number,
): void {
  const rise = mimicRise(cfg, s, beat, beatPhase);
  for (const seat of [1, 2] as const) {
    const i = seat - 1;
    const at = mimicSignAt(l, p, split, seat);
    if (s.phase === "mimicking") {
      drawMimickedSign(ctx, s.drawn[i] ?? -1, at.x, at.y, at.size, p.wave * 3, 1);
      continue;
    }
    if (!mimicDraws(s, seat) || !showsMimicSign(l.role, seat)) continue;
    drawSkinSign(ctx, s.signs[i] ?? -1, at.x, at.y, at.size, rise);
  }
}
