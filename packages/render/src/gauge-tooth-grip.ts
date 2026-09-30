import { GAUGE_TEETH, type GaugeState, gaugeToothAsks, gaugeToothPulled } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { TOOTH_STEP, toothAt, toothPoint } from "./gauge-teeth.js";
import { drawGripRing } from "./grip-rings.js";
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

/** The rings, on her screen only, while a tooth is loose. */
export function drawGaugeToothRings(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  handleR: number,
  g: GaugeState,
  time: number,
): void {
  if (!gaugeToothAsks(g)) return;
  const r = ringRadius(dial, handleR);
  for (let k = 0; k < GAUGE_TEETH; k++) {
    // The one in her hand has left its socket; the drawn tooth is the ring.
    if (gaugeToothPulled(g, k) || k === g.toothHold) continue;
    const p = toothPoint(dial, k);
    drawGripRing(ctx, p.x, p.y, r, false, time);
  }
}
