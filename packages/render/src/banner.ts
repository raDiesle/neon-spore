import type { PodKind } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/** The one-word receipt for what a pod just gave, and the colour it reads in. */
const POD_RECEIPT: Record<PodKind, { text: string; hex: string }> = {
  mend: { text: "+HULL", hex: PALETTE.pod },
  purge: { text: "SWEPT", hex: PALETTE.ember },
  ward: { text: "WARDED", hex: PALETTE.shieldRim },
};

/** What the words over the hull are reading from, all of it `Effects` state. */
export interface BannerState {
  /** Counts down while DEFLECTED is up. */
  guardHit: number;
  /** Counts down from `swallowLife` while a pod is being taken in. */
  swallow: number;
  swallowLife: number;
  /** Share of the swallow the chewing takes; the receipt waits for it. */
  chewShare: number;
  podKind: PodKind | null;
}

/** DEFLECTED, or a pod's one-word receipt, over the hull. */
export function drawBanner(ctx: CanvasRenderingContext2D, l: Layout, s: BannerState): void {
  if (s.guardHit > 0) {
    drawWord(ctx, l, "DEFLECTED", PALETTE.shieldRim, Math.min(1, s.guardHit / 0.6), 0.9);
  }
  if (s.swallow <= 0 || !s.podKind) return;
  const done = 1 - s.swallow / s.swallowLife;
  if (done < s.chewShare) return; // wait for the chewing to finish first
  const after = (done - s.chewShare) / (1 - s.chewShare);
  const a = Math.min(1, 1 - after);
  if (a <= 0) return;
  const { text, hex } = POD_RECEIPT[s.podKind];
  drawWord(ctx, l, text, hex, a, 0.55);
}

/** One word, centred above the hull. `tiles` is how far above `l.hullY`. */
function drawWord(
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
