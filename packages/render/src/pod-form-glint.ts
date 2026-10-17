import { faded } from "./pod-fade.js";
import { countSwell, drawShine, drawStar, type PodDraw } from "./pod-pickup.js";
import { blinkAt, type Seed, seedAt, tipOf } from "./pod-seed.js";
import { drawSeed } from "./pod-seed-draw.js";
import { FAKE_PAINT } from "./pod-seed-paint.js";

/**
 * **GLINT** — the seed cut into facets and set with crystal shards, like a gem
 * to pick up: the coin's shine crosses it, it flashes on the count, and the
 * near spike tips take turns to twinkle as four-point stars.
 *
 * **Its fake is a SHELL.** In dark blood-red, blinking red, and on the count
 * it shudders and goes hollow: the inside turns black, a lit crack runs
 * across it — a gem that turns out to be an empty case.
 */
const STYLE = { spike: "crystal", skin: "facets" } as const;

export const drawGlintForm: PodDraw = (ctx, x, y, r, t, beatsLeft, fake) => {
  const k = fake ? countSwell(t, beatsLeft, 0.45) : 0;
  // A shudder rather than a sway: it changes side each sixtieth of a second.
  const shake = k * r * 0.24 * (Math.floor(t * 60) % 2 === 0 ? 1 : -1);
  const s = seedAt(x + shake, y, r, t, beatsLeft);
  const flash = blinkAt(t, beatsLeft);
  s.R *= 1 + 0.1 * flash;
  if (!fake) {
    drawSeed(ctx, s, { flash, ...STYLE });
    drawShine(ctx, s, t);
    twinkles(ctx, s, t);
    return;
  }
  drawSeed(ctx, s, { flash, paint: FAKE_PAINT, ...STYLE });
  if (k > 0.05) hollow(ctx, s, k);
};

/** Each near spike tip in its turn a star that opens and shuts. */
function twinkles(ctx: CanvasRenderingContext2D, s: Seed, t: number) {
  s.studs.forEach((d, i) => {
    if (d.z < 0.1) return;
    const ph = (t * 0.9 + i * 0.37) % 1;
    if (ph > 0.3) return;
    const k = Math.sin((ph / 0.3) * Math.PI);
    const tip = tipOf(s, d);
    drawStar(ctx, tip.x, tip.y, s.R * (0.25 + 0.45 * k), k);
  });
}

/** Nothing inside: black where the light was, and a crack lit from the rim. */
function hollow(ctx: CanvasRenderingContext2D, s: Seed, k: number) {
  ctx.globalAlpha = faded(0.92 * k);
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.R * 0.84, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = faded(k);
  ctx.strokeStyle = FAKE_PAINT.flashRim;
  ctx.lineWidth = Math.max(1, s.R * 0.09);
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(s.x - s.R * 0.8, s.y - s.R * 0.3);
  ctx.lineTo(s.x - s.R * 0.25, s.y + s.R * 0.1);
  ctx.lineTo(s.x + s.R * 0.1, s.y - s.R * 0.25);
  ctx.lineTo(s.x + s.R * 0.8, s.y + s.R * 0.25);
  ctx.stroke();
}
