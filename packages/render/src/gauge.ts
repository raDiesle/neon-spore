import {
  type GaugeState,
  gaugeGapeSpan,
  gaugeSeatedBy,
  gaugeSpanNow,
  type SimConfig,
} from "@neon-spore/sim";
import { drawGaugeAlien, rimPoint } from "./gauge-alien.js";
import { drawGaugeAim, drawGaugeCannon } from "./gauge-cannon.js";
import { drawGaugeEyes, drawGaugeTongue } from "./gauge-face.js";
import { drawGaugeHurt } from "./gauge-hurt.js";
import { gaugeShotLoad, gaugeWoundColor } from "./gauge-load.js";
import {
  cannonPose,
  drawGaugeShot,
  gaugeAimShown,
  gaugeFlinch,
  gaugeScarLeft,
  gaugeWoundGrown,
  shotClock,
} from "./gauge-shot.js";
import { drawTeeth, type TeethView } from "./gauge-teeth.js";
import { drawGaugeTongueOut } from "./gauge-tongue.js";
import { drawGaugeScar, drawGaugeWound } from "./gauge-wound.js";
import type { ViewRole } from "./layout.js";

/**
 * THE GAUGE's picture: a big alien ship with its mouth open round ours, a
 * wound torn in the armour of that mouth that only one of the two screens
 * carries, and the ship's own cannon turning on the crown to shoot it. How
 * each is drawn is `gauge-alien.ts`, `gauge-wound.ts`, `gauge-cannon.ts` and
 * `gauge-shot.ts`; this file is the order they go down in, the readings they
 * are drawn at, and the split.
 *
 * It was THE CLAW's hand reaching for a pod, and the owner took that away on
 * 25 September 2026: *the area of acceptance to activate the needle is not
 * clear enough … the line where the needle is correct is the visual of an
 * open wound, we need to hit*. The control idea stayed exactly as it was.
 *
 * Two passes, because the alien stands *behind* our hull and the cannon on
 * it: `drawGaugeFoe` before `drawHull`, `drawGauge` after (`gauge-round.ts`).
 *
 * Stateless, like every other draw in this package: everything it shows is on
 * the world — the call's answer too, read off `calledTick`, `shotTick` and the tick — so
 * nothing here outlives a frame and `Effects.reset` has nothing of it to clear.
 */

/**
 * The navigator sees the wound. The pilot's screen is the same picture without
 * it — not a different picture, which is what makes "I cannot see it, tell
 * me" the obvious thing for him to say.
 *
 * A role predicate in render/ for the same reason `showsQueenHint` is: the
 * information split is a fact about a *screen*, not about the world. It is not
 * the same question as which buttons a seat has — that is the control set's
 * — and keeping the two apart is what lets a later
 * round hand one seat information without also handing it a verb.
 */
export const showsGaugeMarks = (role: ViewRole): boolean => role !== "p1";
/** The pilot turns it. Nobody else has a valve drawn at all. */
export const showsGaugeValve = (role: ViewRole): boolean => role !== "p2";

export interface Dial {
  cx: number;
  /** The pivot: the cannon's lobe, on the crown of the hull. */
  cy: number;
  r: number;
}

export interface DialView {
  /** Whether this screen is the one that can see the wound. */
  showMarks: boolean;
  /** Whether it is the pilot's, which sees the loose tooth (`gauge-teeth.ts`). */
  showValve: boolean;
  /** The layout's tile, which her drag on a tooth is counted in. */
  tile: number;
  beatPhase: number;
  /** `world.beat`, which a fresh wound is grown from (`gauge-shot.ts`). */
  beat: number;
  /** `world.tick`, which a call's flight is timed from (`gauge-shot.ts`). */
  tick: number;
  /** The renderer's clock, which the alien breathes on. */
  time: number;
}

