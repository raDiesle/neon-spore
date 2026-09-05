import { blobPath } from "../../../../../packages/content/src/shapes.js";
import { contourClock } from "../../../../../packages/render/src/creature-place.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { Bead } from "../../../../../packages/render/src/strand-bead.js";

/**
 * SEALED — the bead THE STRAND shipped for a day, kept so the pair can hold it
 * against the reel that replaced it.
 *
 * A smooth ovoid with a wet socket set high in it, drawn in the palette's
 * violet: a shape belonging to neither the slick nor the bulb, which is how it
 * says nothing about which of them is inside. Six shallow lobes — free on a
 * roster where the slick has two, the dart three, the wisp five and the throb
 * six-and-round — and almost no wobble, because a container should not read as
 * something alive.
 */

/** Its footprint, its lobe count and its seed: the whole of the shape. */
const MUL = 0.86;
const LOBES = 6;
const SEED = 4.5;
const SOCKET_SEED = 9;

export function sealed(b: Bead): void {
  const { ctx, l, cfg, c, x, y, time, near } = b;
  const haze = (h: string): string => hazed(cfg, h, near);
  const r = l.tile * 0.4 * MUL;
  const t = contourClock(c.id, time);
  const shell = new Path2D(blobPath(x, y, r * 0.9, r, LOBES, 0.09, 0.03, t, SEED));
  ctx.fillStyle = haze(PALETTE.background);
  ctx.fill(shell);
  strokeGlow(ctx, shell, haze(PALETTE.wisp), STROKE.outline);
  // The socket: a smaller loop set high in the shell, the same wet opening the
  // ship's own controls carry. It is what makes a bead read as a thing that
  // could open rather than as a pebble — and it is drawn in the rim colour so
  // the one bright thing on it is plainly not a body's colour.
  const socket = new Path2D(
    blobPath(x, y - r * 0.18, r * 0.42, r * 0.34, LOBES, 0.14, 0.05, t, SOCKET_SEED),
  );
  ctx.fillStyle = haze(PALETTE.background);
  ctx.fill(socket);
  strokeGlow(ctx, socket, haze(PALETTE.wispRim), STROKE.inner);
}
