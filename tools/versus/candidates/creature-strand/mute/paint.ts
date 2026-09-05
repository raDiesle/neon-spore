import {
  BULB,
  blobPath,
  type CreatureSilhouette,
  SLICK,
} from "../../../../../packages/content/src/index.js";
import { contourClock } from "../../../../../packages/render/src/creature-place.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { slabs } from "../../../../../packages/render/src/ghost-glitch.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { Bead } from "../../../../../packages/render/src/strand-bead.js";

/**
 * MUTE — the reel THE STRAND shipped for an afternoon: three times as fast, and
 * in one violet that is neither ammunition colour.
 *
 * Every number here is the shipped reel's own from before the colour went in,
 * kept whole rather than described. It has its own clock on purpose: the game's
 * `reelAt` is the slow, coloured one now, and a candidate that borrowed it
 * would be arguing with itself.
 */

/** The whole of what makes it MUTE: six swaps a second instead of 2.2, and one
 * colour for both faces. */
const REEL_HZ = 6;
const MUTE = PALETTE.wisp;
const MUTE_RIM = PALETTE.wispRim;

const MUL = 0.86;
const JUMP = 0.05;
const BAR_HEIGHT = 0.22;
const BAR_SECONDS = 1.7;
const TEAR = 0.5;
const FACES: readonly CreatureSilhouette[] = [SLICK, BULB];

export function mute(b: Bead): void {
  const { ctx, l, cfg, c, x, time, near } = b;
  const haze = (h: string): string => hazed(cfg, h, near);
  const r = l.tile * 0.4 * MUL;
  const t = time * REEL_HZ + c.id * 0.37;
  const face = Math.floor(t);
  const shape = FACES[face % FACES.length]!;
  const flat = Math.abs(Math.cos(Math.PI * t));
  const y = b.y + ((face % 3) - 1) * JUMP * l.tile;
  const ky = 0.12 + 0.88 * flat;
  const rx = (r * shape.rx) / Math.max(shape.rx, shape.ry);
  const ry = (r * shape.ry * ky) / Math.max(shape.rx, shape.ry);
  const body = new Path2D(
    blobPath(
      x,
      y,
      rx,
      ry,
      shape.lobes,
      shape.depth,
      shape.wobble,
      contourClock(c.id, time),
      shape.seed,
    ),
  );
  ctx.fillStyle = haze(PALETTE.background);
  ctx.fill(body);
  strokeGlow(ctx, body, haze(MUTE), STROKE.outline);
  ctx.save();
  ctx.clip(body);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = haze(MUTE_RIM);
  for (const s of slabs(c.id, time, TEAR)) {
    ctx.globalAlpha = 0.08 + Math.abs(s.shift) * 0.42;
    ctx.fillRect(x - rx + s.shift * rx, y + s.top * ry, rx * 2, s.height * ry * 0.6);
  }
  const at = ((time / BAR_SECONDS + c.id * 0.19) % 1) * (2 + BAR_HEIGHT * 2) - 1 - BAR_HEIGHT;
  ctx.globalAlpha = 0.22;
  ctx.fillRect(x - rx, y + at * ry, rx * 2, BAR_HEIGHT * ry);
  ctx.restore();
  halo(ctx, x, y, r * 1.8, haze(MUTE_RIM), 0.1 + 0.18 * (1 - flat));
}