/** The alien, and on her screen the wound in it. Before the hull. */
export function drawGaugeFoe(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  cfg: SimConfig,
  gauge: GaugeState,
  view: DialView,
): void {
  const c = shotClock(cfg, gauge, view.tick, view.beat, view.beatPhase);
  const flinch = gaugeFlinch(gauge, c);
  drawGaugeAlien(ctx, dial, view.time, flinch);
  drawTeeth(ctx, dial, gaugeTeethView(gauge, view), view.time);
  // Out and wrung in the rest after the second level (`gauge-tongue.ts`).
  if (gauge.tongueOut) drawGaugeTongueOut(ctx, dial, cfg, gauge, view.time);
  else drawGaugeTongue(ctx, dial, view.time);
  drawGaugeEyes(ctx, dial, gauge.needleMilli, view.time, flinch);
  // Every mark landed, torn into its flesh: the count, never as a number.
  drawGaugeHurt(ctx, dial, gauge.marks, view.time);
  // The scar of a hit is on both screens: it is where *he* stopped.
  drawGaugeScar(ctx, dial, gauge.calledMilli, gaugeShotLoad(gauge), gaugeScarLeft(gauge, c));
  if (!view.showMarks) return;
  // The width **now**, not the one in the config: the band winds tight every
  // few marks and her thumb gives it back, and a wound that stood at the full
  // width through the bind would have her calling a shot the screen shows
  // inside it and being told it was not (`gauge-band.ts`).
  const glow = 0.5 + 0.5 * Math.cos(view.beatPhase * Math.PI * 2);
  drawGaugeWound(
    ctx,
    dial,
    gauge.markMilli,
    gaugeSpanNow(cfg, gauge),
    gaugeGapeSpan(cfg, gauge),
    gaugeWoundColor(gauge),
    glow,
    gaugeWoundGrown(gauge, c),
  );
}

/** The teeth as this screen shows them: the loose one on his screen alone. */
export function gaugeTeethView(gauge: GaugeState, view: DialView): TeethView {
  return {
    pulled: gauge.pulledTeeth,
    loose: view.showValve ? gauge.looseTooth : -1,
    hold: gauge.toothHold,
    dx: (gauge.toothDxMilli * view.tile) / 1000,
    dy: (gauge.toothDyMilli * view.tile) / 1000,
  };
}

/** The cannon's line, the shot, and the cannon itself. After the hull. */
export function drawGauge(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  cfg: SimConfig,
  gauge: GaugeState,
  view: DialView,
): void {
  const c = shotClock(cfg, gauge, view.tick, view.beat, view.beatPhase);
  const load = gaugeShotLoad(gauge);
  // Only her screen lights the ring for a shot that would land: his own screen
  // telling him he had arrived would be the band, drawn a second way. Not with
  // a bolt already on its way, which is a call she cannot make again.
  const hot =
    view.showMarks && !c.flying && gaugeSeatedBy(cfg, gauge) && gaugeWoundGrown(gauge, c) >= 1;
  drawGaugeAim(ctx, dial, gauge.needleMilli, load, gaugeAimShown(c), hot);
  drawGaugeShot(ctx, dial, gauge, c);
  drawGaugeCannon(ctx, dial, cannonPose(gauge, c), load, view.time);
}

/**
 * Where the cannon's line meets the rim — where the shot will land. Exported
 * because the cue frames it at the moment it is seated (`boss-cue-read-w.ts`)
 * and the pilot's thumb takes hold of it (`gauge-grip.ts`): the line is the
 * one thing on his screen that moves, so the word and the ring go on it.
 */
export function gaugeNeedleTip(dial: Dial, gauge: GaugeState): { x: number; y: number } {
  return rimPoint(dial, gauge.needleMilli);
}

/**
 * The middle of the wound. Exported for the cue, which frames it while the
 * band is wound tight and asks her to hold it open (`boss-cue-read-w.ts`),
 * and for her thumb's ring (`gauge-grip.ts`).
 */
export function gaugeBandMid(dial: Dial, gauge: GaugeState): { x: number; y: number } {
  return rimPoint(dial, gauge.markMilli);
}
