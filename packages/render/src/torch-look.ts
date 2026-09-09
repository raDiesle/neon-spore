import { drawEmberRing } from "./torch-ember.js";

/**
 * THE ONE RECORD A CANDIDATE TORCH FLAME PATCHES.
 *
 * The sixth of `magnet-look.ts`'s kind, and the first that hands the caller's
 * own paint back through the record. A rock is opaque, so *when* the stone is
 * laid down is the whole question a flame in depth asks: embers on the far side
 * of a ring have to be drawn before it and the near ones after it, and a record
 * that only got a hook in front of the stone could offer nothing but a ring
 * around the outside — which is the shipped answer already.
 *
 * So `stone()` is a field of the draw rather than something the caller does
 * afterwards. The shipped flame calls it exactly where `drawTorchRock` always
 * called it: after the ember ring, before the craters.
 */

/**
 * Everything a flame round a rock can want. `ctx` is already translated to the
 * stone's centre and turned to its facing (`torchRotation`), so every mark here
 * is in the rock's own frame and the radius is the only size there is.
 */
export interface TorchFlameDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The stone's own radius in pixels — `rockRadius`, at the body's span. */
  readonly r: number;
  /** The wall clock in seconds. The shipped ring turns its crystal on it. */
  readonly time: number;
  /**
   * The stone itself, painted where the flame decides. It is the same fill and
   * the same outline a plain meteor is drawn with, and it is opaque — which is
   * what makes calling it late an occlusion rather than a layering trick.
   * Call it exactly once: twice is two rocks, never is a flame round nothing.
   */
  readonly stone: () => void;
}

export interface TorchLook {
  flame(d: TorchFlameDraw): void;
}

/** The shipped flame: the faint ring outside the outline, then the stone over
 * it — the order `drawTorchRock` has always laid them in, so the contour the
 * eye reads is the rock's and not the ring's. */
export const TORCH_LOOK: TorchLook = {
  flame(d) {
    drawEmberRing(d.ctx, d.r, d.time);
    d.stone();
  },
};
