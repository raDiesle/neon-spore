import { faded } from "./pod-fade.js";
import { countSwell, drawShine, type PodDraw } from "./pod-pickup.js";
import { blinkAt, type Seed, seedAt } from "./pod-seed.js";
import { drawBack, drawFront, drawSeed, type SeedLight } from "./pod-seed-draw.js";
import { FAKE_PAINT } from "./pod-seed-paint.js";

/**
 * **BLINK** — the seed capped with round mushroom studs over a spotted skin;
 * on the count the whole sphere flashes white-hot and swells, and the coin's
 * shine crosses it (`pod-pickup.ts`). The first form the owner took, on
 * 16 October 2026.
 *
 * **Its fake is a MIMIC.** In dark blood-red, blinking red, and on the count
 * it splits along its middle like a jaw: the top half lifts, a black mouth
 * and two rows of teeth show, and it snaps shut — the trap chest every
 * player has met, wearing the bonus they were about to take.
 */
const STYLE = { spike: "cap", skin: "spots" } as const;
const MOUTH = "#120103";
const TEETH = 6;

export const drawBlinkForm: PodDraw = (ctx, x, y, r, t, beatsLeft, fake) => {
  const s = seedAt(x, y, r, t, beatsLeft);
  const flash = blinkAt(t, beatsLeft);
  if (!fake) {
    s.R *= 1 + 0.12 * flash;
    drawSeed(ctx, s, { flash, ...STYLE });
    drawShine(ctx, s, t);
    return;
  }
  const light: SeedLight = { flash, paint: FAKE_PAINT, ...STYLE };
  const open = countSwell(t, beatsLeft, 0.45);
  if (open <= 0.05) {
    drawSeed(ctx, s, light);
    return;
  }
  drawBack(ctx, s, light);
  ctx.restore();
  const gap = open * s.R * 0.75;
  mouth(ctx, s, gap);
  half(ctx, s, light, 0, false);
  half(ctx, s, light, -gap, true);
};

/** One half of the seed: everything below the middle, or above it lifted by `dy`. */
function half(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight, dy: number, top: boolean) {
  const span = s.R * 2.4;
  ctx.save();
  ctx.translate(0, dy);
  ctx.beginPath();
  ctx.rect(s.x - span, top ? s.y - span : s.y, span * 2, span);
  ctx.clip();
  // `drawFront` closes the save `drawBack` opens; this one stands in for it.
  ctx.save();
  drawFront(ctx, s, light);
  ctx.restore();
}

/** The black inside and the teeth along both lips. */
function mouth(ctx: CanvasRenderingContext2D, s: Seed, gap: number) {
  const w = s.R * 0.95;
  ctx.globalAlpha = faded(1);
  ctx.fillStyle = MOUTH;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y - gap / 2, w, gap / 2 + s.R * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#F4E4D4";
  ctx.beginPath();
  const tw = (w * 2) / TEETH;
  const th = Math.min(gap * 0.55, s.R * 0.4);
  for (let i = 0; i < TEETH; i++) {
    // Down from the upper lip, and up from the lower one half a tooth along.
    const a = s.x - w + i * tw;
    ctx.moveTo(a, s.y - gap);
    ctx.lineTo(a + tw / 2, s.y - gap + th);
    ctx.lineTo(a + tw, s.y - gap);
    const b = a + tw / 2;
    if (b + tw > s.x + w + 0.5) continue;
    ctx.moveTo(b, s.y);
    ctx.lineTo(b + tw / 2, s.y - th);
    ctx.lineTo(b + tw, s.y);
  }
  ctx.fill();
}
