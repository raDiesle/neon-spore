import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * SPORES — the body is full, and it is a spore case.
 *
 * The creature is called a bulb and the game is called Neon Spore, and the body
 * has never once looked like it was carrying anything. This fills it: eleven
 * small spheres packed through the whole volume rather than laid on a shell, so
 * the near ones are large and bright and the far ones are small and dim, and
 * the packing turns.
 *
 * **Depth comes from the radius, not from a squash.** Each spore is pinned at
 * its own *reach* as well as its own longitude and latitude — the packing is
 * three deep — and a spore's drawn size is that reach times its facet's own
 * foreshortening. That is what stops it reading as a flat scatter of dots.
 *
 * **The roll is rotated out** so the light does not turn with the body
 * (`.claude/skills/depth`).
 */

const SPORES = 11;
const SPORE = 0.2;
const REACH = 0.62;
const SPIN = 0.42;
const DIM = 0.24;

/** Longitude, latitude and how far out — three shells rather than one. */
const PINS: { pin: Pin; depth: number }[] = [];
for (let i = 0; i < SPORES; i++) {
  const depth = 0.45 + ((i * 7) % 3) * 0.27;
  PINS.push({ pin: pin(i * 2.39, ((i / (SPORES - 1)) * 2 - 1) * 0.8, depth), depth });
}

export function spores(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = Math.min(p.rx, p.ry) * REACH;

  ctx.save();
  ctx.rotate(-p.rot);
  for (const q of PINS) {
    const f = facet(q.pin, theta);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * reach, f.y * reach);
    ctx.scale(Math.max(0.12, f.sx), 1);
    // Deeper in the packing is smaller and dimmer, which is the whole of why
    // this is a volume and not a scatter.
    ctx.fillStyle = mixHex(p.hex, p.rim, surfaceDim(DIM, f.lit) * q.depth);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, reach * SPORE * q.depth * Math.max(0.3, f.sy)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
