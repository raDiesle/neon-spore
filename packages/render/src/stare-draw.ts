import {
  type StareState,
  stareBlue,
  stareCharging,
  stareLevelPattern,
  stareOpenLive,
  stareStepAt,
  type World,
} from "@neon-spore/sim";
import type { EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawCharge, drawVent } from "./stare-charge.js";
import { STARE_EYE } from "./stare-eye-look.js";
import type { StareFx } from "./stare-fx.js";
import { drawStareLashPull } from "./stare-lash-pull.js";
import { drawLashes, drawScars } from "./stare-lashes.js";
import { drawStareBrow, drawStareTurns, stareAnger, stareLevelInk } from "./stare-level-look.js";
import {
  cowlPath,
  type StareEye,
  stareEye,
  stareFace,
  stareGazeFootY,
  stareSwell,
  swollenEye,
} from "./stare-shape.js";
import { drawStareShell } from "./stare-shell.js";

/**
 * THE STARE, drawn: the cowled eye over the top of the field, opening on the
 * beats of its pattern — read off the world every frame, with nothing kept
 * (`stare-shape.ts` for where it is and how far the lids stand, `stare-fx.ts`
 * for what outlives a frame).
 *
 * **Every screen sees the same eye**, since 29 September 2026: both seats
 * freeze on an open beat, so the gaze, the score and the lid are on both
 * phones. The **score** is the fan of lashes under the eye, one a beat of
 * the level's pattern (`stare-lashes.ts`) — the rhythm for a player with the
 * sound off. The cowl carries a scar for every level survived, the charge
 * and the vent are `stare-charge.ts`'s, and the lashes the charge asks to be
 * pulled are `stare-lash-pull.ts`'s.
 *
 * **The ink says what an open eye costs**: cyan on the teaching pass and its
 * lead-in, where nothing is caught, with a halo round the cowl; the level's
 * colour on an open live beat — yellow, orange, red, violet, the eye angrier
 * under its brow each level (`stare-level-look.ts`); ember while it charges;
 * grey while it is shut; and white for the frames after it catches a thumb.
 * Under the eye, the turns left before the next level; over all of it, the
 * glass that says nothing the pair fires can hurt it (`stare-shell.ts`). The lens is drawn on the
 * beat clock, so the pupil is the same on both phones; the fluid and the
 * lashes on the wall clock, since nobody reads a number off a lash
 * (`content/own-motion.ts`).
 */

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
  const socket = stareEye(l, cfg);
  const swell = stareSwell(boss, cfg, beat, beatPhase);
  const eye = swollenEye(socket, swell);
  const f = stareFace(boss, cfg, beat, beatPhase);
  const level = stareLevelInk(boss);
  const ink = stareInk(boss, level, fx.flash);
  const anger = stareAnger(boss);
  // The fluid the ball stands in: the lesson's cyan, or the level's colour.
  const wash = stareBlue(boss) ? INK.teach : level;

  // The gaze first, under everything else of the boss: it is light on the
  // field and the eye stands in front of its own light.
  if (boss.open) drawGaze(ctx, l, eye, beatPhase, ink.hex);
  drawVent(ctx, l, socket, fx.vent);

  // The cowl, in the field's own rock, with its rim lit a little by the eye —
  // and, through the blue pass and its lead-in, a halo of the lesson's cyan
  // breathing on the beat, so the eye that costs nothing looks it.
  const cowl = cowlPath(socket, time);
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(cowl);
  if (stareBlue(boss)) {
    const breath = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
    strokeGlow(ctx, cowl, PALETTE.cyan, STROKE.outline * 2, 1.6 + 1.4 * breath, 0.9, l.tile * 0.5);
  } else {
    // Outside the lesson, the level's colour round the cowl, hotter as it angers.
    strokeGlow(ctx, cowl, level.hex, STROKE.outline * 1.5, 0.6 + anger, 0.35 + 0.4 * anger);
  }
  // And through the charge, the same halo in ember, hotter as it fills.
  if (swell > 0) {
    strokeGlow(
      ctx,
      cowl,
      PALETTE.ember,
      STROKE.outline * 2,
      1 + 2 * swell,
      0.5 + 0.5 * swell,
      l.tile * 0.5,
    );
  }
  strokeGlow(ctx, cowl, mixHex(PALETTE.dim, ink.rim, 0.5), STROKE.outline, 0.6);
  ctx.restore();
  drawScars(ctx, socket, boss.level);

  // The eye, through the record VERSUS patches (`stare-eye-look.ts`).
  STARE_EYE.paint(ctx, {
    e: eye,
    face: f.face,
    lean: f.lean,
    open: f.open,
    ink,
    wash,
    time,
    beats: beat + beatPhase,
  });
  drawStareBrow(ctx, socket, anger, wash);
  drawCharge(ctx, eye, swell, beatPhase, time);
  // The lashes over it while it charges, to be pulled (`stare-lash-pull.ts`).
  drawStareLashPull(ctx, l, cfg, boss, time);

  // The lashes are the score, from the lead-in to the end of the pass.
  if (boss.phase === "rest" || boss.phase === "teach" || boss.phase === "live") {
    drawLashes(ctx, socket, stareLevelPattern(boss), stareStepAt(boss, beat), wash, anger);
  }
  if (boss.phase !== "rise" && boss.phase !== "calm") {
    drawStareTurns(ctx, l, cfg, socket, boss, wash);
  }
  drawStareShell(ctx, socket, time, fx.ping);
}

/** The eye's ink for each thing an open beat can cost but the level's own: nothing, the charge, or it is shut. */
const INK = {
  teach: { hex: PALETTE.cyan, rim: PALETTE.cyanRim },
  charge: { hex: PALETTE.ember, rim: PALETTE.emberRim },
  shut: { hex: PALETTE.dim, rim: PALETTE.hullRim },
} as const;

/** The eye's ink for what an open beat would cost now, whitened by a flash. */
function stareInk(s: StareState, level: EyeInk, flash: number): EyeInk {
  const ink = stareOpenLive(s)
    ? level
    : stareBlue(s)
      ? INK.teach
      : stareCharging(s)
        ? INK.charge
        : INK.shut;
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
