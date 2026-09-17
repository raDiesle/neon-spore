import {
  type SimConfig,
  type SurgeState,
  surgeEverting,
  surgeHands,
  surgeHoldsCharge,
  surgeSealing,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SurgeFx } from "./surge-fx.js";
import { drawSurgeGauge } from "./surge-gauge.js";
import { drawSurgeGrips } from "./surge-grip.js";
import {
  type Point,
  surgeBulbCentre,
  surgeBulbPath,
  surgeBulbRx,
  surgeBulbRy,
  surgeEvert01,
  surgePressure01,
} from "./surge-shape.js";
import { showsSurgePressure } from "./view-role-clocks.js";

/**
 * **THE SURGE**: a ribbed bulb hung high over the middle of the field with
 * a seam round its equator, a grip mark on each flank for the two thumbs
 * that share it, and the gauge along the seam read by seat (§11.28).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the body, the ribs inside it, the seam and its marks across it, and the
 * grips last, over everything, because they are what a thumb lands on.
 *
 * Its health is its silhouette: every notch vented is a slit the seam has
 * parted at and a row the bulb hangs lower, and when the last opens the
 * bulb **everts** — folds through its own equator over `surgeEvertBeats`,
 * the inside coming out pale — and then fades over `surgeOutBeats`. A
 * burst pinches it dim and shut for `surgeBurstBeats`, the grips gone with
 * the thumbs. What outlives a frame — the sink, the jolt, the jet — is
 * `effects.boss.surge` (`surge-fx.ts`).
 *
 * **The body swells only on the screen that is shown the pressure.** On the
 * pilot's it throbs with the count of thumbs on it and nothing else, so
 * that a bulb visibly fuller is never the pilot's way round the split
 * (`view-role-clocks.ts`).
 */
export function drawSurge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SurgeState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: SurgeFx,
): void {
  const cfg = world.cfg;
  const c = surgeBulbCentre(l, cfg, s, fx.sinkTiles);
  fx.note(c.x, c.y);
  const pressure = surgePressure01(s, cfg);
  const evert = surgeEvert01(s, cfg, beat, beatPhase);
  const sealing = surgeSealing(s, world);
  const everting = surgeEverting(s);
  // Out: the bulb fades over the beats the boss stands before it goes.
  const outBeats = Math.max(1, cfg.surgeOutBeats);
  const fade = s.outBeat >= 0 ? Math.max(0, 1 - (beat - s.outBeat + beatPhase) / outBeats) : 1;
  if (fade <= 0) return;

  // The swell: pressure on the navigator's screen, thumbs on the pilot's.
  const swell = showsSurgePressure(l.role)
    ? 1 + 0.22 * pressure
    : 1 + 0.03 * surgeHands(s) * (1 + Math.sin(time * 6));
  const pinch = sealing ? 0.72 : 1;
  const rx = surgeBulbRx(l, cfg) * (1 + 0.5 * (swell - 1)) * (sealing ? 0.9 : 1);
  // The eversion folds the body through its equator: flat at the half, and
  // the far side drawn inside out past it.
  const fold = Math.cos(evert * Math.PI);
  const ry = Math.max(
    l.tile * 0.08,
    surgeBulbRy(l) * swell * pinch * (1 - fx.jolt) * Math.abs(fold),
  );
  const inside = fold < 0;

  ctx.save();
  ctx.globalAlpha = fade;
  drawBody(ctx, cfg, s, c, rx, ry, time, pressure, sealing, inside, showsSurgePressure(l.role));
  drawSurgeGauge(ctx, l, cfg, s, c, rx, ry, time, everting);
  if (!everting) drawSurgeGrips(ctx, l, cfg, s, c, rx, ry, time, sealing);
  ctx.restore();
}

/** The ribs: three meridian ellipses, by their half-width as a share of the bulb's. */
const RIBS = [0.3, 0.6, 0.85];

/**
 * The body: the hull's violet, warmed toward its rim as the pressure comes
 * on where the pressure is shown, dim and shut while it re-seals, and pale
 * — the inside out — past the half of the eversion. From `surgeHoldNotches`
 * open it keeps its charge with no thumb on it, and a faint glow inside
 * says so on both screens: that it *holds* is a rule, not a number.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  s: SurgeState,
  c: Point,
  rx: number,
  ry: number,
  time: number,
  pressure: number,
  sealing: boolean,
  inside: boolean,
  warms: boolean,
): void {
  const path = surgeBulbPath(c, rx, ry, time);
  const warm = warms ? pressure * 0.4 : 0;
  const hex = sealing
    ? PALETTE.dim
    : inside
      ? PALETTE.hullRim
      : mixHex(PALETTE.hull, PALETTE.hullRim, warm);
  const rim = sealing ? PALETTE.rock : inside ? PALETTE.hull : PALETTE.hullRim;
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(path);
  ctx.fillStyle = rgba(hex, inside ? 0.8 : 0.55);
  ctx.fill(path);
  if (surgeHoldsCharge(s, cfg) && !sealing) {
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.12 + 0.05 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The ribs: meridians inside the outline, clipped to it, the way a bulb
  // under pressure is ribbed by what holds it in.
  ctx.clip(path);
  ctx.strokeStyle = rgba(rim, sealing ? 0.25 : 0.45);
  ctx.lineWidth = STROKE.inner;
  for (const f of RIBS) {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, rx * f, ry * 1.02, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  ctx.lineJoin = "round";
  ctx.stroke(path);
  ctx.restore();
  strokeGlow(ctx, path, rim, STROKE.inner, sealing ? 0.3 : 0.6 + 0.6 * (warms ? pressure : 0));
}
