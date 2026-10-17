import { withPodFade } from "./pod-fade.js";
import { drawBlinkForm } from "./pod-form-blink.js";
import { drawGlintForm } from "./pod-form-glint.js";
import { drawHopForm } from "./pod-form-hop.js";
import { drawOrbitForm } from "./pod-form-orbit.js";
import { drawSmartForm } from "./pod-form-smart.js";
import type { PodDraw } from "./pod-pickup.js";

/**
 * **The five forms a pod is drawn as, one per pod** — the owner, 17 October
 * 2026: *I like all POD:REAL; we can iterate in game to use randomly*. Each
 * is THE SMART's tumbling seed with its own spikes, skin and pickup motion,
 * and each has a fake twin the hollow pod wears on the seat that can tell
 * (`pod-pickup.ts`'s `PodDraw`).
 *
 * Which form a pod wears is read off its id, which is the same on both
 * devices — a husk on the fooled seat must be the very form its truth is on
 * the other, or the pair could tell them apart by talking. The id is mixed
 * first, so pods spawned one after another do not walk the list in order.
 */
export const POD_FORMS: readonly { name: string; draw: PodDraw }[] = [
  { name: "SMART", draw: drawSmartForm },
  { name: "BLINK", draw: drawBlinkForm },
  { name: "GLINT", draw: drawGlintForm },
  { name: "HOP", draw: drawHopForm },
  { name: "ORBIT", draw: drawOrbitForm },
];

/** The form pod `id` wears. */
export function podFormFor(id: number): PodDraw {
  const i = (Math.imul(id + 1, 2654435761) >>> 0) % POD_FORMS.length;
  return (POD_FORMS[i] ?? POD_FORMS[1])?.draw ?? drawBlinkForm;
}

/**
 * Pod `id`'s form at a place and a size somebody else chose, faded by
 * `alpha` — the pod in the maw's grip (`drawGrippedPods`) and in THE PULSE's
 * lane (`drawPulseBody`), which are the same pod the field shows and must not
 * change shape on the way there. `fake` as `PodDraw` has it.
 */
export function drawPodForm(
  ctx: CanvasRenderingContext2D,
  id: number,
  x: number,
  y: number,
  r: number,
  t: number,
  beatsLeft: number,
  fake = false,
  alpha = 1,
): void {
  const form = podFormFor(id);
  if (alpha >= 1) {
    form(ctx, x, y, r, t, beatsLeft, fake);
    return;
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  withPodFade(alpha, () => form(ctx, x, y, r, t, beatsLeft, fake));
  ctx.restore();
}
