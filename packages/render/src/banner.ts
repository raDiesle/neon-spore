import type { PodKind } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/** The one-word receipt for what a pod just gave, and the colour it reads in. */
const POD_RECEIPT: Record<PodKind, { text: string; hex: string }> = {
  mend: { text: "+HULL", hex: PALETTE.pod },
  purge: { text: "SWEPT", hex: PALETTE.ember },
  ward: { text: "WARDED", hex: PALETTE.shieldRim },
};

/**
 * The clock a pod's receipt reads from — the shape `Swallow` already has
 * (`swallow.ts`), taken whole rather than copied field by field into a state
 * object at the call site. That copy was five lines of re-spelling and one
 * more name for each number.
 */
export interface BannerState {
  /** Counts down from `life` while a pod is being taken in. */
  remaining: number;
  life: number;
  /** Share of the swallow the chewing takes; the receipt waits for it. */
  chewShare: number;
  podKind: PodKind | null;
}

/** DEFLECTED, or a pod's one-word receipt, over the hull. `guardHit` counts
 * down while the first is up. */
export function drawBanner(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  guardHit: number,
  s: BannerState,
): void {
  if (guardHit > 0) {
    drawWord(ctx, l, "DEFLECTED", PALETTE.shieldRim, Math.min(1, guardHit / 0.6), 0.9);
  }
  if (s.remaining <= 0 || !s.podKind) return;
  const done = 1 - s.remaining / s.life;
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
