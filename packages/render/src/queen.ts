import { blobPath, crystalPath, METEOR, QUEEN } from "@neon-spore/content";
import type { BossState, Creature } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, showsQueenHint, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawWeakPoint } from "./queen-weakpoint.js";

/** How much faster the outer body's wobble gets by her last petal. */
const OUTER_WOBBLE_BONUS = 1.5;
/** Share of a beat a bulge takes to hand off to the rock breaking out of it. */
const GROW_SHARE = 0.3;
/** Never quite zero — a degenerate radius is what `frame.test.ts` exists to catch. */
const BULGE_FLOOR = 0.02;
/** How hard the queen shudders per tile of her own size, at full shake. */
const SHAKE_TILES = 0.06;
/** How far past her own edge the weak point sits, as a share of her vertical radius. */
const WEAK_POINT_DROP = 1.1;

/**
 * The queen: an armoured body of her own shape, a weak point that sticks out
 * of her lowest edge where a shot actually lands, and two bulges either side
 * — already shaped like the rock they are — that hand one off to the meteor
 * breaking out of it.
 */
export function drawQueen(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  queen: Creature,
  boss: BossState,
  beat: number,
  time: number,
  beatPhase: number,
  spitSide: -1 | 0 | 1,
  shake: number,
): void {
  const shape = QUEEN;
  const r = l.tile * 1.3;
  const scale = r / Math.max(shape.rx, shape.ry);
  const baseX = tileCX(l, queen.col);
  const baseY = tileCY(l, queen.row);

  const healthShare = boss.startPetals > 0 ? queen.petals / boss.startPetals : 0;

  // A local shudder, not a screen shake: mismatched frequencies so it reads as
  // a shudder rather than a spin, decaying with `shake` as the timer runs out.
  const jitter = l.tile * SHAKE_TILES * shake;
  const x = baseX + Math.sin(time * 40) * jitter;
  const y = baseY + Math.cos(time * 53) * jitter;

  drawOuterBody(ctx, x, y, r, scale, queen.id, time, healthShare);

  const bulgeR = r * 0.35;
  const bulgeOffset = r * 0.85;
  drawBulge(ctx, x - bulgeOffset, y, bulgeR, -1, boss, l.role, spitSide, beatPhase, time, queen.id);
  drawBulge(ctx, x + bulgeOffset, y, bulgeR, 1, boss, l.role, spitSide, beatPhase, time, queen.id);

  const wr = l.tile * 0.4;
  const wy = y + shape.ry * scale * WEAK_POINT_DROP;
  drawWeakPoint(ctx, x, wy, wr, queen, boss, beat, time, healthShare);

  drawPetals(ctx, x, y, r, queen.petals, boss.startPetals);
}

/** Always the same rock-armoured look — the open/announced colour lives on the weak point now. */
function drawOuterBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  scale: number,
  id: number,
  time: number,
  healthShare: number,
): void {
  const shape = QUEEN;
  const phase = (id % 7) * 0.9;
  const wobbleMult = 1 + (1 - healthShare) * OUTER_WOBBLE_BONUS;
  const t = time * wobbleMult + phase;
  const d = blobPath(
    0,
    0,
    shape.rx,
    shape.ry,
    shape.lobes,
    shape.depth,
    shape.wobble,
    t,
    shape.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1, r * 0.1) / scale;
  ctx.stroke(path);
  ctx.restore();
}

/**
 * One flanking bulge, already the same rock a shot cannot break — angular
 * facets, not a contour, exactly like `drawMeteor`, so the eye reads what it
 * will become before it breaks off. It shrinks to nothing over the first
 * `GROW_SHARE` of the beat a rock breaks out of its side, and — for player 2
 * only — carries a bright ring while a rock is announced for this side,
 * ahead of the drop.
 */
function drawBulge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  side: -1 | 1,
  boss: BossState,
  role: Layout["role"],
  spitSide: -1 | 0 | 1,
  beatPhase: number,
  time: number,
  id: number,
): void {
  let scale = 1;
  if (spitSide === side) {
    const growth = Math.min(1, beatPhase / GROW_SHARE);
    scale = Math.max(BULGE_FLOOR, 1 - growth);
  }
  const rr = r * scale;

  const spin = ((id + side) % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * rr * 0.15;
  const d = crystalPath(
    0,
    0,
    rr,
    rr,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(cx + wobble, cy);
  ctx.rotate(spin + time * 0.12);
  const rg = ctx.createLinearGradient(-rr, -rr, rr, rr);
  rg.addColorStop(0, "#9DA3B0");
  rg.addColorStop(0.55, "#6B707E");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1, rr * 0.12);
  ctx.stroke(path);
  ctx.restore();

  if (boss.dropSide === side && showsQueenHint(role)) {
    const pulse = 0.4 + 0.25 * Math.sin(time * 3);
    ctx.strokeStyle = PALETTE.shieldRim;
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, rr * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    halo(ctx, cx, cy, rr * 2.4, PALETTE.shieldRim, pulse * 0.7);
  }
}

/**
 * The health bar, above her body so both screens see the same count. Every
 * petal she started with gets a slot, not just the ones she has left — an
 * empty ring where a filled dot used to be reads as progress, not just a
 * shrinking row that is easy to miss at a glance.
 */
function drawPetals(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  petals: number,
  startPetals: number,
): void {
  if (startPetals <= 0) return;
  const petalR = r * 0.14;
  const span = r * 1.7;
  const py = -r * 1.2;
  for (let i = 0; i < startPetals; i++) {
    const px = startPetals === 1 ? 0 : -span / 2 + (span / (startPetals - 1)) * i;
    const cx = x + px;
    const cy = y + py;
    ctx.beginPath();
    ctx.arc(cx, cy, petalR, 0, Math.PI * 2);
    if (i < petals) {
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fill();
      ctx.strokeStyle = PALETTE.hull;
      ctx.lineWidth = Math.max(1, petalR * 0.3);
      ctx.stroke();
      halo(ctx, cx, cy, petalR * 3, PALETTE.hullRim, 0.4);
    } else {
      ctx.strokeStyle = PALETTE.dim;
      ctx.lineWidth = Math.max(1, petalR * 0.3);
      ctx.stroke();
    }
  }
}
