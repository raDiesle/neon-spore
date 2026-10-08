import {
  type SurgeState,
  surgeEverting,
  surgeHands,
  surgeSealing,
  type World,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { drawSurgeBody, EVERT_LOOK, surgeFoldedRy } from "./surge-body.js";
import type { SurgeFx } from "./surge-fx.js";
import { drawSurgeGauge } from "./surge-gauge.js";
import { drawSurgeGrips } from "./surge-grip.js";
import { drawSurgeAsked, drawSurgeVerdicts } from "./surge-marks.js";
import {
  surgeBulbCentre,
  surgeBulbRx,
  surgeBulbRy,
  surgeEvert01,
  surgePressure01,
} from "./surge-shape.js";
import { surgeRoll } from "./surge-sway.js";
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
  const fullRy = surgeBulbRy(l) * swell * pinch * (1 - fx.jolt);
  // The eversion folds the body through its equator: flat at the half, and
  // the far side drawn inside out past it (`EVERT_LOOK`, `surge-body.ts`).
  const ry = surgeFoldedRy(l.tile, fullRy, evert);
  // The bulb rocks about its middle, seam and grips with it (`surge-sway.ts`).
  const roll = surgeRoll(cfg, s, beat, beatPhase, world);

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(roll);
  ctx.translate(-c.x, -c.y);
  const body = (bodyRy: number, inside: boolean): void =>
    drawSurgeBody(ctx, cfg, s, {
      c,
      rx,
      ry: bodyRy,
      time,
      pressure,
      sealing,
      inside,
      warms: showsSurgePressure(l.role),
      tile: l.tile,
      hurt: fx.hurt.value,
    });
  if (evert > 0) EVERT_LOOK.draw({ ctx, c, rx, ry: fullRy, evert, time, tile: l.tile, body });
  else body(ry, false);
  drawSurgeGauge(ctx, l, cfg, s, c, rx, ry, time, everting);
  ctx.restore();
  if (!everting) {
    drawSurgeAsked(ctx, l, world, s, c, rx, ry, time, roll);
    drawSurgeGrips(ctx, l, world, s, c, rx, ry, time, sealing, roll);
    drawSurgeVerdicts(ctx, l, world, c, rx, ry, fx.marks.verdicts, roll);
  }
  ctx.restore();
}
