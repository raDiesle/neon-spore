import type { PodKind } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/** The one-word receipt for what a pod just gave, and the colour it reads in. */
export const POD_RECEIPT: Record<PodKind, { text: string; hex: string }> = {
  mend: { text: "+HULL", hex: PALETTE.pod },
  purge: { text: "SWEPT", hex: PALETTE.ember },
  ward: { text: "WARDED", hex: PALETTE.shieldRim },
};

/** One word, centred above the hull. `tiles` is how far above `l.hullY`. */
export function drawWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  text: string,
  hex: string,
  alpha: number,
  tiles: number,
): void {
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.fillStyle = hex;
  ctx.font = '600 15px "Courier New",monospace';
  ctx.fillText(text, l.width / 2, l.hullY - l.tile * tiles);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}
