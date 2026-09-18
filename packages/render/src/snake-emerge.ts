import { MAW } from "@neon-spore/content";
import type { SnakeState } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type HullFrame, surface } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { muzzleCenterY } from "./muzzle.js";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";

/**
 * The body coming out of the ship.
 *
 * The round used to open with the hull folding itself into the body — a
 * squeeze and a carry, drawn by scaling the whole ship down to a tile. The
 * owner asked for the ship to stay, and for the body to come *out of it*
 * instead, out of the cannon's own slot, like a worm pushing out of a cocoon
 * (18 September 2026). So the opening is now three things, all of them read
 * off one number (`emerge01`, `snake-clock.ts`):
 *
 * - **The mouth opens.** `mood.intake` on the hull's own frame turns the
 *   cannon lobe into a throat (`hull-frame.ts`, `MAW`) — the same opening a
 *   pod is swallowed through, and the same one THE SCOUT's ship flies home
 *   into. It opens first, stands open while the body comes, and closes
 *   behind the tail.
 * - **The body rises out of it.** The whole body is drawn on its resting
 *   tiles, translated down by the depth of the throat and back up as the
 *   emergence runs, *after* the hull and clipped to the sky above its skin
 *   (`clipAboveHull`), so whatever is still below the surface is under the
 *   ship and whatever has climbed past the mouth's own line shows in the
 *   throat's dip. It comes in pushes rather than one glide — a
 *   short surge, a settle, another surge — and sways a little across the
 *   slot as it pushes, which is what a soft thing forcing itself through a
 *   hole does.
 * - **Slime holds on to it.** Two threads from the throat's rim to the
 *   body's flanks, thinning and fading as the body clears them.
 *
 * Nothing here is stored: the number in is the phase, the tile is the
 * arena's, and the throat's depth is the same constant the hull is drawn from.
 */

/** When the body starts to rise, and when it is fully out, in emergence. */
const RISE_FROM = 0.12;
const RISE_TO = 0.84;

/** Pushes in one emergence, and how far each one carries beyond the glide. */
const PUSHES = 3;
const PUSH = 0.05;

/** How far across the slot the body sways at its widest, in arena tiles. */
const SWAY_TILES = 0.1;

/** How far the mouth is standing open, 0 to 1: opens over the first fifth,
 * holds, shuts over the last fifth — after the tail is clear. */
export function emergeIntake(t: number): number {
  if (t < 0.18) return smoothstep(t / 0.18);
  if (t < 0.84) return 1;
  return 1 - smoothstep((t - 0.84) / 0.16);
}

/** How far the body has come out, 0 in the throat to 1 on its tiles. */
function rise01(t: number): number {
  const u = Math.max(0, Math.min(1, (t - RISE_FROM) / (RISE_TO - RISE_FROM)));
  const glide = smoothstep(u);
  // The pushes: a sine over the rise, one lobe per push, damped out as the
  // body arrives so it settles rather than overshoots its tiles.
  const push = Math.sin(u * Math.PI * PUSHES) * PUSH * (1 - u);
  return Math.max(0, Math.min(1, glide + push));
}

/**
 * Where the body is drawn from, this frame: the offset to translate its
 * resting picture by, and how far along it is. `depth` is the drop that puts
 * the whole of it under the surface at 0 — the head's own distance to the
 * arena's floor plus the throat below it.
 */
export function emergeOffset(
  l: Layout,
  arena: Arena,
  round: SnakeState,
  t: number,
): { dx: number; dy: number; rise: number } {
  const head = round.body[0];
  if (!head) return { dx: 0, dy: 0, rise: 1 };
  const headY = arenaY(arena, head.row) + arena.tile / 2;
  const floor = arena.y + arena.rows * arena.tile;
  const throat = l.tile * -MAW.scale * 0.5;
  const depth = floor - headY + arena.tile * 0.5 + throat;
  const rise = rise01(t);
  const sway = Math.sin(rise * Math.PI * 4) * arena.tile * SWAY_TILES * (1 - rise);
  return { dx: sway, dy: depth * (1 - rise), rise };
}

/**
 * Everything above the ship's skin, and nothing below the mouth's own line:
 * the region the body is drawn into.
 *
 * The hull is one opaque skirt from its membrane down (`hull.ts`), and its
 * throat is a dip *in* that membrane rather than a hole through it — so a body
 * drawn before the ship is under the skirt, and a body drawn after it would
 * stand on the ship's paint. The clip is the membrane itself, sampled the way
 * the hull samples it, closed to the top of the canvas; and cut again at the
 * mouth's centre line, so the head comes up *out of* the dark opening the
 * mouth draws there rather than over it. Off the throat the membrane is above
 * that line everywhere, so the second cut costs nothing.
 */
export function clipAboveHull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: HullFrame,
  intake: number,
): void {
  const from = l.gridLeft - 0.12 * l.gridWidth;
  const to = l.gridLeft + 1.12 * l.gridWidth;
  const steps = 140;
  ctx.beginPath();
  ctx.moveTo(from, 0);
  for (let i = 0; i <= steps; i++) {
    const p = surface(f, from + (to - from) * (i / steps));
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(to, 0);
  ctx.closePath();
  ctx.clip();
  const tip = surface(f, f.cannonX);
  ctx.beginPath();
  ctx.rect(0, 0, l.width, muzzleCenterY(l, tip.y, intake));
  ctx.clip();
}

/**
 * The threads of slime from the throat's rim to the body, drawn after the
 * hull so they lie over its lip. They stretch as the body rises and are gone
 * by the time it is out.
 */
export function drawEmergeSlime(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  arena: Arena,
  round: SnakeState,
  at: { dx: number; dy: number; rise: number },
): void {
  const head = round.body[0];
  if (!head || at.rise <= 0.02 || at.rise >= 0.98) return;
  const cx = arenaX(arena, head.col) + arena.tile / 2;
  const lip = l.hullY;
  const half = l.tile * 0.62 * MAW.halfMul * 0.8;
  // The body's flank at the surface: a hand's width either side of the spine.
  const flank = arena.tile * 0.3;
  const reach = arena.tile * (0.4 + at.rise * 1.4);
  ctx.save();
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.7 * (1 - at.rise);
  for (const side of [-1, 1]) {
    const fromX = cx + side * half;
    const toX = cx + at.dx + side * flank;
    const toY = lip - reach;
    ctx.lineWidth = Math.max(1, arena.tile * 0.09 * (1 - at.rise));
    ctx.beginPath();
    ctx.moveTo(fromX, lip);
    ctx.quadraticCurveTo(fromX + side * flank * 0.4, lip - reach * 0.55, toX, toY);
    ctx.stroke();
    // A bead at the lip where the thread is thickest.
    ctx.beginPath();
    ctx.arc(fromX, lip, arena.tile * 0.07 * (1 - at.rise) + 0.5, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.hullRim;
    ctx.fill();
  }
  ctx.restore();
}
