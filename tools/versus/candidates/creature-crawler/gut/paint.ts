import { CRAWLER } from "../../../../../packages/content/src/crawler-shape.js";
import { KEY, LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { CrawlerLinkDraw } from "../../../../../packages/render/src/crawler-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * GUT — the ring is a bag with something in it: a dark organ seen through
 * translucent skin, which lags the walk and slops as the ring squeezes, under
 * a rim of light where the skin is thinnest.
 *
 * VESICLE off the shapes page, with an organ inside. A maggot is see-through,
 * and what says *alive* about one is not its surface but the dark mass
 * inside it shifting a beat behind the body. So: a soft dark ellipse in the
 * ring, pushed toward the tail as the ring squeezes and swinging back as it
 * lets go — inertia, not decoration — narrowed by the contraction the way the
 * bag round it is; a sliver of the skin's own colour along the limb away
 * from the key, added as light, which is what thin skin does where the light
 * comes through it from behind; the shipped pores, kept but fainter, riding
 * the roll on top; and the shipped light pass and specular over all of it.
 */

/** The shipped surface's own clock (`crawler-skin.ts`). */
const ROLL_BEATS = 4;
const ROLL_LAG = 0.5;
const PORES = 8;
const REACH = 0.72;
const PORE_FLOOR = 0.3;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PINS = Array.from({ length: PORES }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.7) * LAT_LIMIT * 0.7, REACH),
);
/** How big the organ is as a share of the ring, how far the squeeze pushes
 * it toward the tail, and how far it overshoots on the way back. */
const ORGAN = 0.52;
const SLOP = 0.3;
const SWING = 0.12;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function gut(d: CrawlerLinkDraw): void {
  const { ctx, body, ry, dir, squeeze, beats, order } = d;
  const rx = d.rx * (1 - CRAWLER.pulse * squeeze);
  const theta = -dir * ((beats / ROLL_BEATS) * Math.PI * 2 - order * ROLL_LAG);

  ctx.save();
  ctx.clip(body);
  // The organ: behind the middle by the squeeze, and swinging on the shared
  // clock a little behind the ring's own contraction, so it is seen to be a
  // loose thing inside a moving one rather than a mark on it.
  const lag = Math.sin((beats - order * ROLL_LAG) * Math.PI - 0.9) * SWING;
  const ox = -dir * rx * (SLOP * squeeze + lag);
  const g = ctx.createRadialGradient(ox, ry * 0.08, 0, ox, ry * 0.08, rx * ORGAN);
  g.addColorStop(0, rgba(SHADOW, 0.62));
  g.addColorStop(0.7, rgba(SHADOW, 0.4));
  g.addColorStop(1, rgba(SHADOW, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(
    ox,
    ry * 0.08,
    rx * ORGAN * (1 - 0.25 * squeeze),
    ry * ORGAN * 0.8,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature);

  for (const p of PINS) {
    const f = facet(p, theta);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * rx, f.y * ry);
    ctx.scale(f.sx, f.sy);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.14, ry * 0.14, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.background, 0.3 * surfaceDim(PORE_FLOOR, f.lit));
    ctx.fill();
    ctx.restore();
  }

  // The skin lit from behind, along the limb away from the key: a crescent of
  // the body's own light, added, where the bag is thinnest.
  ctx.globalCompositeOperation = "lighter";
  const r = Math.max(rx, ry);
  // Centred on the key's side and reaching across, so the far limb is the
  // one inside the bright stops and the near one is not.
  const back = ctx.createRadialGradient(
    KEY.x * r * 0.55,
    KEY.y * r * 0.55,
    r * 0.9,
    KEY.x * r * 0.55,
    KEY.y * r * 0.55,
    r * 1.55,
  );
  back.addColorStop(0, rgba(PALETTE.text, 0));
  back.addColorStop(0.75, rgba(PALETTE.text, 0.1));
  back.addColorStop(1, rgba(PALETTE.text, 0.22));
  ctx.fillStyle = back;
  ctx.fill(body);
  ctx.beginPath();
  ctx.ellipse(-rx * 0.3, -ry * 0.34, rx * 0.26, ry * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.34);
  ctx.fill();
  ctx.restore();
}
