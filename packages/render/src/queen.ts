import { crystalPath, QUEEN_SHELL } from "@neon-spore/content";
import { type BossState, type Creature, queenTorchCol, spanCenterCol } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, showsQueenHint, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawWeakPoint, weakPointHex } from "./queen-weakpoint.js";
import { drawTorchRock, torchRadius, torchRotation } from "./torch.js";

/** How much faster the outer body's wobble gets by her last petal. */
const OUTER_WOBBLE_BONUS = 1.5;
/** Never quite zero — a degenerate radius is what `frame.test.ts` exists to catch. */
const EGG_FLOOR = 0.02;
/** How hard the queen shudders per tile of her own size, at full shake. */
const SHAKE_TILES = 0.06;

/**
 * Her whole figure, in tiles from the centre of the tile she stands on. She
 * is a wide, low hull with one tall head over the middle of it, and that is
 * the shape the rest of this follows from:
 *
 * - the mark hangs out of the middle of her underside, where a shot coming
 *   straight up her column reaches it, and the hull closes over its top and
 *   both its sides so only the lower half of it is ever exposed;
 * - the two torches ride the tips of the hull, `QUEEN_FLANK_TILES` out. Her
 *   lowest edge sits well above a torch's own lower edge at that offset, so
 *   there is nothing of her under either egg and a released one falls
 *   straight down out of its socket.
 *
 * Both of those readings are measurements, not intentions, and
 * `test/queen-figure.test.ts` takes them — off `crystalRadiusMul`, the same
 * facet reach the shapes are actually drawn with — every time these numbers
 * are touched.
 */
export const QUEEN_FIGURE = {
  bodyCy: -0.5,
  bodyRx: 2.2,
  bodyRy: 0.72,
  headCy: -1.28,
  headRx: 0.46,
  headRy: 0.52,
  weakCy: 0.42,
  weakR: 0.4,
  /** The health bar rides her shell rather than floating over her head: the
   * head reaches the top of the field from the row she holds, and a count
   * drawn above it would land on the radar strip instead of on her. */
  petalCy: -0.5,
} as const;

/**
 * The queen: an armoured shell of the same rock her torches are made of, a
 * head over the middle of it, a weak point cradled in her underside where a
 * shot actually lands, and a torch on each wing tip — the very rock that
 * drops, not a picture of one.
 */
export function drawQueen(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  queen: Creature,
  boss: BossState,
  beat: number,
  time: number,
  beatPhase: number,
  shake: number,
  eggGrowShare: number,
): void {
  const f = QUEEN_FIGURE;
  const tile = l.tile;
  const baseX = tileCX(l, queen.col);
  const baseY = tileCY(l, queen.row);

  const healthShare = boss.startPetals > 0 ? queen.petals / boss.startPetals : 0;

  // A local shudder, not a screen shake: mismatched frequencies so it reads as
  // a shudder rather than a spin, decaying with `shake` as the timer runs out.
  const jitter = tile * SHAKE_TILES * shake;
  const ox = Math.sin(time * 40) * jitter;
  const oy = Math.cos(time * 53) * jitter;
  const x = baseX + ox;
  const y = baseY + oy;

  // The order is the picture. The mark first, so the shell closes over it;
  // the head before the body, so the body covers where it joins.
  const weakY = y + f.weakCy * tile;
  drawWeakPoint(ctx, x, weakY, f.weakR * tile, queen, boss, beat, time, healthShare);
  const shell = (cy: number, rx: number, ry: number, id: number): void =>
    drawShell(ctx, x, y + cy * tile, rx * tile, ry * tile, id, time, healthShare);
  shell(f.headCy, f.headRx, f.headRy, queen.id + 1);
  shell(f.bodyCy, f.bodyRx, f.bodyRy, queen.id);

  // Last, over the shell that half-buries the mark, or the colour she is
  // asking for would be buried with it.
  const hex = weakPointHex(queen, boss, beat);
  if (hex != null) halo(ctx, x, weakY, f.weakR * tile * 1.9, hex, 0.16);

  drawEgg(ctx, l, queen, boss, -1, ox, oy, beat, beatPhase, time, eggGrowShare);
  drawEgg(ctx, l, queen, boss, 1, ox, oy, beat, beatPhase, time, eggGrowShare);

  drawPetals(ctx, x, y + f.petalCy * tile, f.bodyRx * tile, queen.petals, boss.startPetals);
}

