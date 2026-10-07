import * as fibres from "../../../../../packages/render/src/sinew-fibres.js";
import { patch, type Variant } from "../../../variant.js";

/** How opaque the strings are while THE SLOW is open: half, the design's word. */
const VEIL = 0.45;

/**
 * The strings painted on a layer of their own and laid down at `VEIL`, so
 * every stroke in them fades together — their own paint sets its alpha
 * outright in places, so a fade set around it would not reach.
 */
function layVeiled(
  ctx: CanvasRenderingContext2D,
  slow: boolean,
  paint: (on: CanvasRenderingContext2D) => void,
): void {
  // A page with no layers to give (the tests' stub canvas) paints them whole.
  const can = slow && typeof OffscreenCanvas !== "undefined";
  const layer = can ? new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height) : null;
  const on = layer?.getContext("2d") ?? null;
  if (layer === null || on === null) {
    paint(ctx);
    return;
  }
  on.setTransform(ctx.getTransform());
  paint(on as unknown as CanvasRenderingContext2D);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha *= VEIL;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

/**
 * VEILED — offered 7 October 2026, the owner's ask that day for THE SINEW's
 * unbuilt looks: *the fibres go half-transparent and part one at a time at a
 * third rate* while THE SLOW is open (bosses-choreographed.md §8). The game
 * draws them whole through the window, marking it only by the prism round
 * the mass.
 */
export const SINEW_VEILED: Variant = {
  slot: "sinew:fibres",
  name: "veiled",
  sentence:
    "veiled — while THE SLOW is open the strings go half see-through, a held breath between the crown and the mass",
  dir: "tools/versus/candidates/sinew-fibres/veiled",
  patches: [
    patch({
      target: fibres.FIBRE_LOOK,
      reached: () => fibres.FIBRE_LOOK,
      where: {
        file: "packages/render/src/sinew-fibres.ts",
        symbol: "FIBRE_LOOK",
        type: "FibreLook",
      },
      fields: { lay: layVeiled },
    }),
  ],
};
