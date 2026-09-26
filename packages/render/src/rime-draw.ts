import { LIGHT_HALF } from "@neon-spore/content";
import {
  midCol,
  type RimeState,
  rimeIcicleCol,
  rimeLitStep,
  rimeRubbing,
  type World,
} from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import { fieldX } from "./field-flip.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawRimeCore, drawRimeLitHalf, drawRimeSurge } from "./rime-marks.js";
import { rimeArrived, rimeClear, rimeLeft, rimeShatter, rimeSurge } from "./rime-pose.js";
import {
  RIME_SHEETS,
  rimeCentre,
  rimeFacetPath,
  rimeHalfPath,
  rimeLensPath,
  rimeLift,
  rimePatchPath,
  rimeRadius,
  rimeSheet,
} from "./rime-shape.js";
import { drawRimeFog, drawRimeIcicle, rimeFog, rimeIcicle, rimeSink } from "./rime-story.js";

/**
 * **THE RIME**: a frosted pane of glass over the middle column, each half
 * wiped clear by one seat's thumb, and a core behind it that both cannons are
 * asked to hit once the frost is gone (§11.46, `bosses-choreographed.md` §29).
 *
 * **Both screens are drawn the same.** Nothing here reads `l.role`: a wipe is
 * one seat's, but the other has to see which half is lit to say so, and a fire
 * step's colour says which cannon answers.
 *
 * **Glass under ice**: the pane THE OCULUS's dull grey, the frost a pale
 * blue-white that is neither cannon's colour, and the only colour on it is
 * what a step asks for — the lit half in white, the core in its cannon's
 * colour (§29, *Colour*). **Its health is the frost and the core**: a half's
 * clear patch as wide as its frost is gone, and the core smaller and brighter
 * for every hit. Nothing here outlives a frame.
 */
export function drawRime(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: RimeState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const arrived = rimeArrived(s, cfg, beat, beatPhase);
  const shatter = rimeShatter(s, cfg, beat, beatPhase);
  const home = rimeCentre(l, cfg);
  const alpha = 0.2 + 0.8 * arrived;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(home.x, home.y - rimeLift(l, arrived));

  if (shatter <= 0) drawGlass(ctx, l, time);
  const step = rimeLitStep(s);
  const firing = step !== null && step.ask === "fire" && s.bared;
  const lit = firing ? { color: step.color, left: rimeLeft(s, beat, beatPhase) } : null;
  const hurt = coreHurt(s.hits);
  drawRimeCore(ctx, l, hurt.size * (1 - 0.6 * shatter), hurt.bright, s.bared, lit, beatPhase);
  ctx.globalAlpha = alpha;

  if (shatter > 0) {
    drawSheets(ctx, l, shatter);
    ctx.restore();
    return;
  }
  const asked =
    step !== null && (step.ask === "left" || step.ask === "right" || step.ask === "both");
  for (const side of [0, 1] as const) {
    // The half a wipe asks for stands out by the other going dull; the whiteout lights both.
    const rubbing = rimeRubbing(s, side);
    const film = !asked || rubbing ? 0.88 : 0.6;
    drawFrost(ctx, l, side, rimeClear(s, side), film);
    if (rubbing) drawRimeLitHalf(ctx, l, side, beatPhase);
    ctx.globalAlpha = alpha;
  }
  const clear = Math.min(rimeClear(s, 0), rimeClear(s, 1));
  drawRimeFog(ctx, l, rimeFog(s, beat, beatPhase), clear, time);
  ctx.globalAlpha = alpha;
  if (step?.ask === "icicle") {
    const dx = fieldX(l, rimeIcicleCol(midCol(cfg), step)) - home.x;
    const toHull = l.hullY - (home.y - rimeLift(l, arrived));
    const sink = rimeSink(s, beat, beatPhase);
    drawRimeIcicle(ctx, l, rimeIcicle(s, beat, beatPhase), sink, dx, toHull, beatPhase);
    ctx.globalAlpha = alpha;
  }
  const surge = rimeSurge(s, beat, beatPhase);
  if (step?.ask === "shield") drawRimeSurge(ctx, l, surge, beatPhase);
  ctx.globalAlpha = alpha;

  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.4);
  const spine = new Path2D();
  const { ry } = rimeRadius(l);
  spine.moveTo(0, -ry * 0.97);
  spine.lineTo(0, ry * 0.97);
  ctx.stroke(spine);
  ctx.restore();
}

/** The bare pane: dull grey glass, the key light on it, and its pale rim. */
function drawGlass(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
  const lens = rimeLensPath(l);
  const { rx, ry } = rimeRadius(l);
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.fill(lens);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.7);
  ctx.fill(lens);
  ctx.save();
  ctx.clip(lens);
  litRound(ctx, 0, -ry * 0.2, Math.max(rx, ry), LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.5));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.stroke(lens);
}

/**
 * Half `side`'s frost, `clear` of it wiped away and `film` opaque: the pale film over the whole
 * half with the clear patch cut out of it, and THE CAIRN's seven seams left
 * showing on what is still frosted.
 */
function drawFrost(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  clear: number,
  film: number,
): void {
  if (clear >= 1) return;
  const half = rimeHalfPath(l, side);
  const frost = new Path2D();
  frost.addPath(half);
  const patch = clear > 0 ? rimePatchPath(l, side, clear) : null;
  if (patch !== null) frost.addPath(patch);
  ctx.save();
  ctx.clip(half);
  ctx.fillStyle = rgba(PALETTE.rimeFrost, film);
  ctx.fill(frost, "evenodd");
  ctx.clip(frost, "evenodd");
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rimeFrostDeep, 0.55);
  for (let k = 0; k < RIME_SHEETS; k++) {
    const sheet = rimeSheet(l, k);
    ctx.save();
    ctx.translate(sheet.x, sheet.y);
    ctx.stroke(rimeFacetPath(sheet.r, sheet.spin, k));
    ctx.restore();
  }
  ctx.restore();
  if (patch === null) return;
  ctx.save();
  ctx.clip(half);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rimeFrost, 0.95);
  ctx.stroke(patch);
  ctx.restore();
}

/** The shatter, `shatter` of the way through: the pane's seven sheets falling away apart, turning as they go. */
function drawSheets(ctx: CanvasRenderingContext2D, l: Layout, shatter: number): void {
  const fade = 1 - shatter;
  for (let k = 0; k < RIME_SHEETS; k++) {
    const sheet = rimeSheet(l, k);
    const facet = rimeFacetPath(sheet.r * 0.8, sheet.spin, k);
    ctx.save();
    ctx.translate(
      sheet.x * (1 + 0.7 * shatter),
      sheet.y + shatter * shatter * (2 + 0.3 * k) * l.tile,
    );
    ctx.rotate((k % 2 === 0 ? 1 : -1) * shatter * (0.6 + 0.1 * k));
    ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.8 * fade);
    ctx.fill(facet);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rimeFrostDeep, 0.9 * fade);
    ctx.stroke(facet);
    ctx.restore();
  }
}
