import { crystalPath, TORCH } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/** Beats behind the current phase each afterimage sits at. */
const TORCH_ECHO_STEP = 0.09;
/** How many afterimages trail the torch up the column. */
const TORCH_ECHOES = 5;

/**
 * The torch: three tiles wide, burning. The same crystal family as the rock
 * — `isMeteorKind` and `docs/spec/graphics.md`'s indestructibility fiction both
 * apply — but wider, with an amber-to-white core instead of the meteor's cold
 * stone, and afterimages up the column: it falls at the fastest rock's speed,
 * which already covers real distance every frame, so the trail reads as a
 * streak rather than a smear.
 */
export function drawTorch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beatPhase: number,
): void {
  const rx = l.tile * 1.3;
  const ry = l.tile * 0.55;
  const spin = (c.id % 13) * 0.37;

  for (let k = TORCH_ECHOES; k >= 1; k--) {
    const alpha = 0.12 * (1 - k / (TORCH_ECHOES + 1));
    if (alpha <= 0) continue;
    const echoPhase = Math.max(0, beatPhase - k * TORCH_ECHO_STEP);
    const ey = tileCY(l, c.fromRow + (c.row - c.fromRow) * echoPhase);
    const d = crystalPath(
      0,
      0,
      rx * 0.85,
      ry * 0.85,
      TORCH.sides,
      TORCH.depth,
      TORCH.wobble,
      time * 0.15,
      TORCH.seed,
    );
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, ey);
    ctx.fillStyle = PALETTE.ember;
    ctx.fill(new Path2D(d));
    ctx.restore();
  }

  const d = crystalPath(
    0,
    0,
    rx,
    ry,
    TORCH.sides,
    TORCH.depth,
    TORCH.wobble,
    time * 0.15,
    TORCH.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin + time * 0.1);

  const core = Math.max(1, Math.max(rx, ry));
  const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, core);
  rg.addColorStop(0, "#fff4d6");
  rg.addColorStop(0.45, PALETTE.ember);
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(path);
  ctx.restore();

  // Leading edge: the direction it is falling, so the eye reads which way
  // three tiles of rock are about to arrive, not only that something is there.
  halo(ctx, x, y + ry * 0.7, Math.max(1, ry * 1.3), PALETTE.ember, 0.22);
  halo(ctx, x, y, Math.max(1, core * 1.5), PALETTE.rock, 0.1);
}
