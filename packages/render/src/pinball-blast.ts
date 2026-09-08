import type { PinballState } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { pinAt, type Table } from "./pinball-table.js";
import type { ViewState } from "./renderer.js";

/**
 * PINBALL's two loud moments: a ball that hit the ship, and a target taken.
 *
 * Both are the owner's, in his own words — *when ball hit bottom game/ship,
 * there must be explosion like a missile hit the ship bottom*, and *when a
 * yellow stone collected, there must be some very big visual indication, that
 * correct one was collected.* The round had neither: a dropped ball simply
 * stopped being drawn and the bucket went red for a beat, and a target went out
 * silently with forty other pieces at the end of a shot. Both of those are the
 * whole content of the round happening off-screen.
 *
 * **Nothing here is held between frames.** Every value is read off the world —
 * `dropBeat` and `dropXMilli` for the blast, `hitTick` for the take — so both
 * survive a restart and neither has anything for `Effects.reset` to lose
 * (`render-state.ts`). That is also why the drop is timed in beats and the take
 * in ticks: a beat is the unit the hull was charged in, and a take is a thing
 * the eye has to be told about inside a fifth of a second.
 *
 * **The blast is in the ball's own colour and it is drawn where the ball
 * landed.** Not a damage red in the middle of the ship: an impact carries the
 * colour of what made it, and damage is drawn on the part that took it. The
 * ship conducting afterwards is `drawHullShock`, called rather than copied —
 * the same arcs THE FENCE puts over the hull, at a strength this file decides.
 */

/** Beats a blast burns for. Just over one, so the picture is still going when
 * the next shot is offered and gone before it is fired. */
const BLAST_BEATS = 1.4;

/** Ticks a take's light lasts. About a third of a second at 120 Hz: long
 * enough to be unmissable, short enough not to hide the board under it. */
const TAKE_TICKS = 40;

/** Shards thrown out of an impact, and how far one travels in tiles. */
const SHARDS = 14;
const SHARD_TILES = 2.6;

/** How far a take's ring runs, in tiles, and how many spikes it throws. */
const RING_TILES = 5.5;
const SPIKES = 12;

/** How far through a blast the picture is: 1 at the moment of it, 0 when it
 * is over, and 0 when there has not been one. */
export function pinBlast01(view: ViewState, boss: PinballState): number {
  if (boss.dropBeat < 0) return 0;
  const since = view.world.beat - boss.dropBeat + view.beatPhase;
  return Math.max(0, 1 - since / BLAST_BEATS);
}

/** The same for a target taken, off the tick rather than the beat. */
export function pinTake01(view: ViewState, boss: PinballState): number {
  if (boss.hitTick < 0) return 0;
  return Math.max(0, 1 - (view.world.tick - boss.hitTick) / TAKE_TICKS);
}

/**
 * A ball that came down on the ship: the flash, the ring, the shards it threw
 * and the charge still running through the hull.
 *
 * Drawn over the finished hull rather than under it, because it is *on* the
 * ship — the crater the breach left is already in `world.scars` and is drawn
 * by the hull itself, which is the mark that stays after this has gone out.
 */
