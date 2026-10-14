import type { BlisterGesture, CreatureKind } from "@neon-spore/sim";
import { BLISTER_GESTURES } from "./entry-fields-blister.js";

/**
 * **The CONTROLS brushes: one per on-screen control** (the owner, 14 October
 * 2026: *create new brush category e.g. on-screen controls … then one brush
 * per on screen control type*).
 *
 * Each is THE BLISTER with its gesture already chosen — TAP, HOLD, SWIPE, TURN
 * or RUB, the five `docs/spec/blister.md` knocks one down by. The body is the
 * same kind and the same simulation; what a brush of its own buys is that the
 * control is the thing an author picks, and that each one can be given a body
 * of its own, built round its control (`docs/queue.md`, *the controls' bodies*).
 *
 * THE BLISTER itself is therefore not a living brush any more: its one button
 * in SPECIAL is these five (`LIVING_BRUSH_KINDS`, `brush-lists.ts`). The GESTURE
 * row under the map still changes one after it is placed, and the cell then
 * reads back as the brush of its new gesture (`brushOf`, `query.ts`).
 */

/** The kind every control brush paints. */
export const CONTROL_KIND: CreatureKind = "blister";

export type ControlBrush = `control:${BlisterGesture}`;

/** One brush per gesture, in the order the GESTURE row reads. */
export const CONTROL_BRUSHES: readonly ControlBrush[] = BLISTER_GESTURES.map(
  (g): ControlBrush => `control:${g}`,
);

/** The gesture a control brush paints, or null for a brush that is not one. */
export function controlGestureOf(brush: string): BlisterGesture | null {
  return (CONTROL_BRUSHES as readonly string[]).includes(brush)
    ? (brush.slice("control:".length) as BlisterGesture)
    : null;
}

/** The brush a placed blister reads back as. */
export function controlBrushOf(gesture: BlisterGesture | undefined): ControlBrush {
  return `control:${gesture ?? "tap"}`;
}