/**
 * One piece of her armour — body or head, the same angular rock her torches
 * are made of rather than a living contour. Faceted and gradient-shaded like
 * `drawTorchRock`, so the material reads as one thing across her whole body
 * and the rock she drops.
 */
function drawShell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  id: number,
  time: number,
  healthShare: number,
): void {
  const shape = QUEEN_SHELL;
  const phase = (id % 7) * 0.9;
  const wobbleMult = 1 + (1 - healthShare) * OUTER_WOBBLE_BONUS;
  const t = time * wobbleMult + phase;
  const d = crystalPath(0, 0, rx, ry, shape.sides, shape.depth, shape.wobble, t, shape.seed);
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x, y);
  const rg = ctx.createLinearGradient(-rx, -ry, rx, ry);
  rg.addColorStop(0, "#6B707E");
  rg.addColorStop(0.55, "#3C3F49");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.06);
  ctx.stroke(path);
  ctx.restore();
}

/**
 * How much of the egg is there this beat.
 *
 * 0 on the beat the torch on that side broke off: it is standing in the
 * socket as a creature of its own now (`spit` in sim/boss.ts, drawn by
 * `drawCreatures`), and an egg drawn here as well is exactly the doubling
 * this replaces — one shape shrinking while an identical one grew beside it.
 * Then back to full over `growShare` of the beat after, so the next torch
 * visibly grows into the empty socket instead of appearing whole in it.
 */
function eggScale(
  boss: BossState,
  side: -1 | 1,
  beat: number,
  beatPhase: number,
  growShare: number,
): number {
  if (boss.releaseSide !== side) return 1;
  if (beat === boss.releaseBeat) return 0;
  if (beat !== boss.releaseBeat + 1) return 1;
  return Math.max(EGG_FLOOR, Math.min(1, beatPhase / Math.max(1e-3, growShare)));
}

/**
 * One flanking torch, drawn by the torch's own hand (`drawTorchRock`) at the
 * torch's own radius and facing, in the tile column the rock will be pushed
 * into — so the beat it breaks off, the creature takes over the picture
 * without anything moving, changing size or turning. It carries a bright
 * ring, for player 2 only, while it is the side the next one comes from. No
 * tail: a torch only drags one once it is falling (`drawTorch`).
 */
function drawEgg(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  queen: Creature,
  boss: BossState,
  side: -1 | 1,
  ox: number,
  oy: number,
  beat: number,
  beatPhase: number,
  time: number,
  growShare: number,
): void {
  const scale = eggScale(boss, side, beat, beatPhase, growShare);
  if (scale <= 0) return;

  const cx = tileCX(l, spanCenterCol("torch", queenTorchCol(queen.col, side))) + ox;
  const cy = tileCY(l, queen.row) + oy;
  const r = torchRadius(l) * scale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(torchRotation(cx));
  drawTorchRock(ctx, r, time);
  ctx.restore();

  if (boss.dropSide === side && showsQueenHint(l.role)) {
    const pulse = 0.4 + 0.25 * Math.sin(time * 3);
    ctx.strokeStyle = PALETTE.shieldRim;
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    halo(ctx, cx, cy, r * 2.4, PALETTE.shieldRim, pulse * 0.7);
  }
}

/**
 * The health bar, across her shell so both screens see the same count. Every
 * petal she started with gets a slot: an empty ring where a filled dot used
 * to be reads as progress, not just a shrinking row easy to miss at a glance.
 */
function drawPetals(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  petals: number,
  startPetals: number,
): void {
  if (startPetals <= 0) return;
  const petalR = rx * 0.055;
  const span = rx * 1.2;
  for (let i = 0; i < startPetals; i++) {
    const px = startPetals === 1 ? 0 : -span / 2 + (span / (startPetals - 1)) * i;
    const cx = x + px;
    ctx.beginPath();
    ctx.arc(cx, y, petalR, 0, Math.PI * 2);
    if (i < petals) {
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fill();
      ctx.strokeStyle = PALETTE.hull;
      ctx.lineWidth = Math.max(1, petalR * 0.3);
      ctx.stroke();
      halo(ctx, cx, y, petalR * 3, PALETTE.hullRim, 0.4);
    } else {
      ctx.strokeStyle = PALETTE.dim;
      ctx.lineWidth = Math.max(1, petalR * 0.3);
      ctx.stroke();
    }
  }
}
