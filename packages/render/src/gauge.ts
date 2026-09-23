import { GAUGE_FULL, type GaugeState, gaugeSpanNow, type SimConfig } from "@neon-spore/sim";
import { callAge, clawPose, drawGaugeCatch, gaugeLineShown, gaugePodGrown } from "./gauge-catch.js";
import { drawGaugeClaw, drawGaugeLine, drawGaugeShip } from "./gauge-claw.js";
import { drawGaugePod, POD_REACH } from "./gauge-pod.js";
import type { ViewRole } from "./layout.js";

/**
 * THE GAUGE's picture: the ship's claw turning on the crown of the hull, a
 * dotted line out of it saying where it will grab, and a pod that only one of
 * the two screens carries. How each is drawn is `gauge-claw.ts`; this file is
 * the order they go down in, the readings they are drawn at, and the split.
 *
 * It was a half-round dial set in a milled plate, and the owner took that away
 * on 20 September 2026 — *the control idea should stay, but the visual a
 * lot*. The round's rule that it is slabs and glyphs, never blobs, went with
 * it for the one body the owner named: the band is a pod now, because a pod is
 * what this game already spends on "here, this is the thing", and the claw is
 * the hand THE CLAW's panel already carries. Nothing the pair reads is new.
 *
 * No new colours either. Violet and white are the ship's own; the pod is
 * `pod` amber; a catch is `good` green and a hand shut on nothing is
 * `sparkDim`, which are already right and wrong everywhere else.
 *
 * Stateless, like every other draw in this package: everything it shows is on
 * the world — the call's answer too, read off `calledBeat` and the beat — so
 * nothing here outlives a frame and `Effects.reset` has nothing of it to clear.
 */

/**
 * The navigator sees the pod. The pilot's screen is the same picture without
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
  /** The pivot, at the bottom of the half-circle. */
  cy: number;
  r: number;
}

export interface DialView {
  /** Whether this screen is the one that can see the two marks. */
  showMarks: boolean;
  beatPhase: number;
  /** `world.tick`, which a call's reach is timed from (`gauge-catch.ts`). */
  tick: number;
  /** The stage's width, which the ship's skin runs across. */
  width: number;
}

/** Where a value on the dial sits, as a canvas angle. Left is 0, right is full. */
function angleFor(milli: number): number {
  return Math.PI + (milli / GAUGE_FULL) * Math.PI;
}

function pointOn(dial: Dial, milli: number, radius: number): { x: number; y: number } {
  const a = angleFor(milli);
  return { x: dial.cx + Math.cos(a) * radius, y: dial.cy + Math.sin(a) * radius };
}

export function drawGauge(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  cfg: SimConfig,
  gauge: GaugeState,
  view: DialView,
): void {
  // The ship first and the claw last, which is the object's own order: the
  // hand stands on the hull, the pod is out in the dark it points into, and
  // nothing drawn after the claw may cover the thing the pilot is turning
  // (`gauge-claw.ts`).
  drawGaugeShip(ctx, dial, view.width);
  const age = callAge(cfg, gauge, view.tick);
  // The width **now**, not the one in the config: the band winds tight every
  // few marks and her thumb gives it back, and a pod that stood at the full
  // width through the bind would have her calling a claw the screen shows
  // inside it and being told it was not (`gauge-band.ts`).
  if (view.showMarks) {
    const glow = 0.5 + 0.5 * Math.cos(view.beatPhase * Math.PI * 2);
    const grown = gaugePodGrown(gauge, age);
    drawGaugePod(ctx, dial, gauge.markMilli, gaugeSpanNow(cfg, gauge), glow, grown);
  }
  // A call is the claw going out and coming back, with the pod or without it,
  // on both screens (`gauge-catch.ts`); the line is hidden while the arm is
  // out along it.
  drawGaugeLine(ctx, dial, gauge.needleMilli, gaugeLineShown(age));
  drawGaugeCatch(ctx, dial, gauge, age);
  drawGaugeClaw(ctx, dial, clawPose(dial, gauge, age));
}

/**
 * Where the needle points, out on the claw's dotted line just short of its
 * end. Exported because the cue frames it at the moment it is seated
 * (`boss-cue-read-w.ts`): the line is the only thing on this screen that
 * moves, so the word goes on it and not on the button, and a second opinion
 * about where it points would be a frame beside its own line.
 */
export function gaugeNeedleTip(dial: Dial, gauge: GaugeState): { x: number; y: number } {
  return pointOn(dial, gauge.needleMilli, dial.r * NEEDLE_REACH);
}

/** How far up the radius the needle's point is — inside the line's reach. */
const NEEDLE_REACH = 0.94;

/**
 * The middle of the pod. Exported for the cue, which frames it while the band
 * is wound tight and asks her to hold it open (`boss-cue-read-w.ts`): the pod
 * is on her screen alone, so the mark stands on something she is already
 * shown, and a second opinion about where its middle is would be a frame
 * beside its own pod.
 */
export function gaugeBandMid(dial: Dial, gauge: GaugeState): { x: number; y: number } {
  return pointOn(dial, gauge.markMilli, dial.r * POD_REACH);
}
