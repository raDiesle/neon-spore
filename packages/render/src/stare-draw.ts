import { type SimConfig, type StareState, stareTellLeft, type World } from "@neon-spore/sim";
import { drawEyeFluid, drawEyeFringe, drawEyeLens, type EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { drawInstarWord } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { StareFx } from "./stare-fx.js";
import { drawStareLid } from "./stare-lid.js";
import {
  cowlPath,
  type StareEye,
  stareEye,
  stareFace,
  stareGazeFootY,
  stareHeat,
} from "./stare-shape.js";
import { showsStareTarget, showsStareWatched } from "./view-role-clocks-b.js";

/**
 * THE STARE, drawn: the cowled eye over the top of the field, turned away,
 * coming round, looking, and turning back — read off the world every frame,
 * with nothing kept (`stare-shape.ts` for where it is and how far it has
 * turned, `stare-fx.ts` for the one thing that outlives a frame).
 *
 * **What every screen sees**: the cowl, the eye at its angle, and while it
 * turns the count — one pip a beat of the tell, going out from the left, so
 * *three beats* is a thing either seat can read off the picture and say.
 * The count is no secret: the whole fairness of the boss is that everybody
 * knows a look is coming (`docs/spec/bosses.md` §11.16).
 *
 * **What one screen sees**: the seat's name beside the eye, on the screen of
 * the seat that is *not* about to be frozen — P1 on the navigator's,
 * P2 on the pilot's — from the beat the turn begins to the beat the
 * look ends; and, once the look has landed, the gaze itself falling on the
 * watched seat's field, red from the eye down over the first rows, which is
 * the picture's *hands off* to the one pair of hands it is about
 * (`view-role-clocks-b.ts`). **And the lid**, since 18 September 2026, on
 * every screen, with its ring on the screen of the seat that may pull it
 * (`stare-lid.ts`). The word is `instar-word.ts`'s scanner box,
 * because it is the same kind of mark — the body's own label on a part,
 * bright when it is a job — and a second box would be a second vocabulary.
 *
 * **The ink warms with the turn**: grey while the eye looks elsewhere, the
 * hull's red by the time it is square, and white for the frames after it
 * catches a thumb. The lens is drawn on the beat clock, so the pupil is the
 * same on both phones; the fluid and the lashes on the wall clock, since
 * nobody reads a number off a lash (`content/own-motion.ts`).
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
  const heat = stareHeat(f);
  const flash = fx.flash;
  const ink: EyeInk = {
    hex: mixHex(mixHex(PALETTE.dim, PALETTE.red, heat), PALETTE.text, flash),
    rim: mixHex(mixHex(PALETTE.hullRim, PALETTE.redRim, heat), PALETTE.text, flash),
  };
  // Told from the turn to the end of the look, and under the lid too: whose
  // look the lid shut is still the name beside the eye.
  const told = boss.watching !== 0 && boss.phase !== "away" && boss.phase !== "back";

  // The gaze first, under everything else of the boss: it is light on the
  // field and the eye stands in front of its own light.
  if (boss.phase === "looking" && boss.watching !== 0 && showsStareWatched(l.role, boss.watching)) {
    drawGaze(ctx, l, eye, beatPhase);
  }

  // The cowl, in the field's own rock, with its rim lit a little by the eye.
  const cowl = cowlPath(eye, time);
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(cowl);
  strokeGlow(ctx, cowl, mixHex(PALETTE.dim, ink.rim, 0.5 * heat), STROKE.outline, 0.6);
  ctx.restore();

  drawEye(ctx, eye, f.face, f.lean, f.open, ink, time, beat + beatPhase);
  // The lid over it, and its ring for the seat whose thumb it is (`stare-lid.ts`).
  drawStareLid(ctx, l, cfg, boss, l.role, beat, beatPhase, time, ink.rim);

  // The count, while the eye is turning: one pip a beat of the tell.
  const left = stareTellLeft(boss, beat, cfg.stareTellBeats);
  if (left >= 0) drawPips(ctx, eye, cfg, left, ink);

  // And the name, on the screen that is told.
  if (told && boss.watching !== 0 && showsStareTarget(l.role, boss.watching)) {
    const word = boss.watching === 1 ? "P1" : "P2";
    drawInstarWord(ctx, l, word, eye.cx + eye.rx * 1.2, eye.cy, 1, true);
  }
}

/**
 * The eye at its angle: the whole thing scaled across by `face` and sheared
 * by `lean` about its own middle, so the sliver and the square eye are one
 * picture at two angles rather than two pictures.
 */
function drawEye(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  face: number,
  lean: number,
  open: number,
  ink: EyeInk,
  time: number,
  beats: number,
): void {
  ctx.save();
  ctx.translate(e.cx, e.cy);
  ctx.transform(face, 0, lean, 1, 0, 0);
  drawEyeFluid(ctx, 0, 0, e.rx, e.ry, open, time);
  drawEyeLens(ctx, 0, 0, e.rx, e.ry, ink, open, beats);
  drawEyeFringe(ctx, 0, 0, e.rx, e.ry, ink, open, time);
  // The socket's own rim, the one line there at every angle.
  const rim = new Path2D(
    `M ${-e.rx} 0 Q ${-e.rx * 0.4} ${-e.ry * 1.7} ${e.rx} 0 Q ${e.rx * 0.4} ${e.ry * 1.3} ${-e.rx} 0 Z`,
  );
  strokeGlow(ctx, rim, ink.rim, STROKE.outline, 0.5 + 0.6 * open);
  ctx.restore();
}

/**
 * The gaze: the eye's red falling down the first rows of the watched seat's
 * field, as a beam — the eye's own width where it leaves the socket, the
 * field's where it fades out — so it is light *from* the eye rather than a
 * band across the sky.
 */
function drawGaze(ctx: CanvasRenderingContext2D, l: Layout, e: StareEye, beatPhase: number): void {
  const top = e.cy + e.ry * 0.4;
  const bottom = stareGazeFootY(l);
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, rgba(PALETTE.red, 0.3 + 0.12 * (1 - beatPhase)));
  g.addColorStop(1, rgba(PALETTE.red, 0));
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

/** The tell's count under the eye: the beats left lit, the beats spent hollow. */
function drawPips(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  cfg: SimConfig,
  left: number,
  ink: EyeInk,
): void {
  const n = cfg.stareTellBeats;
  const gap = e.ry * PIP_GAP;
  const r = e.ry * 0.11;
  const y = e.cy + e.ry * PIP_DROP;
  const x0 = e.cx - ((n - 1) * gap) / 2;
  ctx.save();
  ctx.lineWidth = STROKE.inner;
  for (let i = 0; i < n; i++) {
    const lit = i >= n - left;
    const x = x0 + i * gap;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (lit) {
      ctx.fillStyle = ink.rim;
      ctx.globalAlpha = 0.95;
      ctx.fill();
    } else {
      ctx.strokeStyle = PALETTE.dim;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
    }
  }
  ctx.restore();
}
