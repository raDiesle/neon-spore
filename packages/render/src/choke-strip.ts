import { chokeIsHeld, chokeTapsSoFar, stuckChoke, type World } from "@neon-spore/sim";
import { COILS, coilStack, drawCoils, drawTail } from "./choke-coil.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * **Player 1's cannon strip while THE CHOKE has the cannon.** Drawn over the
 * strip the band has just drawn, and only on the seat whose strip it is: the
 * navigator's band has no cannon strip to kill.
 *
 * Three things, and they answer the owner's brief in order — *it should be
 * visually clear what the state is, and that clicking repeats*:
 *
 * 1. **The rail is dead.** The whole channel goes down to the seat's dead
 *    flesh, the two colours a lobe wears when a fault has it
 *    (`malfunction-look.ts`), so the pilot reads the state in the game's own
 *    word for it before reading anything else; and the node — the one place
 *    on the strip that is still a control — keeps its light, because it is
 *    the one place to press.
 * 2. **The same body, on the node.** The loops off the field are wound round
 *    the strip's node, tight or unwinding by the same share, with the same
 *    loose end growing off them — so how many are left is one picture on
 *    both screens and the pilot can say the number out loud.
 * 3. **Tap, and again.** A ring runs out of the node and fades, over and
 *    over on a short clock, the way a thing that wants pressing repeatedly
 *    beckons; the ring the last tap made is the same ring (`chokeTap`'s
 *    burst). While the thumb is *down* the rings stop and a light climbs off
 *    the node instead — the one thing a held thumb has to do next is lift —
 *    and a count arc round the node fills by the share, for the eye that
 *    wants a gauge rather than loops.
 *
 * Everything on the ship is the seat's own skin (`skin.dead`, `skin.rim`);
 * everything that is the choke is `bile`, never the seat's colour.
 */

/** The beckoning ring's period, in seconds — the pace a fast thumb taps at. */
const BECKON = 0.42;

export function drawChokeStrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
  skin: SeatSkin,
): void {
  const c = stuckChoke(world.creatures);
  if (c === undefined) return;
  const s = l.cannonStrip;
  const h = s.height;
  const y = s.y;
  const kx = tileCX(l, world.cannonCol);
  const share = chokeTapsSoFar(c) / Math.max(1, world.cfg.chokeTaps);
  const held = chokeIsHeld(c);
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
  // 3a. The count arc round the node: filled by the share, its rest faint.
  const r = h * 0.8;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.5, h * 0.1);
  ctx.strokeStyle = rgba(PALETTE.bileDeep, 0.5);
  ctx.beginPath();
  ctx.arc(kx, y, r, 0, Math.PI * 2);
  ctx.stroke();
  if (share > 0) {
    ctx.strokeStyle = PALETTE.bile;
    ctx.beginPath();
    ctx.arc(kx, y, r, -Math.PI / 2, -Math.PI / 2 + share * Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  // 2. The loops round the node, and the loose end off them.
  const nr = h * 0.5;
  const profile = (v: number): number => nr * Math.sqrt(Math.max(0.08, 1 - (2 * v - 1) ** 2));
  drawCoils(ctx, coilStack(kx, y - nr, y + nr, profile, h * 0.08, share), h * 0.12);
  const loose = Math.floor(share * COILS);
  const len = h * (0.4 + loose * 0.2);
  drawTail(
    ctx,
    { x: kx, y: y - nr },
    { x: kx + nr + len, y: y - nr - len * 0.4 },
    { x: kx + nr * 0.6, y: y - nr - len * 0.9 },
    h * 0.1,
    time,
    share,
  );
  // 3b. Tap and again, or lift.
  if (held) {
    const p = (time % BECKON) / BECKON;
    halo(ctx, kx, y - h * (0.4 + p * 1.2), h * 0.6, skin.rim, 0.5 * (1 - p));
    return;
  }
  ctx.save();
  ctx.lineWidth = Math.max(1, h * 0.06);
  for (const back of [0, 0.5]) {
    const p = ((time / BECKON + back) % 1) as number;
    ctx.strokeStyle = rgba(PALETTE.bileRim, 0.7 * (1 - p));
    ctx.beginPath();
    ctx.arc(kx, y, h * (0.55 + p * 1.1), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  // A pressing light dropping onto the node on the same clock: the gesture,
  // shown, in the seat's own light.
  const p = (time % BECKON) / BECKON;
  const drop = Math.sin(p * Math.PI);
  halo(ctx, kx, y - h * 0.9 * (1 - drop), h * 0.5, skin.rim, 0.25 + 0.4 * drop);
}
