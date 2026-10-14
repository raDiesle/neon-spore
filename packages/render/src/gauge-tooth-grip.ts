import {
  GAUGE_TEETH,
  type GaugeState,
  gaugeToothAsks,
  gaugeToothPulled,
  type SimConfig,
} from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { TOOTH_STEP, toothAt, toothPoint } from "./gauge-teeth.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob, PULL_SIZE } from "./pull-knob.js";
import { type PullWay, straightPullTrack } from "./pull-line.js";
import { drawPullTrack, pullTrackPoint } from "./pull-track.js";
import type { Touch } from "./touch.js";

/**
 * **The navigator's hand on the teeth**, in the rest after the first level
 * (`sim/gauge-tooth.ts`): a ring on every tooth still in the rim, and the
 * press that names one. Her screen never shows which is loose — his does —
 * so every tooth is offered alike, and the ring she takes is the tooth the
 * simulation is told about. A ring on the loose one alone would be the
 * answer drawn where the question is.
 *
 * The press picks by the angle round the pivot rather than by the rings'
 * circles: fifteen teeth across a half-turn stand closer than a thumb is
 * wide, and the angle names exactly one of them where two overlapping
 * circles would name whichever was tested first (`toothAt`).
 *
 * **Each mark is the PULL LAB's knob on its channel** (`pull-knob.ts`,
 * `pull-track.ts`), the owner, 13 October 2026: until then a ring, which read
 * as a press. The channel runs from the tooth toward its point, the way a
 * tooth comes out of the gum, `gaugeToothPullMilli` long, and the arrow says
 * so; the sim takes the pull any way (`sim/gauge-tooth.ts`), so a hand that
 * goes sideways still pulls, and the knob rides the channel by how far it has
 * gone. The knob is drawn the ring's own size rather than `PULL_SIZE` larger:
 * fifteen teeth stand closer than a doubled knob is wide, and she has to
 * count them.
 */

/** The ring's radius: a thumb's, but never wider than the gap to the next tooth. */
function ringRadius(dial: Dial, handleR: number): number {
  const chord = dial.r * ((TOOTH_STEP / 1000) * Math.PI);
  return Math.min(handleR, chord * 0.45);
}

/** Her press on a tooth still in the rim, or `null`. */
export function gaugeToothUnder(
  dial: Dial,
  handleR: number,
  g: GaugeState,
  x: number,
  y: number,
): Touch | null {
  if (!gaugeToothAsks(g)) return null;
  const k = toothAt(dial, x, y, handleR);
  if (k === -1 || gaugeToothPulled(g, k)) return null;
  const target = "gaugeTooth";
  return {
    player: 2,
    command: { kind: "drag", target, on: true, id: k, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: 2, originX: x, originY: y, id: k },
  };
}

/** The way tooth `k` comes out: from its root toward the pivot it points at. */
function outOf(dial: Dial, at: { x: number; y: number }): PullWay {
  const dx = dial.cx - at.x;
  const dy = dial.cy - at.y;
  const len = Math.hypot(dx, dy) || 1;
  return { dx: dx / len, dy: dy / len };
}

/** The pulls, on her screen only, while a tooth is loose: one on every tooth still in. */
export function drawGaugeToothPulls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  dial: Dial,
  handleR: number,
  g: GaugeState,
  time: number,
): void {
  if (!gaugeToothAsks(g)) return;
  const r = ringRadius(dial, handleR) / PULL_SIZE;
  const reach = Math.max(1, cfg.gaugeToothPullMilli);
  for (let k = 0; k < GAUGE_TEETH; k++) {
    if (gaugeToothPulled(g, k)) continue;
    const from = toothPoint(dial, k);
    const way = outOf(dial, from);
    const track = straightPullTrack({ from, r, way, len: (reach * l.tile) / 1000 });
    const held = k === g.toothHold;
    const gone = held ? Math.hypot(g.toothDxMilli, g.toothDyMilli) : 0;
    const at = Math.min(1, gone / reach);
    const key = `gauge:tooth:${k}`;
    const look = { hex: PALETTE.hullRim, rim: PALETTE.text, held, time, key };
    drawPullTrack(ctx, track, { ...look, origin: 0, at });
    const knob = pullTrackPoint(track, at);
    drawPullKnob(ctx, { x: knob.x, y: knob.y }, r, { ...look, way, theirs: false });
  }
}
