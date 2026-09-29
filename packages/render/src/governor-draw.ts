import { LIGHT_HALF } from "@neon-spore/content";
import {
  type GovernorState,
  governorChordWhole,
  governorGovernor,
  governorLitStep,
  governorOnMark,
  governorTapper,
  governorTapping,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawGovernorHub } from "./governor-hub.js";
import { drawGovernorMark, drawGovernorStuds, drawGovernorYokeAsk } from "./governor-marks.js";
import {
  governorHeat,
  governorJaws,
  governorLeft,
  governorOrbit,
  governorSpent,
  governorStanding,
  governorSwing,
} from "./governor-pose.js";
import {
  type Dial,
  dialAt,
  dialRing,
  NEEDLE_REACH,
  rimDepth,
  TRACK_IN,
  TRACK_OUT,
} from "./governor-shape.js";
import {
  drawGovernorHalos,
  drawGovernorVerdicts,
  type GovernorVerdicts,
} from "./governor-verdicts.js";
import { drawGovernorWorks } from "./governor-works.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsGovernorHand } from "./view-role-clocks-c.js";

/** The graduations round the track: a long one every other. */
const GRADUATIONS = 16;
/** How far the needle's tip lags its root at the hottest, in thousandths of a lap. */
const LAG = 45;
/** The needle's tail past the hub, in radii. */
const TAIL = 0.16;

/**
 * **THE GOVERNOR**: a flywheel lying mid-field under a governor's spindle,
 * its needle sweeping a graduated track on its own, braked by one seat's
 * chord on the yoke and tapped by the other as it crosses the lit mark; then
 * the hub the needle turns on, lit and shot (§11.58,
 * `bosses-choreographed.md` §43).
 *
 * **Both screens are drawn the same governor**, because the needle's pace is
 * the one number the pair share and neither is told it: it is the
 * flyweights, hanging slow by the spindle while the chord holds and flying
 * out and up — the collar climbing after them — the instant a pad lifts
 * (`governor-pose.ts`). Only the asks differ by seat (`showsGovernorHand`).
 *
 * **Its health is read off the body**, no bar: six studs on the face are the
 * two runs, the hub dark until both are spent and lit in a shot's colour
 * after, smaller and brighter per hit. Everything but the verdicts on a
 * touch (`governor-verdicts.ts`) is read off `world` each frame — a tap's
 * flash on the rim, a skid's scrape and its own blow at the hull are the
 * look's second part.
 */
export function drawGovernor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GovernorState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: GovernorVerdicts,
): void {
  const cfg = world.cfg;
  const d = governorStanding(l, cfg, s, beat, beatPhase);
  ctx.save();
  // `strokeGlow` leaves the alpha at 1, so the fade is set again after each part that glows.
  const fade = 1 - 0.5 * governorSpent(s, cfg, beat, beatPhase);
  ctx.globalAlpha = fade;

  drawWheel(ctx, l, d);
  drawGovernorHalos(ctx, l, d, s, time);
  const step = governorLitStep(s);
  const tapper = governorTapper(s);
  if (step !== null && tapper !== null) {
    const full = showsGovernorHand(l.role, tapper);
    const left = governorLeft(s, beat, beatPhase);
    drawGovernorMark(ctx, d, step.markMilli, cfg.governorMarkMilli, left, full, beatPhase);
  }
  drawGovernorStuds(ctx, l, d, s.taps);
  ctx.globalAlpha = fade;
  drawNeedle(ctx, d, s.needleMilli, governorHeat(s, cfg), governorOnMark(world, s));
  ctx.globalAlpha = fade;
  drawGovernorHub(ctx, l, d, s, beat, beatPhase);
  ctx.globalAlpha = fade;

  const governor = governorGovernor(s);
  const jaws = drawGovernorWorks(ctx, l, d, {
    swing: governorSwing(s, cfg, beat, beatPhase),
    orbit: governorOrbit(s),
    pads: governorJaws(s),
  });
  if (governor !== null && governorTapping(s)) {
    const whole = governorChordWhole(s, governor === 1 ? 0 : 1);
    drawGovernorYokeAsk(ctx, jaws, whole, showsGovernorHand(l.role, governor), beatPhase);
  }
  ctx.globalAlpha = fade;
  drawGovernorVerdicts(ctx, l, d, s, time, fx.verdicts);
  ctx.restore();
}

/**
 * The flywheel: its brass edge showing under the face, the rim lit from the
 * key over the whole disc, the dark face inside it, and the graduations
 * round the track.
 */
function drawWheel(ctx: CanvasRenderingContext2D, l: Layout, d: Dial): void {
  const drop = rimDepth(l, d);
  ctx.fillStyle = PALETTE.governorBrassDark;
  ctx.fill(dialRing(d, 1, drop));
  ctx.fillRect(d.cx - d.r, d.cy, d.r * 2, drop);
  const rim = dialRing(d, 1);
  ctx.save();
  ctx.fillStyle = PALETTE.governorBrass;
  ctx.fill(rim);
  ctx.clip(rim);
  ctx.translate(d.cx, d.cy);
  ctx.scale(1, d.tilt);
  litRound(ctx, 0, 0, d.r + 2, LIGHT_HALF.rock);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.governorBrassDark, 0.95);
  ctx.stroke(rim);

  ctx.fillStyle = PALETTE.governorFace;
  ctx.fill(dialRing(d, TRACK_OUT + 0.02));
  const ticks = new Path2D();
  for (let i = 0; i < GRADUATIONS; i++) {
    const milli = (1000 * i) / GRADUATIONS;
    const from = dialAt(d, milli, i % 2 === 0 ? TRACK_IN : (TRACK_IN + TRACK_OUT) / 2);
    const to = dialAt(d, milli, TRACK_OUT);
    ticks.moveTo(from.x, from.y);
    ticks.lineTo(to.x, to.y);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.governorBrass, 0.8);
  ctx.stroke(ticks);
  ctx.stroke(dialRing(d, TRACK_IN));
}

/**
 * The needle, THE VANE's arm laid on the face: from a short tail past the
 * hub out to the track, its tip lagging its root as it runs hot, so a needle
 * sprinting whips. Brass, and a hot pale amber while it is on the lit mark.
 */
function drawNeedle(
  ctx: CanvasRenderingContext2D,
  d: Dial,
  milli: number,
  heat: number,
  hot: boolean,
): void {
  const arm = new Path2D();
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const f = -TAIL + ((NEEDLE_REACH + TAIL) * i) / n;
    const lag = f > 0 ? LAG * heat * (f / NEEDLE_REACH) ** 2 : 0;
    const at = dialAt(d, milli - lag, f);
    if (i === 0) arm.moveTo(at.x, at.y);
    else arm.lineTo(at.x, at.y);
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(arm);
  ctx.restore();
  if (hot) strokeGlow(ctx, arm, PALETTE.governorHot, STROKE.outline, 1.2, 1);
  else {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = PALETTE.governorBrass;
    ctx.stroke(arm);
  }
}
