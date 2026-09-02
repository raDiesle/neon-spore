/**
 * A cache slot for one gradient that depends only on layout — never on time
 * or an eased value. `createLinearGradient`/`createRadialGradient` and every
 * `addColorStop` after it are canvas calls the same as a `fill`, and a frame
 * that rebuilds an unchanged gradient sixty times a second is paying for a
 * picture that never moved.
 *
 * One slot holds one gradient. A caller with several layout-only gradients
 * (the field's backdrop, its grid) makes one slot per call site — sharing a
 * slot between two different gradients would thrash it every frame, which is
 * worse than never caching at all.
 */

/** Rebuilt whenever the canvas changes (a new frame from a stub, a resize
 * that swaps the context) or `key` changes — every number the gradient
 * depends on, joined by the caller so two different layouts never collide. */
interface Slot<G> {
  ctx?: CanvasRenderingContext2D;
  key?: string;
  gradient?: G;
}

export function slotGradient<G>(
  ctx: CanvasRenderingContext2D,
  slot: Slot<G>,
  key: string,
  make: () => G,
): G {
  if (slot.ctx !== ctx || slot.key !== key || slot.gradient === undefined) {
    slot.ctx = ctx;
    slot.key = key;
    slot.gradient = make();
  }
  return slot.gradient;
}

/** A fresh, empty slot — one per call site, module-level. */
export function gradientSlot<G>(): Slot<G> {
  return {};
}
