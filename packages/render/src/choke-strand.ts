import { CHOKE, livingPath } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { pincers } from "./choke-coil.js";
import type { CrawlState } from "./choke-crawl.js";
import { livingScale } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { PALETTE } from "./palette.js";

/**
 * THE CHOKE's strand — the body itself, as opposed to the loops it becomes
 * (`choke-coil.ts`) — painted in the air and crawling on the ship.
 *
 * Split out of `choke.ts` when the crawl arrived and that file had no room
 * for a second picture of the same body. The paint is one function because
 * the two pictures must be the same material: a strand that fell violet-lit
 * and crawled a different yellow would read as two bodies.
 */

/** The falling strand's footprint, as a share of a tile. */
export const STRAND_R = 0.55;

/** The falling strand: rim-light at the top through bile to its deep at the
 * bottom, its border on, and a gloss high on the left. Drawn about the
 * origin; the caller has translated, rotated and scaled. */
export function paintStrand(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  s: number,
  cfg: SimConfig,
  near: number,
): void {
  const g = ctx.createLinearGradient(0, -CHOKE.ry, 0, CHOKE.ry);
  g.addColorStop(0, hazed(cfg, PALETTE.bileRim, near));
  g.addColorStop(0.35, hazed(cfg, PALETTE.bile, near));
  g.addColorStop(1, hazed(cfg, PALETTE.bileDeep, near));
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = hazed(cfg, PALETTE.bileRim, near);
  ctx.lineWidth = 1.4 / s;
  ctx.stroke(path);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = PALETTE.bileRim;
  ctx.beginPath();
  ctx.ellipse(
    -CHOKE.rx * 0.3,
    -CHOKE.ry * 0.5,
    CHOKE.rx * 0.2,
    CHOKE.ry * 0.12,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * The strand on the plating, between the lane it fell in and the cannon:
 * lying along the skin with its hooks toward the cannon, going in surges —
 * a stretch forward, a pull of the tail up behind — the way a boneless thing
 * crosses a surface, and fast (`choke-crawl.ts`). One surge a column and
 * never fewer than two, so the shortest crawl still reads as a crawl. The
 * hooks open on the reach and close on the pull, and a light runs on the
 * plating under it toward where it is going.
 */
export function drawCrawler(
  ctx: CanvasRenderingContext2D,
  tile: number,
  cfg: SimConfig,
  crawl: CrawlState,
  cannonX: number,
  surfaceY: SurfaceY,
  time: number,
  id: number,
): void {
  const dir = cannonX >= crawl.fromX ? 1 : -1;
  const surges = Math.max(2, crawl.cols);
  const phase = crawl.u * surges * Math.PI * 2;
  // Surging rather than sliding: the eased way plus a little ahead on the
  // stretch and a little back on the pull, the whole never going backwards
  // because the pull is smaller than the way covered in the same time.
  const eased = 1 - (1 - crawl.u) ** 1.6;
  const surge = (Math.sin(phase) * 0.35) / surges;
  const along = Math.min(1, Math.max(0, eased + surge));
  const x = crawl.fromX + (cannonX - crawl.fromX) * along;
  const s = livingScale(CHOKE, tile * STRAND_R);
  // Stretched along the way on the reach, fattened across it on the pull.
  const stretch = 1 + 0.28 * Math.sin(phase);
  const fat = 1 - 0.18 * Math.sin(phase);
  // Lying on the skin: its half-width above the surface under its middle.
  const y = surfaceY(x) - CHOKE.rx * s * fat * 0.85;
  const near = 1;

  // The light running ahead of it on the plating.
  const reach = tile * 1.1;
  halo(ctx, x + dir * reach * 0.5, surfaceY(x + dir * reach * 0.5), tile * 0.7, PALETTE.bile, 0.22);
  halo(ctx, x, y, tile * 0.9, PALETTE.bile, 0.3);

  const path = new Path2D(livingPath(CHOKE, time * 1.5 + id));
  ctx.save();
  ctx.translate(x, y);
  // The sac's foot — where its hooks are — turned to point the way it goes.
  ctx.rotate(dir > 0 ? -Math.PI / 2 : Math.PI / 2);
  ctx.scale(s * fat, s * stretch);
  paintStrand(ctx, path, s, cfg, near);
  ctx.restore();

  // The hooks at the leading end, reaching on the stretch, shut on the pull.
  const footAhead = CHOKE.ry * s * stretch * 0.62;
  const foot = { x: x + dir * footAhead, y: y + CHOKE.rx * s * 0.1 };
  const open = 0.35 + 0.55 * Math.max(0, Math.sin(phase));
  pincers(ctx, foot, dir > 0 ? 0 : Math.PI, tile * 0.26, open);
}
