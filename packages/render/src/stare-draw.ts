import {
  type StareState,
  stareLevelPattern,
  stareOpenLive,
  stareStepAt,
  stareTeaching,
  type World,
} from "@neon-spore/sim";
import type { EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { STARE_EYE } from "./stare-eye-look.js";
import type { StareFx } from "./stare-fx.js";
import { drawStareLid } from "./stare-lid.js";
import { cowlPath, type StareEye, stareEye, stareFace, stareGazeFootY } from "./stare-shape.js";

/**
 * THE STARE, drawn: the cowled eye over the top of the field, opening on the
 * beats of its pattern — read off the world every frame, with nothing kept
 * (`stare-shape.ts` for where it is and how far the lids stand, `stare-fx.ts`
 * for what outlives a frame).
 *
 * **Every screen sees the same eye**, since 29 September 2026: both seats
 * freeze on an open beat, so the gaze, the score and the lid are on both
 * phones. The **score** is the level's pattern under the eye, one pip a beat,
 * the open beats full and the shut ones hollow, with the beat the eye is on
 * ringed — the rhythm for a player with the sound off (`sim/stare.ts`).
 *
 * **The ink says what an open eye costs**: cyan on the teaching pass, where
 * nothing is caught; the hull's red on a live one; grey while it is shut; and
 * white for the frames after it catches a thumb. The lens is drawn on the
 * beat clock, so the pupil is the same on both phones; the fluid and the
 * lashes on the wall clock, since nobody reads a number off a lash
 * (`content/own-motion.ts`).
 */

/** The pip row: how far under the eye's middle, and how far apart, in socket heights. */
const PIP_DROP = 1.55;
const PIP_GAP = 0.42;

export function drawStare(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  boss: StareState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: StareFx,
): void {
  const cfg = world.cfg;
  const eye = stareEye(l, cfg);
  const f = stareFace(boss, cfg, beat, beatPhase);
  const ink = stareInk(boss, fx.flash);

  // The gaze first, under everything else of the boss: it is light on the
  // field and the eye stands in front of its own light.
  if (boss.open) drawGaze(ctx, l, eye, beatPhase, ink.hex);

  // The cowl, in the field's own rock, with its rim lit a little by the eye.
  const cowl = cowlPath(eye, time);
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(cowl);
  strokeGlow(ctx, cowl, mixHex(PALETTE.dim, ink.rim, 0.5), STROKE.outline, 0.6);
  ctx.restore();

  // The eye, through the record VERSUS patches (`stare-eye-look.ts`).
  STARE_EYE.paint(ctx, {
    e: eye,
    face: f.face,
    lean: f.lean,
    open: f.open,
    ink,
    time,
    beats: beat + beatPhase,
  });
  // The lid over it while it charges, and its ring (`stare-lid.ts`).
  drawStareLid(ctx, l, cfg, boss, time, ink.rim);

  // The score, from the lead-in to the end of the charge.
  if (boss.phase !== "hurt" && boss.phase !== "dying") {
    drawScore(ctx, eye, stareLevelPattern(boss), stareStepAt(boss, beat), ink);
  }
}

/** The eye's ink for each thing an open beat can cost: the hull, nothing, or it is shut. */
const INK = {
  live: { hex: PALETTE.red, rim: PALETTE.redRim },
  teach: { hex: PALETTE.cyan, rim: PALETTE.cyanRim },
  shut: { hex: PALETTE.dim, rim: PALETTE.hullRim },
} as const;

/** The eye's ink for what an open beat would cost now, whitened by a flash. */
function stareInk(s: StareState, flash: number): EyeInk {
  const ink = stareOpenLive(s) ? INK.live : stareTeaching(s) ? INK.teach : INK.shut;
  return { hex: mixHex(ink.hex, PALETTE.text, flash), rim: mixHex(ink.rim, PALETTE.text, flash) };
}

/**
 * The gaze: the eye's light falling down the first rows of the field while
 * it is open, as a beam — the eye's own width where it leaves the socket, the
 * field's where it fades out — so it is light *from* the eye rather than a
 * band across the sky.
 */
function drawGaze(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  e: StareEye,
  beatPhase: number,
  hex: string,
): void {
  const top = e.cy + e.ry * 0.4;
  const bottom = stareGazeFootY(l);
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, rgba(hex, 0.3 + 0.12 * (1 - beatPhase)));
  g.addColorStop(1, rgba(hex, 0));
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(e.cx - e.rx * 0.8, top);
  ctx.lineTo(e.cx + e.rx * 0.8, top);
  ctx.lineTo(l.gridLeft + l.gridWidth, bottom);
  ctx.lineTo(l.gridLeft, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** The score under the eye: open beats full, shut ones hollow, the beat it is on ringed. */
function drawScore(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  pattern: string,
  at: number,
  ink: EyeInk,
): void {
  const n = pattern.length;
  const gap = e.ry * PIP_GAP;
  const r = e.ry * 0.11;
  const y = e.cy + e.ry * PIP_DROP;
  const x0 = e.cx - ((n - 1) * gap) / 2;
  ctx.save();
  ctx.lineWidth = STROKE.inner;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * gap;
    ctx.beginPath();
    ctx.arc(x, y, pattern[i] === "x" ? r * 1.4 : r, 0, Math.PI * 2);
    if (pattern[i] === "x") {
      ctx.fillStyle = ink.rim;
      ctx.globalAlpha = 0.95;
      ctx.fill();
    } else {
      ctx.strokeStyle = PALETTE.dim;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
    }
    if (i === at) {
      ctx.beginPath();
      ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
      ctx.strokeStyle = PALETTE.text;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
    }
  }
  ctx.restore();
}
