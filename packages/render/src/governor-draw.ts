import { LIGHT_HALF } from "@neon-spore/content";
import {
  type GovernorState,
  governorFiring,
  governorLitStep,
  governorMarkLanded,
  governorOff,
  governorOpenMarks,
  governorTapping,
  type World,
} from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlowFaded } from "./glow.js";
import type { GovernorFx } from "./governor-fx.js";
import { drawGovernorHub } from "./governor-hub.js";
import {
  drawGovernorMark,
  drawGovernorStuds,
  drawGovernorWindow,
  type GovernorMarkLook,
} from "./governor-marks.js";
import {
  governorHeat,
  governorLeft,
  governorNeedleShown,
  governorOrbit,
  governorOwed,
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
import { governorStopper } from "./governor-stop.js";
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
/** The needle's tail past the hub, and its width, in radii. */
const TAIL = 0.16;
const NEEDLE_WIDE = 0.045;

/** The clock a frame of the governor is drawn on, and how far ahead of the world its needle is shown. */
export interface GovernorClock {
  beat: number;
  beatPhase: number;
  time: number;
  /** This device's input delay, in ticks (`ViewState.leadTicks`). */
  lead: number;
}

/**
 * **THE GOVERNOR**: a flywheel lying mid-field under a governor's spindle,
 * its needle sweeping a graduated track on its own, a mark lit on it for each
 * seat to tap as the needle crosses; then the hub the needle turns on, lit
 * and shot as the needle points down (§11.58, `bosses-choreographed.md` §43).
 *
 * **Both screens are drawn the same governor**, the marks included; each
 * seat's own breathe on its screen and the partner's are faint
 * (`showsGovernorHand`). **The needle is drawn `lead` ticks ahead** of the
 * simulation, the input delay, THE PULSE's lead (`pulse-fall.ts`): a press is
 * heard that many ticks after it is made, and a needle quick enough to cross
 * a mark in a tenth of a second would otherwise be judged a mark past where
 * the thumb saw it. The flyweights fly higher the quicker the step's pace
 * (`governor-pose.ts`).
 *
 * **Its health is read off the body**, no bar: studs on the face count each
 * seat's taps, the hub dark until the first shot is owed and lit in a shot's
 * colour after, smaller and brighter per hit. Everything but what the events
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
  clock: GovernorClock,
  fx: GovernorFx,
  stops?: BoltStops,
): void {
  const { beat, beatPhase, time } = clock;
  const cfg = world.cfg;
  const d = governorStanding(l, cfg, s, beat, beatPhase);
  const needle = governorNeedleShown(world, s, clock.lead);
  stops?.aim(governorStopper(l, world, s, d));
  const step = governorLitStep(s);
  fx.note(s.needleMilli, step?.ask === "fire" ? stepColour(step.color).rim : PALETTE.hullRim);
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  // Every glow under the fade is `strokeGlowFaded`, which leaves it standing.
  ctx.globalAlpha = 1 - 0.5 * governorSpent(s, cfg, beat, beatPhase);

  drawWheel(ctx, l, d, fx.hurt.value);
  drawGovernorScrape(ctx, d, fx.scrape);
  drawGovernorHalos(ctx, l, d, s, time);
  let hot = false;
  if (step !== null && governorTapping(s)) {
    const open = governorOpenMarks(s);
    step.marks.forEach((mark, i) => {
      const landed = governorMarkLanded(s, i);
      const mine = showsGovernorHand(l.role, mark.seat) && open.includes(i);
      const look: GovernorMarkLook = landed ? "landed" : mine ? "open" : "other";
      const number = step.ordered ? i + 1 : null;
      drawGovernorMark(ctx, l, d, mark.markMilli, cfg.governorMarkMilli, look, beatPhase, number);
      if (!landed && open.includes(i)) {
        hot ||= governorOff(needle, mark.markMilli) <= cfg.governorMarkMilli;
      }
    });
    drawGovernorWindow(ctx, d, governorLeft(s, beat, beatPhase));
  }
  drawGovernorTap(ctx, d, fx.tap);
  drawGovernorStuds(ctx, l, d, s.taps, governorOwed(s));
  // No whip while a shot is owed: the crosshair rides the tip (`governorNeedleCircle`).
  drawNeedle(ctx, d, needle, governorFiring(s) ? 0 : governorHeat(s, cfg), hot);
  drawGovernorHub(ctx, l, d, s, beat, beatPhase);
  drawGovernorFlash(ctx, l, d, fx.flash);

  drawGovernorWorks(ctx, l, d, {
    swing: governorSwing(s, cfg, beat, beatPhase),
    orbit: governorOrbit(needle),
  });
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
 * hub out to the track, its tip lagging its root as it runs quick, so a
 * needle sprinting whips. Brass, and a hot pale amber while it is on a mark
 * open to a tap.
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
  ctx.lineWidth = Math.max(STROKE.outline * 1.6, d.r * NEEDLE_WIDE);
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(arm);
  ctx.restore();
  const core = Math.max(STROKE.inner, d.r * NEEDLE_WIDE * 0.4);
  if (hot) strokeGlowFaded(ctx, arm, PALETTE.governorHot, core, 1.2, 1);
  else {
    ctx.lineWidth = core;
    ctx.strokeStyle = PALETTE.governorBrass;
    ctx.stroke(arm);
  }
}
