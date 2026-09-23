import {
  type SimConfig,
  type SurgeState,
  surgeEverting,
  surgeHands,
  surgeHoldsCharge,
  surgeSealing,
  surgeWarding,
  type World,
} from "@neon-spore/sim";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { paintSac } from "./surge-flesh.js";
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
  drawBody(
    ctx,
    cfg,
    s,
    c,
    rx,
    ry,
    time,
    pressure,
    sealing,
    inside,
    showsSurgePressure(l.role),
    l.tile,
  );
  drawSurgeGauge(ctx, l, cfg, s, c, rx, ry, time, everting);
  if (!everting) drawSurgeGrips(ctx, l, cfg, s, c, rx, ry, time, sealing, surgeWarding(s, world));
  ctx.restore();
}

/**
 * The body: a sac of the hull's violet (`surge-flesh.ts`), its lower wall lit
 * from inside and warmed toward its rim as the pressure comes
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
  tile: number,
): void {
  const path = surgeBulbPath(c, rx, ry, time);
  const warm = warms ? pressure * 0.4 : 0;
  const hex = sealing
    ? PALETTE.dim
    : inside
      ? PALETTE.hullRim
      : mixHex(PALETTE.hull, PALETTE.hullRim, warm);
  const rim = sealing ? PALETTE.rock : inside ? PALETTE.hull : PALETTE.hullRim;
  const glow = sealing ? 0 : warms ? pressure : 0;
  paintSac(ctx, path, { c, rx, ry, tile }, hex, rim, inside ? 0.8 : 0.6, glow, sealing ? 0.5 : 1);
  if (surgeHoldsCharge(s, cfg) && !sealing) {
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.12 + 0.05 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
