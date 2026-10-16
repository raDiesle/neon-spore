import { PALETTE } from "./palette.js";

/**
 * A pod's clock, drawn: the ring round every pod on the field since the owner
 * made a real pod owed in time rather than worth a cargo (16 October 2026,
 * `sim/pod-types.ts`). Its own file beside `pods.ts` because that one is the
 * pod and this is the deadline, and the two were one file over its limit.
 */

/**
 * The beats a ring counts down from. A pod's clock can be longer
 * (`PodEntry.due`), and the ring stays whole until the last of these — a ring
 * that drained over a minute would be a ring nobody watched move.
 */
export const DUE_RING_BEATS = 16;

/** Beats left under which the ring turns hot and quickens, which is when the
 * pair has a fall's worth of time and no more. */
const DUE_HOT_BEATS = 5;

/**
 * **How long the pair has**: a ring round the pod that drains clockwise from
 * twelve as its clock runs down, one notch a beat, and turns ember and beats
 * in the last `DUE_HOT_BEATS`. An addition where the game drew nothing — the
 * deadline itself is new (`Pod.dueTicks`).
 */
export function drawDueRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  beatsLeft: number,
  time: number,
): void {
  const share = Math.min(1, beatsLeft / DUE_RING_BEATS);
  const hot = beatsLeft <= DUE_HOT_BEATS;
  // In the hot stretch the ring swells on every beat it loses.
  const throb = hot ? 1 - (beatsLeft % 1) : 0;
  const ring = r * (1.55 + 0.12 * throb * throb);
  const colour = hot ? PALETTE.ember : PALETTE.pod;
  const start = -Math.PI / 2;
  ctx.save();
  ctx.lineCap = "round";
  // The spent part, faint, so the whole clock is always there to read against.
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.beginPath();
  ctx.arc(x, y, ring, 0, Math.PI * 2);
  ctx.stroke();
  // What is left.
  ctx.globalAlpha = hot ? 0.75 + 0.25 * Math.sin(time * 18) : 0.85;
  ctx.lineWidth = Math.max(1.5, r * (hot ? 0.2 : 0.15));
  ctx.beginPath();
  ctx.arc(x, y, ring, start, start + share * Math.PI * 2);
  ctx.stroke();
  // A notch at every whole beat still on the ring, which is what makes it a
  // count somebody can say out loud and not only a bar running out.
  const notches = Math.min(DUE_RING_BEATS, Math.floor(beatsLeft));
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.strokeStyle = PALETTE.podDark;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  for (let i = 1; i <= notches; i++) {
    const a = start + (i / DUE_RING_BEATS) * Math.PI * 2;
    ctx.moveTo(x + Math.cos(a) * (ring - r * 0.12), y + Math.sin(a) * (ring - r * 0.12));
    ctx.lineTo(x + Math.cos(a) * (ring + r * 0.12), y + Math.sin(a) * (ring + r * 0.12));
  }
  ctx.stroke();
  ctx.restore();
}
