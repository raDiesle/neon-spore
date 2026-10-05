import { LIGHT_HALF } from "@neon-spore/content";
import { type MimicState, mimicStep, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { drawMimicBoard, mimicVeil } from "./mimic-board.js";
import { CRANE_RIM, drawMimicCraneArms, drawMimicCraneGrips } from "./mimic-crane.js";
import type { MimicFx } from "./mimic-fx.js";
import { mimicHalfSide, mimicPose, PART, PEELED_BACK } from "./mimic-pose.js";
import { drawMimicFlash, drawMimicPeel } from "./mimic-receipts.js";
import {
  type MimicPose,
  mimicCore,
  mimicMantle,
  mimicMottle,
  mimicReachArm,
} from "./mimic-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE MIMIC**: a soft round mantle with eight short arms hung over the top
 * of the field, its skin a mottle of two dark greens with a rim of marks
 * marching round its edge; then split down the middle on a lit core (§42,
 * `bosses-choreographed.md` §42).
 *
 * **While a picture is up the mantle is a crane holding the board**
 * (`mimic-crane.ts`; the owner, 3 October 2026: the one who does not paint
 * sees no mantle over the field, just the board — and *a crane holding a
 * portrait, but alien, living*). It draws up over the board as the board
 * comes up on `mimicVeil`, and comes back down as it peels or its window runs
 * out. The board is where the two screens differ, and that is the fight;
 * everything the mantle does — the crane, its arms and the arm reaching for
 * the hull, the roll, the split and the core — is the same on both.
 *
 * Everything is read off `world` each frame but its receipts — the peel, the
 * core's flash and the blow it takes — which are `fx`
 * (`mimic-fx.ts`, drawn by `mimic-receipts.ts`), and its own blow at the hull,
 * which is `mimic-blow.ts`.
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
  const veil = mimicVeil(s, beat, beatPhase);
  const split = p.split > 0;
  const hurt = fx.hurt.value;
  ctx.save();
  // Every glow under the fade is `strokeGlowFaded`, which leaves it standing.
  ctx.globalAlpha = 1 - 0.5 * p.spent;
  // The mantle shakes with the blow it took.
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);

  drawMimicCraneArms(ctx, l, cfg, p);
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
  ctx.restore();
  drawMimicBoard(ctx, l, world, s, beatPhase, veil);
  drawMimicCraneGrips(ctx, l, cfg, p);
  // The peel drifts free of the shake, but not of the fade.
  ctx.save();
  ctx.globalAlpha = 1 - 0.5 * p.spent;
  drawMimicPeel(ctx, l, fx.peel);
  ctx.restore();
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

/** The core between the halves: lit while it is bare to be tapped, dull otherwise. */
function drawCore(ctx: CanvasRenderingContext2D, p: MimicPose, s: MimicState): void {
  const core = mimicCore(p);
  ctx.fillStyle = PALETTE.mimicCore;
  ctx.fill(core);
  const step = mimicStep(s);
  if (p.core <= 0 || step === null) return;
  const lit = stepColour("either").rim;
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
  if (p.held > 0)
    strokeGlowFaded(ctx, mantle, PALETTE.mimicSign, STROKE.outline, CRANE_RIM, p.held);
  drawHurt(ctx, mantle, hurt);
}
