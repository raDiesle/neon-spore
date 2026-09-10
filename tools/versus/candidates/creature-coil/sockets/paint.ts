import type { StudDraw } from "../../../../../packages/render/src/coil-look.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";

/**
 * SOCKETS — the studs are cups sunk into the shell, and the charge fills
 * them.
 *
 * **The studs.** Three sockets on the rim where the shipped discs sit, each
 * a dark cup with a lit wall — and the lit wall is the one *away* from the
 * key, on the lower right, because a hole is lit on the side a ball is dark
 * on and that inversion is the whole of what says *into* rather than *onto*
 * (`.claude/skills/depth`, and `creature:carom` / `pits` on a rock). A dot
 * beside a circle is a mark; a cup in it is a place, and a place is what a
 * charge can leave from and land in. Empty, the cups are quiet — darker than
 * the rim, not brighter — so an idle dome is one shell with three dents.
 * While a charge is on its way each cup fills with hot light from the
 * bottom up, and the halo comes on as it brims, so the dome reads as being
 * *filled* by what is coming rather than lit by it.
 *
 * The bolt is the shipped one; this answer is about where it lands.
 *
 * **How it can lose.** *A dark cup on a bright rim is a gap in the rim.* If
 * at 26 px the three sockets read as three bites out of the dome — a shell
 * with holes in it, which is what a *failing* dome looks like — the idle
 * picture is saying the wrong thing at the moment it most needs to say
 * nothing. Judge it uncharged.
 */

const SOCKETS = 3;
/** A socket's radius as a share of a tile, and how much the charge swells it. */
const CUP = 0.075;
const SWELL = 0.04;
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";
/** The lit wall: how far in from the cup's edge, and how far it is offset
 * away from the key — down and to the right. */
const WALL = 0.7;
const WALL_OFF = 0.28;

export function sockets(d: StudDraw): void {
  const { ctx, x, y, r, tile, spin, charge, rim, hot } = d;
  const size = tile * (CUP + SWELL * charge);
  const floor = mixHex(rim, SHADOW, 0.8);
  ctx.save();
  for (let k = 0; k < SOCKETS; k++) {
    const a = spin + (k * Math.PI * 2) / SOCKETS;
    const sx = x + Math.cos(a) * r;
    const sy = y + Math.sin(a) * r;
    // The cup: a dark disc, clipped so the wall stays inside it.
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = floor;
    ctx.fillRect(sx - size, sy - size, size * 2, size * 2);
    // The lit wall, away from the key: the ring of the cup's own colour
    // pushed down and right, so a crescent of it shows along the far wall.
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(sx + size * WALL_OFF, sy + size * WALL_OFF, size, 0, Math.PI * 2);
    ctx.arc(
      sx + size * WALL_OFF * 0.5,
      sy + size * WALL_OFF * 0.5,
      size * WALL,
      0,
      Math.PI * 2,
      true,
    );
    ctx.fill();
    // The charge filling it, from the bottom of the cup up.
    if (charge > 0) {
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = hot;
      const top = sy + size - size * 2 * charge;
      ctx.fillRect(sx - size, top, size * 2, size * 2);
    }
    ctx.restore();
    // The lip: a thin bright edge on the key side, so the cup has a rim of
    // its own catching the light.
    ctx.strokeStyle = rgba(rim, 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sx, sy, size, Math.PI * 0.85, Math.PI * 1.65);
    ctx.stroke();
    if (charge > 0) halo(ctx, sx, sy, size * 3.2, hot, 0.5 * charge);
  }
  ctx.restore();
}
