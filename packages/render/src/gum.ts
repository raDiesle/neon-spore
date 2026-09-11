import { GUM, livingPath } from "@neon-spore/content";
import {
  bodyCenterCol,
  type Creature,
  gumFlingDir,
  gumIsStuck,
  gumPull,
  occupiesCol,
  type SimConfig,
  spanOf,
  type World,
} from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { contourClock, livingScale } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE GUM, drawn in its two states: a heavy drop coming down a lane, and a
 * smear across the ship once it has landed.
 *
 * **Nothing here is a new shape.** In the air it is THE WEIGHT's sac off the
 * shape sheet (`content/silhouettes-gum.ts`), the body of a drop that has not
 * yet landed on the thing it will stick to. On the ship it is the same contour
 * pressed flat — wide as the columns it covers and a third of a tile tall —
 * with drips hanging off it down the plating, because a thing that has stuck
 * to a surface is drawn *on* the surface and not standing on its row.
 *
 * **Its own material, on both screens.** Every colour here is the palette's
 * `venom` — a yellow-green that is nobody's ammunition and no seat's hull,
 * the way THE BALLOON's film is nobody's colour — so a gum is the same gum on
 * player 1's violet ship and player 2's amber one, and neither seat can read a
 * colour off it that says "load this".
 *
 * **What the picture has to say**, in order of how far away it reads:
 * 1. it is stuck, and how wide: the smear covers exactly the lanes the cannon
 *    has lost;
 * 2. the cannon is under it, or not: it glows and brightens while the cannon
 *    stands in one of its columns, and lies matte and still otherwise — which
 *    is player 2's whole readout of where the cannon is, since a swipe with no
 *    cannon under it moves nothing (`sim/gum.ts`);
 * 3. which way: while the cannon is under it, a light runs along the hull
 *    from the gum toward the nearer wall — the side a swipe has to go — a
 *    streak rather than an arrow, for the owner's rule that a mark is light;
 * 4. the swipe itself: the smear leans and shifts with player 2's pull, on
 *    both screens, so player 1 sees the hand arrive.
 */

/** The falling drop's footprint, as a share of a tile — a slick's, near enough. */
const DROP_R = 0.5;
/** The smear's reach past its columns, and its height, in tiles. */
const SMEAR_PAD = 0.12;
const SMEAR_H = 0.36;
/** How far above the sampled surface the smear's centre sits, in tiles. */
const SMEAR_LIFT = 0.16;
/** How far the streak toward the wall reaches, in tiles. */
const STREAK = 2.2;

