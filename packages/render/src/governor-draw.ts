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
import { drawHurt } from "./boss-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import type { GovernorFx } from "./governor-fx.js";
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
import { drawGovernorFlash, drawGovernorScrape, drawGovernorTap } from "./governor-receipts.js";
import {
  type Dial,
  dialAt,
  dialRing,
  NEEDLE_REACH,
  rimDepth,
  TRACK_IN,
  TRACK_OUT,
} from "./governor-shape.js";
import { drawGovernorHalos, drawGovernorVerdicts } from "./governor-verdicts.js";
import { drawGovernorWorks } from "./governor-works.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";
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
 * after, smaller and brighter per hit. Everything but what the events
 * leave behind is read off `world` each frame: a tap's flash on the rim, a
 * skid's scrape, the hub's flash, the blow it takes and its marks' verdicts
 * are `fx` (`governor-fx.ts`, drawn by `governor-receipts.ts`); its own blow
 * at the hull is `governor-blow.ts`.
 */
export function drawGovernor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GovernorState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: GovernorFx,
): void {
  const cfg = world.cfg;
  const d = governorStanding(l, cfg, s, beat, beatPhase);
  const step = governorLitStep(s);
  fx.note(s.needleMilli, step?.ask === "fire" ? stepColour(step.color).rim : PALETTE.hullRim);
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  // Every glow under the fade is `strokeGlowFaded`, which leaves it standing.
  ctx.globalAlpha = 1 - 0.5 * governorSpent(s, cfg, beat, beatPhase);

  drawWheel(ctx, l, d, fx.hurt.value);
  drawGovernorScrape(ctx, d, fx.scrape);
  drawGovernorHalos(ctx, l, d, s, time);
  const tapper = governorTapper(s);
  if (step !== null && tapper !== null) {
    const full = showsGovernorHand(l.role, tapper);
    const left = governorLeft(s, beat, beatPhase);
    drawGovernorMark(ctx, d, step.markMilli, cfg.governorMarkMilli, left, full, beatPhase);
  }
  drawGovernorTap(ctx, d, fx.tap);
  drawGovernorStuds(ctx, l, d, s.taps);
  drawNeedle(ctx, d, s.needleMilli, governorHeat(s, cfg), governorOnMark(world, s));
  drawGovernorHub(ctx, l, d, s, beat, beatPhase);
  drawGovernorFlash(ctx, l, d, fx.flash);

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
  drawGovernorVerdicts(ctx, l, d, s, time, fx.verdicts);
  ctx.restore();
}

/**
 * The flywheel: its brass edge showing under the face, the rim lit from the
 * key over the whole disc and red with a blow taken, the dark face inside
 * it, and the graduations round the track.
 */
function drawWheel(ctx: CanvasRenderingContext2D, l: Layout, d: Dial, hurt: number): void {
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
  drawHurt(ctx, rim, hurt);

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
  if (hot) strokeGlowFaded(ctx, arm, PALETTE.governorHot, STROKE.outline, 1.2, 1);
  else {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = PALETTE.governorBrass;
    ctx.stroke(arm);
  }
}
