import type { World } from "@neon-spore/sim";
import { coilStack, drawCoils, drawTail } from "./choke-coil.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * **Player 1's cannon strip while THE CHOKE has the cannon.** Drawn over the
 * strip the band has just drawn, on the seat whose strip it is, when the
 * wave's fault is the steer fault (`content/control-fault.ts` says so, the
 * way it says which lobes THE JAM and THE COIL kill); the navigator's band
 * has no cannon strip to kill.
 *
 * Two things:
 *
 * 1. **The rail is dead.** The whole channel goes down to the seat's dead
 *    flesh, the two colours a lobe wears when a fault has it
 *    (`malfunction-look.ts`), so the pilot reads the state in the game's own
 *    word for it before reading anything else; the node keeps its light,
 *    because it is where the cannon is — the one thing this seat can still
 *    read off the strip and say out loud.
 * 2. **The same body, on the node.** The loops off the field are wound round
 *    the strip's node, tight, with the strand's loose end off them — so the
 *    grip is one picture on both screens. The fault's beam lands here too
 *    (`fault-beam-ends.ts`).
 *
 * Nothing beckons: there is nothing to press. That was THE CHOKE as a body —
 * a strip tapped clear — and it is on the NOT BUILT YET page now.
 *
 * Everything on the ship is the seat's own skin (`skin.dead`); everything
 * that is the choke is `bile`, never the seat's colour.
 */
export function drawChokeStrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
  skin: SeatSkin,
): void {
  const s = l.cannonStrip;
  const h = s.height;
  const y = s.y;
  const kx = tileCX(l, world.cannonCol);
  // 1. The channel, dead, except under the node.
  ctx.save();
  const left = l.gridLeft - l.tile * 0.5;
  const span = l.gridWidth + l.tile;
  const g = ctx.createLinearGradient(left, 0, left + span, 0);
  const dead = rgba(skin.dead[1], 0.8);
  const live = rgba(skin.dead[1], 0);
  const u = (kx - left) / span;
  g.addColorStop(0, dead);
  g.addColorStop(Math.max(0, u - 0.08), dead);
  g.addColorStop(u, live);
  g.addColorStop(Math.min(1, u + 0.08), dead);
  g.addColorStop(1, dead);
  ctx.fillStyle = g;
  ctx.fillRect(left, y - h * 0.75, span, h * 1.5);
  ctx.restore();
  // 2. The loops round the node, and the loose end off them.
  const nr = h * 0.5;
  const profile = (v: number): number => nr * Math.sqrt(Math.max(0.08, 1 - (2 * v - 1) ** 2));
  drawCoils(ctx, coilStack(kx, y - nr, y + nr, profile, h * 0.08, 0), h * 0.12);
  const len = h * 0.4;
  drawTail(
    ctx,
    { x: kx, y: y - nr },
    { x: kx + nr + len, y: y - nr - len * 0.4 },
    { x: kx + nr * 0.6, y: y - nr - len * 0.9 },
    h * 0.1,
    time,
    0,
  );
}
