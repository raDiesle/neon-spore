import { type CairnState, type Creature, cairnWaited, type World } from "@neon-spore/sim";
import { cairnUnits } from "./cairn.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The one thing about THE CAIRN that is on a single screen.**
 *
 * The pile itself is drawn whole on both — a stack of rocks has nothing to
 * hide, and both players have to be able to talk about it. What one of them
 * cannot see is where the pile is about to let a rock go *by itself*: the
 * column is drawn on player 1's screen and on nothing player 2's shows.
 *
 * **The seat that can see it is the seat that cannot answer it.** Player 1
 * holds the cannon, and no bolt in this fight reaches anything; player 2 holds
 * the only dome and is shown nothing. So the tell is not an advantage handed
 * to one player, it is a sentence one of them has to say — a column, out loud,
 * across the voice delay — which is THE GHOST's ask arriving in a boss.
 *
 * It is the same shape as the clock it is counting: the stone that is going
 * grows brighter and shakes harder as the pile runs out of patience, and the
 * lane under it fills the same way. A pair who have learnt this creature never
 * see it full, because a pull resets it — which is the other half of what the
 * mark is teaching.
 */

/** Player 1's screen, and the rig's. Asked by the renderer before anything
 * here is drawn, `showsWisp`'s arrangement and its reason: a mark that leaked
 * onto the navigator's screen would answer the question the pair exists to
 * ask each other. */
export function showsCairnSettle(l: Layout): boolean {
  return l.role !== "p2";
}

/**
 * How far the pile's patience has run, 0 to 1, smoothed across the beat so the
 * mark grows rather than stepping — the count is the simulation's and this is
 * only how it is drawn.
 */
function pressure(world: World, boss: CairnState, beatPhase: number): number {
  const need = world.cfg.cairnShedBeats;
  if (need <= 0) return 1;
  return Math.min(1, Math.max(0, (cairnWaited(world, boss) + beatPhase) / need));
}

export function drawCairnSettle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  boss: CairnState,
  body: Creature,
  beatPhase: number,
  time: number,
): void {
  const t = pressure(world, boss, beatPhase);
  // The lane, all the way to the plating. A column said out loud is a number
  // read off the bottom of the field, so the mark has to reach the row the
  // number is written on rather than stopping under the pile.
  const x = tileCX(l, boss.settleCol + 0.5);
  const w = l.tile * 2;
  const top = tileCY(l, body.row);
  ctx.save();
  const grad = ctx.createLinearGradient(0, top, 0, l.hullY);
  grad.addColorStop(0, rgba(PALETTE.rock, 0.05 + 0.16 * t));
  grad.addColorStop(1, rgba(PALETTE.rock, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(x - w / 2, top, w, l.hullY - top);

  // And the stone itself, ringed. Which rock is going is nothing the
  // simulation says — what leaves the pile is the apex, because that is the
  // order a stack comes down in (`cairn.ts`) — so the ring stands on the unit
  // that is about to be the last one drawn, and shakes as the count runs out.
  const stack = cairnUnits(l, body, boss.units, time);
  const going = stack[stack.length - 1];
  if (going !== undefined) {
    const shake = l.tile * 0.05 * t * Math.sin(time * 22);
    ctx.strokeStyle = rgba(PALETTE.rock, 0.25 + 0.6 * t);
    ctx.lineWidth = Math.max(1, l.tile * 0.06);
    ctx.beginPath();
    ctx.arc(going.x + shake, going.y, going.r * 1.2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
