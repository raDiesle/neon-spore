import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * NUCLEUS — one heavy thing loose in a shell.
 *
 * Where CHAMBERS multiplies the interior, this reduces it to one object and
 * gives that object a *position*: a single dense core, off centre, orbiting
 * slowly inside the body, with a short dark trail on the wall behind it. The
 * bulb stops being a decorated disc and becomes a shell with something in it —
 * and because the core passes behind the middle and comes back, the body reads
 * as hollow rather than as flat.
 *
 * **The core is the only thing in the game's interior that occludes.** It is
 * drawn over the wall mark when it is near and behind it when it is far, which
 * is a one-line consequence of `facet`'s `near` and is the cheapest depth cue
 * there is.
 *
 * **The roll is rotated out**, so the light stays where it is
 * (`.claude/skills/depth`).
 */

const REACH = 0.46;
const SPIN = 0.5;
const CORE = 0.34;
const DIM = 0.3;
/** How far the wall mark sits behind the core, in radians of its own orbit. */
const LAG = 0.5;

const CORE_PIN: Pin = pin(0, 0.18, 1);
const WALL_PIN: Pin = pin(-LAG, 0.18, 1);

export function nucleus(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = Math.min(p.rx, p.ry) * REACH;
  const core = facet(CORE_PIN, theta);
  const wall = facet(WALL_PIN, theta);

  ctx.save();
  ctx.rotate(-p.rot);

  // The mark the core has left on the inside of the shell, drawn first so a
  // near core covers it and a far one does not.
  if (wall.near) {
    ctx.save();
    ctx.translate(wall.x * reach, wall.y * reach);
    ctx.scale(Math.max(0.1, wall.sx), 1);
    ctx.fillStyle = mixHex(p.hex, p.rim, surfaceDim(DIM, wall.lit) * 0.45);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, reach * CORE * 0.7), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (core.near) {
    ctx.save();
    ctx.translate(core.x * reach, core.y * reach);
    ctx.scale(Math.max(0.1, core.sx), 1);
    ctx.fillStyle = mixHex(p.hex, p.rim, surfaceDim(DIM, core.lit));
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, reach * CORE), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
