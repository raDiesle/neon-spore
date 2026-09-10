import { CRAWLER } from "../../../../../packages/content/src/crawler-shape.js";
import { LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import { facet, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { CrawlerLinkDraw } from "../../../../../packages/render/src/crawler-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * SETAE — every ring wears a girdle of short bristles round its rear, placed
 * by longitude and carried round by the roll, and they flick back as the ring
 * squeezes.
 *
 * SOFT SPIKE off the shapes page, in a ring. A maggot's segments each carry a
 * band of setae, and it is those — not the pores — that a walk is seen by:
 * on the contraction the bristles on the near side sweep back, and as the
 * surface rolls each one comes round the limb as a sliver, stands up across
 * the middle and goes round the back. Twelve per ring, pinned at one
 * latitude behind the ring's middle, drawn only where the surface faces us
 * and foreshortened by the tangent plane's map, so the girdle reads as a
 * ring of things standing off a ball. The light pass and the specular are
 * the shipped ones; the pores go, because a ring wearing both is a texture.
 */

/** The shipped surface's own clock — one turn in four beats, half a beat
 * behind per ring — so the bristles and the thing they replace go round at
 * one rate (`crawler-skin.ts`). */
const ROLL_BEATS = 4;
const ROLL_LAG = 0.5;
/** How many bristles a ring wears, how far out of the middle they root, and
 * how long they are as a share of the ring. */
const SETAE = 12;
const REACH = 0.86;
const LENGTH = 0.42;
/** Where round the ring the girdle stands: behind the middle, toward the
 * tail, as a share of the ring's height. */
const GIRDLE_LAT = 0.28;
/** What a bristle keeps of its light turned away, and how far the squeeze
 * sweeps it back, in radians. */
const FLOOR = 0.4;
const SWEEP = 0.7;

const PINS = Array.from({ length: SETAE }, (_, i) =>
  pin((i / SETAE) * Math.PI * 2, GIRDLE_LAT * (i % 2 === 0 ? 1 : 0.7), REACH),
);

export function setae(d: CrawlerLinkDraw): void {
  const { ctx, body, ry, dir, squeeze, beats, order } = d;
  const rx = d.rx * (1 - CRAWLER.pulse * squeeze);
  const theta = -dir * ((beats / ROLL_BEATS) * Math.PI * 2 - order * ROLL_LAG);

  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature);
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.ellipse(-rx * 0.3, -ry * 0.34, rx * 0.26, ry * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.34);
  ctx.fill();
  ctx.restore();

  // The bristles, outside the clip: they stand off the surface, and a hair
  // cut to the contour is a hair that stops where the body does.
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner * 0.9;
  for (const p of PINS) {
    const f = facet(p, theta);
    if (!f.near) continue;
    const x = f.x * rx;
    const y = f.y * ry;
    // Out along the surface's own normal at that point — the direction from
    // the ring's centre — then swept toward the tail by the squeeze, and
    // shortened across the middle by the tangent map's own `sx`: a bristle
    // facing us is seen end-on and reads short, one at the limb full length.
    const nx = x / Math.max(1, rx);
    const ny = y / Math.max(1, ry);
    const n = Math.hypot(nx, ny) || 1;
    const len = rx * LENGTH * (0.45 + 0.55 * (1 - Math.abs(f.sx)));
    const back = -dir * SWEEP * squeeze;
    const ex = x + ((nx / n) * Math.cos(back) - (ny / n) * Math.sin(back)) * len;
    const ey = y + ((nx / n) * Math.sin(back) + (ny / n) * Math.cos(back)) * len;
    ctx.strokeStyle = rgba(PALETTE.text, 0.6 * surfaceDim(FLOOR, f.lit));
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (ex - x) * 0.5 - dir * len * 0.15, y + (ey - y) * 0.5, ex, ey);
    ctx.stroke();
  }
}
