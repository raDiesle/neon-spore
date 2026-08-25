import { BULB, blobPath } from "@neon-spore/content";
import type { BossState, Creature } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The queen is the only creature whose picture depends on `world.boss` and not
 * on the creature alone. She is drawn from the `BULB` silhouette, the same
 * contour a bulb uses, but larger and with her own states.
 */
export function drawQueen(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  queen: Creature,
  boss: BossState,
  beat: number,
  time: number,
): void {
  const shape = BULB;
  const r = l.tile * 1.3;
  const scale = r / Math.max(shape.rx, shape.ry);
  const x = tileCX(l, queen.col);
  const y = tileCY(l, queen.row);

  // Variation without randomness: the id is deterministic on both devices.
  const phase = (queen.id % 7) * 0.9;
  const t = time + phase;

  // Breath: slow and deep normally, faster while announced.
  const isAnnounced = queen.color == null && boss.tellColor != null && beat < boss.openBeat;
  const breathSpeed = isAnnounced ? 4.5 : 1.5;
  const pump = Math.sin(t * breathSpeed);
  const sx = 1 + pump * 0.15;
  const sy = 1 - pump * 0.15;

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
  ctx.scale(scale * sx, scale * sy);

  let fill: string;
  let rim: string = PALETTE.rock;
  let hex: string | null = null;
  let alpha = 1;

  if (queen.color != null) {
    // Open: full colour.
    fill = queen.color === "red" ? PALETTE.redDark : PALETTE.cyanDark;
    hex = queen.color === "red" ? PALETTE.red : PALETTE.cyan;
  } else if (isAnnounced) {
    // Announced: dark fill, rim in the promised colour at low alpha.
    fill = PALETTE.rockDark;
    rim = boss.tellColor === "red" ? PALETTE.redRim : PALETTE.cyanRim;
    alpha = 0.3;
  } else {
    // Closed: no colour anywhere.
    fill = PALETTE.rockDark;
    rim = PALETTE.rock;
  }

  ctx.fillStyle = fill;
  ctx.fill(path);

  if (hex != null) {
    strokeGlow(ctx, path, hex, Math.max(1, r * 0.1) / scale, 1);
  } else {
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1, r * 0.1) / scale;
    ctx.globalAlpha = alpha;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (hex != null) {
    halo(ctx, x, y, r * 1.9, hex, 0.16);
  }

  // Petals: the health bar, on her body so both screens see the same count.
  if (queen.petals > 0) {
    ctx.fillStyle = PALETTE.hullRim;
    const petalR = r * 0.08;
    const span = r * 1.2;
    const py = -r * 0.8;
    for (let i = 0; i < queen.petals; i++) {
      const px = queen.petals === 1 ? 0 : -span / 2 + (span / (queen.petals - 1)) * i;
      ctx.beginPath();
      ctx.arc(x + px, y + py, petalR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
