import { drawShine, type PodDraw } from "./pod-pickup.js";
import { seedAt } from "./pod-seed.js";
import { drawSeed } from "./pod-seed-draw.js";
import { FAKE_PAINT } from "./pod-seed-paint.js";

/**
 * **HOP** — the seed striped like a sweet and curled with thorns, bouncing in
 * place like a pickup: it stretches as it leaves, lands, squashes flat and
 * flashes as it lands, a hop on every beat of its clock (on the seconds when
 * it owes nothing). It never leaves its place by more than a quarter of a
 * tile and comes back to it every hop, so the ring round it still sits round
 * it.
 *
 * **Its fake springs BARBS.** In dark blood-red, and as it lands its curled
 * thorns snap out into long dark barbs and the landing flashes red — a mine
 * under the sweet's skin.
 */
const STYLE = { spike: "thorn", skin: "stripes" } as const;

export const drawHopForm: PodDraw = (ctx, x, y, r, t, beatsLeft, fake) => {
  const s = seedAt(x, y, r, t, beatsLeft);
  const u = Number.isFinite(beatsLeft) ? 1 - s.beat : (t * 1.3) % 1;
  // In the air for the first 60 % of the count, then down and squashing.
  const air = u < 0.6 ? u / 0.6 : 0;
  // A pod is POD_TILES (0.38) of a tile, so this is a fifth of a tile or so.
  const lift = 4 * air * (1 - air) * r * (0.47 + 0.21 * s.awake);
  const land = u >= 0.6 ? Math.sin(((u - 0.6) / 0.4) * Math.PI) : 0;
  const stretch = u < 0.6 ? 0.18 * (1 - air) ** 3 : 0;
  const sx = 1 + 0.26 * land - 0.12 * stretch;
  const sy = 1 - 0.26 * land + stretch;
  const foot = s.y + s.R;
  ctx.save();
  ctx.translate(s.x, foot);
  ctx.scale(sx, sy);
  ctx.translate(-s.x, -foot);
  s.y -= lift;
  if (!fake) {
    drawSeed(ctx, s, { flash: land > 0.4 ? 1 : 0, ...STYLE });
    drawShine(ctx, s, t);
  } else if (land > 0.2) {
    s.reach *= 1 + 0.55 * land;
    drawSeed(ctx, s, {
      flash: land > 0.4 ? 1 : 0,
      paint: FAKE_PAINT,
      spike: "cone",
      skin: "stripes",
    });
  } else drawSeed(ctx, s, { paint: FAKE_PAINT, ...STYLE });
  ctx.restore();
};
