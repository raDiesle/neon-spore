import { crystalPath, QUEEN_SHELL } from "@neon-spore/content";
import type { BossState, Creature } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawEgg, drawSideHint } from "./queen-egg.js";
import { drawMark, markGlow } from "./queen-weakpoint.js";

/** How much faster the outer body's wobble gets by her last petal. */
const OUTER_WOBBLE_BONUS = 1.5;
/** How hard the queen shudders per tile of her own size, at full shake. */
const SHAKE_TILES = 0.06;

/**
 * Her whole figure, in tiles from the centre of the tile she stands on. A
 * wide, low hull, and that is the shape the rest of this follows from:
 *
 * - the two marks hang out of the middle of her underside, one tile either
 *   side of her own column, with a one-tile gap between them where the hull
 *   simply carries on. The hull closes over the top and both sides of each
 *   so only its lower half is ever exposed;
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
  weakCy: 0.42,
  weakR: 0.4,
  /** Above the body, clear of both marks either side of it below. */
  petalCy: -1.0,
} as const;

/**
 * The queen: an armoured shell of the same rock her torches are made of, two
 * marks cradled in her underside where a shot actually lands, and a torch on
 * each wing tip — the very rock that drops, not a picture of one.
 *
 * Only one of the two marks is ever real (`boss.weakSide`). Player 1's
 * picture never says which — both go through the same call, in the same
 * colour, on the same clock — and the side shows only in the pulsing ring,
 * which is player 2's alone. `queen-weakpoint.ts` owns that split; this file
 * only places the two marks and lets the shell close over them.
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

  // The marks first, so the shell closes over both of them.
  const weakY = y + f.weakCy * tile;
  const markR = f.weakR * tile;
  for (const side of [-1, 1] as const) {
    const mx = tileCX(l, queen.col + side) + ox;
    drawMark(ctx, l, mx, weakY, markR, side, queen, boss, beat, beatPhase, time, healthShare);
    // The glow goes on last, over the shell that half-buries the mark, or
    // the colour it is asking for would be buried with it. Never on player
    // 2's screen while she is still armoured — see `markGlow`.
    const glow = markGlow(l, side, queen, boss, beat, beatPhase);
    if (glow) halo(ctx, mx, weakY, markR * 1.9, glow.hex, glow.alpha);
    // Which mark is real is player 2's half, and it is up from the moment
    // the bloom is chosen rather than only once it is announced: it is a
    // thing to say out loud, and saying it takes longer than a beat.
    if (boss.weakSide === side) drawSideHint(ctx, l, mx, weakY, markR, time);
  }
  drawShell(
    ctx,
    x,
    y + f.bodyCy * tile,
    f.bodyRx * tile,
    f.bodyRy * tile,
    queen.id,
    time,
    healthShare,
  );

  drawEgg(ctx, l, queen, boss, -1, ox, oy, beat, beatPhase, time, eggGrowShare);
  drawEgg(ctx, l, queen, boss, 1, ox, oy, beat, beatPhase, time, eggGrowShare);

  drawPetals(ctx, x, y + f.petalCy * tile, f.bodyRx * tile, queen.petals, boss.startPetals);
}

/**
 * The armoured shell — the same angular rock her torches are made of rather
 * than a living contour. Faceted and gradient-shaded like `drawTorchRock`,
 * so the material reads as one thing across her whole body and the rock she
 * drops. Drawn over both marks, closing over the top and sides of each.
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
