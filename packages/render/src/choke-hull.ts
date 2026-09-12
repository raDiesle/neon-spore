import { CANNON_LOBE } from "@neon-spore/content";
import { steered, steerHeading, type World } from "@neon-spore/sim";
import { coilStack, drawCoils, drawTail } from "./choke-coil.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsCannon } from "./view-role.js";

/**
 * **THE CHOKE on the cannon**, over the finished hull: the grip the steer
 * fault has on the swelling, drawn for as long as the wave has the fault —
 * which is the whole wave (`sim/malfunction.ts`).
 *
 * THE CHOKE was a body once: a strand that fell, crawled to the cannon and
 * was tapped off. The owner made it the third fault on 12 September 2026 —
 * the same thing that hangs at the top of the field for THE JAM and THE
 * COIL, its beam on the cannon strip (`fault-beam-ends.ts`) — so nothing
 * falls, nothing crawls and nothing comes off. What stays is the shipped
 * picture of the grip itself: a stack of loops round the swelling the hull
 * grows under the cannon (`choke-coil.ts`), tight for the whole wave, with
 * the strand's loose end over the shoulder, in the palette's `bile` — a
 * yellow that is nobody's ammunition and no seat's hull, so it reads the
 * same on the violet ship and the amber one.
 *
 * **What the picture has to say**, in order:
 * 1. it has the cannon: the loops are on the swelling and go where it goes;
 * 2. where the cannon will be on the next beat: a light along the hull from
 *    the swelling toward the column it steps to — a streak rather than an
 *    arrow — **on the pilot's screen only** (`showsCannon`). Both seats see
 *    the cannon on the hull; only the pilot, who has nothing left to press,
 *    sees which way it goes next, and calling that column ahead is the
 *    whole of what the wave asks of them.
 *
 * `cannonX` is the eased cannon the ship pass drew, not the world's column,
 * so the loops ride the swelling through its glide rather than jumping a
 * beat ahead of it; `surfaceY` is the membrane the swelling is a lobe of.
 */

/** The loops' thickness and their vertical squash, in tiles. */
const COIL_W = 0.09;
const COIL_RY = 0.09;
/** How far down the hull's shoulder the lowest loop sits, in tiles: a grip
 * round a throat goes round the shoulders too. */
const GRIP_DOWN = 0.38;
/** How far the light toward the next column reaches, in tiles. */
const STREAK = 1.2;

export function drawChokeCoils(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cannonX: number,
  surfaceY: SurfaceY,
  time: number,
): void {
  if (!steered(world)) return;
  const tile = l.tile;
  const half = CANNON_LOBE.halfTiles * tile;
  const top = surfaceY(cannonX) + tile * 0.08;
  const base = Math.max(surfaceY(cannonX - half), surfaceY(cannonX + half)) + tile * GRIP_DOWN;
  const dir = steerHeading(world);
  const mid = (top + base) / 2;
  // The light toward the column the cannon steps to on the beat: the pilot's.
  if (showsCannon(l.role)) streak(ctx, cannonX, mid, tile, dir * STREAK * tile);
  halo(ctx, cannonX, mid, tile * 1.3, PALETTE.bile, 0.35 + 0.15 * Math.sin(time * 6));
  // What the loops are wound round, by height: the hull's shoulder at the
  // foot, the swelling's neck at the crown. Share nought: nothing unwinds it.
  const profile = (u: number): number => half * (1.05 - 0.6 * u);
  drawCoils(ctx, coilStack(cannonX, top, base, profile, tile * COIL_RY, 0), tile * COIL_W);
  // The loose end: off the top loop, over the shoulder and down the hull's
  // face against the way the cannon walks, its hooks shut.
  const len = tile * 0.5;
  const crown = { x: cannonX - dir * half * 0.4, y: top };
  const end = { x: cannonX - dir * (half + len * 0.5), y: base + len };
  const belly = { x: cannonX - dir * (half * 1.4 + len * 0.3), y: top + len * 0.25 };
  drawTail(ctx, crown, end, belly, tile * COIL_W * 1.3, time, 0);
}

/** The light along the hull toward the column the cannon goes to next. */
function streak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  dx: number,
): void {
  const g = ctx.createLinearGradient(x, 0, x + dx, 0);
  g.addColorStop(0, rgba(PALETTE.bile, 0.5));
  g.addColorStop(1, rgba(PALETTE.bile, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  const h = tile * 0.3;
  ctx.fillRect(Math.min(x, x + dx), y - h / 2, Math.abs(dx), h);
  ctx.restore();
}
