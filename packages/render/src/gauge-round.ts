import { drawBand } from "./band.js";
import type { Effects } from "./effects.js";
import {
  type Dial,
  type DialView,
  drawGauge,
  drawGaugeFoe,
  showsGaugeMarks,
  showsGaugeValve,
} from "./gauge.js";
import { drawGaugeFuse, drawGaugeSiren } from "./gauge-crown.js";
import { gaugeGapeShown, gaugeOpenDial } from "./gauge-gape.js";
import { drawGaugeGrip } from "./gauge-grip.js";
import { drawGaugeAsked, drawGaugeVerdicts } from "./gauge-marks.js";
import { shotClock } from "./gauge-shot.js";
import { drawGaugeLead, drawGaugeLevel, drawGaugeVerdict } from "./gauge-words.js";
import { drawHull } from "./hull.js";
import {
  frame,
  type HullFrame,
  type HullMood,
  type LobePositions,
  skinSampler,
  surface,
} from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";

/** Room above the half-circle for the rim's armour and the wound's glow, as a
 * share of the radius. */
const HEADROOM = 0.16;

/** The ship at rest: nothing armed, nothing swallowed, the cannon lobe in the
 * middle column and no shield — the round has none to raise. */
const REST_MOOD: HullMood = { armed: 0, intake: 0, chew: 0, charge: 0 };

const restAt = (l: Layout): LobePositions => ({ cannon: (l.cols - 1) / 2, shield: [] });

/** The ship's own hull, at rest, as this layout draws it. */
function restHull(l: Layout, time: number): HullFrame {
  return frame(l, time, REST_MOOD, restAt(l));
}

/**
 * **The dial, in pixels** — one circle, asked for by the picture, by the
 * thumbs (`gauge-grip.ts`) and by the cue that stands on its needle
 * (`boss-cue-read-w.ts`).
 *
 * The pivot is the crown of the ship's real cannon lobe, measured off the hull
 * `drawHull` paints under the round — SNAKE's ship and this one are the same
 * ship (the owner, 20 September 2026: *fit the regular ship hull*). It is
 * measured at time zero, so a finger and a frame agree on it; the skin's
 * breathing under the cannon's lobe is a pixel or two the lobe covers.
 *
 * The rim's armour stops a breath under the top of the stage, where the siren
 * and the fuse are (`gauge-crown.ts`); the alien's arms reach on behind them
 * (`gauge-alien.ts`). The title and the pips that stood there are gone — the
 * owner, 29 September 2026 — and the width is what sizes the dial on every
 * phone measured, so the circle did not move when they went.
 */
export function gaugeDial(l: Layout): Dial {
  const top = l.playHeight * 0.14;
  const cx = tileCX(l, (l.cols - 1) / 2);
  const cy = surface(restHull(l, 0), cx).y;
  return {
    cx,
    cy,
    // And never below a tenth of the screen: a phone too short for the room
    // over it is a phone where the alien's arms reach behind the siren.
    r: Math.max(
      l.playHeight * 0.1,
      Math.min(l.width * 0.42, l.playHeight * 0.3, (cy - top - 8) / (1 + HEADROOM)),
    ),
  };
}

/**
 * THE GAUGE over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid. That
 * is the round's first condition: the field is gone, not dimmed and not
 * re-skinned. A round that borrowed the eleven columns would be a wave in a
 * costume. The hull and the band stay, as they do on SNAKE: neither is the
 * field, they are the ship, and the cannon stands on its crown where it
 * always does.
 *
 * It is a boss wave now rather than a category of its own, and this file is
 * what did not change when that happened — which was the point. The two screens
 * are still **not** the same picture, and the difference is still the round.
 *
 * The buttons come from the wave's control set and stand in the band's own
 * sockets (`gauge-button.ts`), not in geometry invented here — the owner, 20
 * September 2026: *improve the buttons a lot so they fit the regular ship hull
 * and control set visuals*.
 */

export function drawGaugeRound(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  effects: Effects,
): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "gauge") return;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);

  // The alien first: it hangs over the ship with its mouth round it, and the
  // hull stands in front of the half of it below the crown (`gauge.ts`).
  const dialView: DialView = {
    showMarks: showsGaugeMarks(view.role),
    showValve: showsGaugeValve(view.role),
    tile: l.tile,
    beatPhase: view.beatPhase,
    beat: view.world.beat,
    tick: view.world.tick,
    time: view.time,
  };
  // The rim where the mouth stands open this frame, easing out a step on the
  // landing of the shot that opened it (`gauge-gape.ts`).
  const c = shotClock(view.world.cfg, boss, view.world.tick, view.world.beat, view.beatPhase);
  const dial = gaugeOpenDial(gaugeDial(l), gaugeGapeShown(view.world.cfg, boss, c));
  drawGaugeFoe(ctx, dial, view.world.cfg, boss, dialView);

  const f = restHull(l, view.time);
  // A `hand` crown: the cannon lobe carries the turning cannon rather than the laying
  // mouth, so the laying pass stays undrawn under its lobe.
  const skin = seatSkin(view.role).hull;
  drawHull(
    ctx,
    l,
    view.world.scars,
    view.time,
    REST_MOOD,
    restAt(l),
    effects.boss.hit.craterShown(l),
    effects.boss.hit.crackShown(),
    skin,
    undefined,
    f,
    "hand",
  );
  effects.boss.hit.draw(ctx, l, view.time, skinSampler(f));

  ctx.textAlign = "center";
  // The level's clock over the alien's head, and the siren over everything.
  drawGaugeFuse(ctx, l, view.world, boss, dial, view.beatPhase);
  drawGaugeSiren(ctx, l, boss, view.time, view.names);
  drawGauge(ctx, dial, view.world.cfg, boss, dialView);
  // The two thumbs the round can be taken hold of by, after the dial they
  // stand on (`gauge-grip.ts`). That file asks this one for `gaugeDial` and
  // this one asks it back for the rings: the pair is `handles.ts` and
  // `touch.ts`'s, one direction at runtime, and the circle a thumb is
  // answered at is the circle the ring is drawn from.
  // The halo under the rings on a part asked and not yet held (`gauge-marks.ts`).
  drawGaugeAsked(ctx, l, view.world.cfg, dial, boss, view.role, view.time);
  drawGaugeGrip(ctx, l, view.world.cfg, dial, boss, view.role, view.time);
  // The ship's own panel, with the round's three in its sockets
  // (`gauge-button.ts`) — which is also where the machine stops and the dark
  // begins, the job an inset rectangle round the stage used to do.
  drawBand(ctx, l, view.world, false, false, view.time, view.controls);
  if (boss.phase === "lead") drawGaugeLead(ctx, l, view, boss);
  drawGaugeLevel(ctx, l, view, boss);
  // The verdict stands through `spent` too: the round is over and holding
  // its own picture until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawGaugeVerdict(ctx, l, view, boss);
  // A thumb's green, last of all, on the screen that shows its part.
  drawGaugeVerdicts(ctx, l, view.world.cfg, dial, boss, view.role, effects.boss.gauge.verdicts);
  ctx.textAlign = "left";
}