export function drawPinBlast(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  t: Table,
  view: ViewState,
  boss: PinballState,
  surfaceY: SurfaceY,
): void {
  const life = pinBlast01(view, boss);
  if (life <= 0) return;
  const grown = 1 - life;
  const at = pinAt(t, boss.dropXMilli, t.rows * 1000);
  const x = at.x;
  const y = surfaceY(x);

  // The charge over the whole ship, hardest at the moment of impact. The same
  // call the wall's strike makes, so a hit here reads as the ship being hit
  // rather than as this round's own animation.
  drawHullShock(ctx, l, surfaceY, view.time, life * 0.85);

  // The flash: white at the centre, the fire around it, gone fastest.
  halo(ctx, x, y, t.tile * (0.9 + 3.4 * grown), PALETTE.ember, life * 0.8);
  halo(ctx, x, y, t.tile * (0.4 + 1.1 * grown), PALETTE.text, life ** 2);

  // The shockwave: one ring, thinning as it runs out along the hull.
  const ring = new Path2D();
  ring.arc(x, y, t.tile * (0.3 + 3.2 * grown), Math.PI, Math.PI * 2);
  ctx.save();
  strokeGlow(ctx, ring, PALETTE.emberRim, Math.max(1, t.tile * 0.09 * life), life * 0.9);
  ctx.restore();

  // What the impact threw: shards of the ball, in the ball's own steel, out of
  // the ship and slowing as they go.
  ctx.save();
  ctx.globalAlpha = life;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineCap = "round";
  for (let i = 0; i < SHARDS; i++) {
    const a = Math.PI + Math.PI * ((i + 0.5) / SHARDS) + signedHash(i, 1, 0) * 0.18;
    const reach = t.tile * SHARD_TILES * (0.45 + 0.55 * Math.abs(signedHash(i, 2, 0)));
    const run = reach * Math.sqrt(grown);
    const tail = t.tile * 0.34 * life;
    ctx.lineWidth = Math.max(1, t.tile * 0.05 * life);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * run, y + Math.sin(a) * run);
    ctx.lineTo(x + Math.cos(a) * (run + tail), y + Math.sin(a) * (run + tail));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A target taken, said as loudly as the round can say anything.
 *
 * A ring across most of the table, spikes out of the piece, and a wash of the
 * pod's own amber over the whole board — the same colour the thing that was
 * taken is drawn in, so there is no question which of the two kinds of piece
 * just went. A run of them inside one shot climbs: the second is bigger than
 * the first, which is the only thing on the screen that says a cascade is
 * happening while it happens.
 */
export function drawPinTake(
  ctx: CanvasRenderingContext2D,
  t: Table,
  view: ViewState,
  boss: PinballState,
): void {
  const life = pinTake01(view, boss);
  if (life <= 0) return;
  const grown = 1 - life;
  const run = Math.min(3, Math.max(1, boss.hitRun));
  const at = pinAt(t, boss.hitXMilli, boss.hitYMilli);

  // The wash: the board lit amber for an instant, brightest at the piece and
  // falling away from it. It is the half that reads from arm's length — a ring
  // alone is a thing you have to be looking at the right part of the screen to
  // catch — and it is a gradient rather than a flat fill because a flat one put
  // a straight edge across the picture where the table stops, which is a
  // rectangle nobody drew on purpose.
  const spread = t.tile * Math.max(t.cols, t.rows);
  const wash = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, spread);
  wash.addColorStop(0, PALETTE.pod);
  wash.addColorStop(1, "rgba(255,194,74,0)");
  ctx.save();
  ctx.beginPath();
  ctx.rect(t.x, t.y, t.tile * t.cols, t.tile * t.rows);
  ctx.clip();
  ctx.globalAlpha = life ** 2 * 0.4;
  ctx.fillStyle = wash;
  ctx.fillRect(t.x, t.y, t.tile * t.cols, t.tile * t.rows);
  ctx.restore();

  halo(ctx, at.x, at.y, t.tile * (0.8 + 2.2 * grown) * run, PALETTE.pod, life * 0.85);
  halo(ctx, at.x, at.y, t.tile * (0.3 + 0.8 * grown), PALETTE.podRim, life);

  const reach = t.tile * RING_TILES * run;
  const ring = new Path2D();
  ring.arc(at.x, at.y, Math.max(1, reach * Math.sqrt(grown)), 0, Math.PI * 2);
  ctx.save();
  // Clipped to the table, so a ring wide enough to be seen from arm's length
  // does not run down over the ship and the panel, which are not what it is
  // about.
  ctx.beginPath();
  ctx.rect(t.x, t.y, t.tile * t.cols, t.tile * t.rows);
  ctx.clip();
  strokeGlow(ctx, ring, PALETTE.podRim, Math.max(1.5, t.tile * 0.11 * life), life * 0.95);
  ctx.restore();

  // The spikes: short, bright, and thrown from the piece rather than from the
  // ring, so the eye is sent back to where it happened.
  ctx.save();
  ctx.globalAlpha = life;
  ctx.strokeStyle = PALETTE.podRim;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, t.tile * 0.06 * life);
  for (let i = 0; i < SPIKES; i++) {
    const a = (Math.PI * 2 * i) / SPIKES + signedHash(i, 3, 0) * 0.1;
    const from = t.tile * (0.35 + 1.4 * grown) * run;
    const to = from + t.tile * 0.7 * life * run;
    ctx.beginPath();
    ctx.moveTo(at.x + Math.cos(a) * from, at.y + Math.sin(a) * from);
    ctx.lineTo(at.x + Math.cos(a) * to, at.y + Math.sin(a) * to);
    ctx.stroke();
  }
  ctx.restore();
}
