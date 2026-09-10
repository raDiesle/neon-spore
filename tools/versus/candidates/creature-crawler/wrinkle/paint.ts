import { CRAWLER } from "../../../../../packages/content/src/crawler-shape.js";
import { KEY, LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import { surfaceLit } from "../../../../../packages/content/src/surface.js";
import type { CrawlerLinkDraw } from "../../../../../packages/render/src/crawler-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * WRINKLE — a ring that squeezes bunches its skin: meridians of fold come up
 * across it as it contracts and smooth away as it lets go, and they ride the
 * roll.
 *
 * FOLD off the shapes page, as lines of longitude. A maggot's segment is a
 * bag of skin, and when the muscle under it shortens the skin has nowhere to
 * go but into creases running round the segment — which on a ball seen from
 * the side are meridians, each an ellipse arc whose half-width is
 * `rx·sin(α)`: a straight line down the middle when it faces us, bowed to
 * the limb a quarter turn on. Six of them turn with the shipped roll, each a
 * ridge drawn as a shadow line and a lit line a hair toward the key, lit by
 * calling `surfaceLit` on the fold's own normal, and their strength is the
 * squeeze: gone on a slack ring, deep on a tight one. So the wave running
 * down the worm is seen on the skin and not only in the outline. The light
 * pass and the specular are the shipped ones; the pores go.
 */

/** The shipped surface's own clock, so the folds go round at the rate the
 * pores they replace did (`crawler-skin.ts`). */
const ROLL_BEATS = 4;
const ROLL_LAG = 0.5;
/** How many folds a ring carries, and how far up and down the ball they run
 * as a share of its height. */
const FOLDS = 6;
const RUN = 0.8;
/** How far the lit line stands off the shadow line, in line widths. */
const RIDGE = 0.8;
/** What a fold shows on a slack ring, and how much the squeeze adds. */
const SLACK = 0.12;
const TIGHT = 0.7;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function wrinkle(d: CrawlerLinkDraw): void {
  const { ctx, body, ry, dir, squeeze, beats, order } = d;
  const rx = d.rx * (1 - CRAWLER.pulse * squeeze);
  const theta = -dir * ((beats / ROLL_BEATS) * Math.PI * 2 - order * ROLL_LAG);
  const depth = SLACK + TIGHT * squeeze;

  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature);

  ctx.lineCap = "round";
  for (let i = 0; i < FOLDS; i++) {
    const a = (i / FOLDS) * Math.PI * 2 + theta;
    const sinA = Math.sin(a);
    const cosA = Math.cos(a);
    if (cosA <= 0.05) continue;
    // The fold's own normal is the surface's along its meridian, read at the
    // equator: the projection called, so a fold turned toward the key is the
    // lit one.
    const lit = surfaceLit(1, 0, sinA, cosA);
    const half = Math.max(0.5, rx * Math.abs(sinA));
    const arc = new Path2D();
    arc.ellipse(0, 0, half, ry * RUN, 0, -Math.PI / 2, Math.PI / 2, sinA < 0);
    // Full strength across the middle, thinning to nothing at the limb,
    // which is what a crease seen from further round does.
    const show = depth * cosA;
    ctx.lineWidth = STROKE.inner * 0.8;
    ctx.save();
    ctx.translate(-KEY.x * STROKE.inner * RIDGE, -KEY.y * STROKE.inner * RIDGE);
    ctx.strokeStyle = rgba(SHADOW, 0.7 * show);
    ctx.stroke(arc);
    ctx.restore();
    ctx.save();
    ctx.translate(KEY.x * STROKE.inner * RIDGE, KEY.y * STROKE.inner * RIDGE);
    ctx.strokeStyle = rgba(PALETTE.text, (0.1 + 0.45 * lit) * show);
    ctx.stroke(arc);
    ctx.restore();
  }

  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.ellipse(-rx * 0.3, -ry * 0.34, rx * 0.26, ry * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.34);
  ctx.fill();
  ctx.restore();
}