export function drawGumBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, near } = b;
  // A gum on the ship is drawn over the ship, by `drawStuckGums` below, and
  // not here under it: the plating would cover its drips.
  if (gumIsStuck(c)) return;
  const tile = l.tile;
  const s = livingScale(GUM, tile * DROP_R);
  const path = new Path2D(livingPath(GUM, contourClock(c.id, time)));
  const venom = hazed(world.cfg, PALETTE.venom, near);
  halo(ctx, x, y + tile * 0.1, tile * 0.9, venom, 0.3);
  // Small drops left behind it up the lane, each falling back from where the
  // body was: the trail of something too heavy to hold together.
  ctx.save();
  ctx.fillStyle = venom;
  for (let k = 0; k < 3; k++) {
    const ph = (time * 1.1 + k * 0.37 + c.id * 0.13) % 1;
    const dx = Math.sin(k * 2.1 + c.id) * tile * 0.12;
    ctx.globalAlpha = 0.75 * (1 - ph);
    ctx.beginPath();
    ctx.arc(x + dx, y - tile * (0.5 + ph * 0.9), tile * 0.07 * (1 - ph) + 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  paintSac(ctx, path, x, y, s, s, 0, world.cfg, near, 1);
}

/**
 * Every gum on the ship, over the finished hull. `surfaceY` is the same
 * membrane the crawler walks and the fence rests on, so a gum lies on the
 * plating wherever the plating is — and lifts with the cannon's swelling when
 * the cannon slides under it, which is the beat that matters.
 */
export function drawStuckGums(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  surfaceY: SurfaceY,
  time: number,
): void {
  const tile = l.tile;
  const cfg = world.cfg;
  for (const c of world.creatures) {
    if (!gumIsStuck(c)) continue;
    const span = spanOf(c);
    const cx = tileCX(l, bodyCenterCol(c, c.col));
    const under = occupiesCol(c, world.cannonCol);
    const pull = gumPull(c) / cfg.gumSwipeMilli;
    const sy = surfaceY(cx) - tile * SMEAR_LIFT;
    // The light toward the nearer wall, while the cannon is under it.
    if (under) streak(ctx, cx, sy, tile, gumFlingDir(cfg.cols, c) * STREAK * tile);
    halo(ctx, cx, sy, tile * (0.9 + span * 0.35), PALETTE.venom, under ? 0.55 : 0.22);
    drips(ctx, c, cx, surfaceY, span, tile, time);
    const halfW = (span / 2 + SMEAR_PAD) * tile;
    const path = new Path2D(livingPath(GUM, contourClock(c.id, time)));
    // Leaning with the pull: the top of the smear goes the way the hand went
    // and the base stays stuck, which is what a swipe on something adhesive
    // looks like. `pull` is already cut to one swipe by the rule.
    const sx = halfW / GUM.rx;
    const sy2 = (tile * SMEAR_H) / GUM.ry;
    paintSac(ctx, path, cx + pull * tile * 0.25, sy, sx, sy2, -pull * 0.6, cfg, 1, under ? 1 : 0.7);
  }
}

/** The smear's own light along the hull toward the wall a swipe has to go. */
function streak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  dx: number,
): void {
  const g = ctx.createLinearGradient(x, 0, x + dx, 0);
  g.addColorStop(0, "rgba(155,232,30,0.45)");
  g.addColorStop(1, "rgba(155,232,30,0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  const h = tile * 0.28;
  ctx.fillRect(Math.min(x, x + dx), y - h / 2, Math.abs(dx), h);
  ctx.restore();
}

/** Drops hanging off the smear down the plating, two a column, each on its
 * own slow clock so the whole thing reads as still oozing. */
function drips(
  ctx: CanvasRenderingContext2D,
  c: Creature,
  cx: number,
  surfaceY: SurfaceY,
  span: number,
  tile: number,
  time: number,
): void {
  const n = span * 2;
  ctx.save();
  ctx.strokeStyle = PALETTE.venom;
  ctx.fillStyle = PALETTE.venom;
  ctx.lineWidth = Math.max(1, tile * 0.05);
  for (let i = 0; i < n; i++) {
    const x = cx + ((i + 0.5) / n - 0.5) * span * tile * 0.9;
    const ph = (time * 0.22 + ((i * 7 + c.id * 3) % 11) / 11) % 1;
    const top = surfaceY(x);
    const len = tile * (0.12 + 0.4 * ph);
    ctx.globalAlpha = 0.7 * (1 - ph * 0.6);
    ctx.beginPath();
    ctx.moveTo(x, top - tile * 0.05);
    ctx.lineTo(x, top + len);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, top + len, tile * (0.05 + 0.03 * ph), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** One sac, filled from rim-light at the top to its deep green at the bottom,
 * with its border on — the same paint for the drop and the smear. */
function paintSac(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  x: number,
  y: number,
  sx: number,
  sy: number,
  shear: number,
  cfg: SimConfig,
  near: number,
  bright: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, shear, 1, 0, 0);
  ctx.scale(sx, sy);
  const g = ctx.createLinearGradient(0, -GUM.ry, 0, GUM.ry);
  g.addColorStop(0, hazed(cfg, PALETTE.venomRim, near));
  g.addColorStop(0.4, hazed(cfg, PALETTE.venom, near));
  g.addColorStop(1, hazed(cfg, PALETTE.venomDeep, near));
  ctx.globalAlpha = bright;
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = hazed(cfg, PALETTE.venomRim, near);
  ctx.lineWidth = 1.4 / Math.max(sx, sy);
  ctx.stroke(path);
  // A gloss high on the left, the wet light every slime in this game wears.
  ctx.globalAlpha = 0.45 * bright;
  ctx.fillStyle = PALETTE.venomRim;
  ctx.beginPath();
  ctx.ellipse(-GUM.rx * 0.3, -GUM.ry * 0.45, GUM.rx * 0.22, GUM.ry * 0.1, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
