import type { Creature, World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type WispJump, wispApexTiles, wispJump, wisps } from "./wisp.js";
import { drawGather, drawImpact } from "./wisp-land.js";

const TAU = Math.PI * 2;

/**
 * What a jumping wisp puts on the *field* rather than on itself: the pool of
 * its own light it keeps on the ground under it, the arc it is going to fly,
 * the tile it is going to land on and the shock that goes out when it does.
 *
 * **All of it is behind `showsWisp`.** This is the file where that is easiest
 * to get wrong and worst to get wrong: an arc is a line ending on a tile, and
 * a landing marker *is* the tile — either of them on player 1's screen would
 * hand the pilot the one thing the navigator exists to say. `drawCreatures`
 * asks the gate once, before the pass below runs at all.
 *
 * **And it is drawn flat, outside the perspective transform.** Every body in
 * `creatures.ts` is drawn inside a `ctx.scale` about its own centre, which is
 * right for a thing that is nearer and wrong for a mark on a tile: the
 * landing tile is a whole field away from the body scaling about itself, so
 * the same transform would slide the marker up to an eighth of a tile off the
 * square it is naming. A mark that names the wrong square is worse than no
 * mark. This pass therefore runs before the bodies and in screen space.
 */

/** How high the arc's own drawn curve rises, as a share of what the body
 * rises. Slightly under, so the dotted line reads as the *floor* of the flight
 * and the body is seen to travel over it rather than along it. */
const ARC_LIFT = 0.92;

/**
 * Every wisp's ground marks, under every body on the field.
 *
 * One pass over `wisps(world)` rather than a branch inside the body loop,
 * because these are marks on tiles and the body loop is sorted by depth: a
 * landing ring taking its turn in that order would come out over the bodies
 * standing on the rows between it and the wisp.
 */
export function drawWispGround(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
): void {
  // One jump for the whole field: every wisp hops on the same beat
  // (`wispHops`), so the phase is a fact about the beat and not about a body,
  // and reading it per creature would be reading one number several times.
  const j = wispJump(world.cfg, world.beat, beatPhase);
  for (const c of wisps(world)) {
    const from = { x: tileCX(l, c.fromCol ?? c.col), y: tileCY(l, c.fromRow) };
    const to = { x: tileCX(l, c.col), y: tileCY(l, c.row) };
    if (j.flying) {
      drawArc(ctx, l, from, to, j.flight, beatPhase, wispApexTiles(c));
      drawTarget(ctx, l, to, j.flight);
    }
    if (j.land > 0) drawImpact(ctx, l, to, j.land);
    if (j.crouch > 0) drawGather(ctx, l, to, j.crouch);
    drawPool(ctx, l, c, beatPhase, j);
  }
}

/**
 * The arc it is going to fly, from the tile it left to the tile it is going
 * to, dashed and drifting the way a dart's legs drift.
 *
 * **It is the answer to the question the jump asks and the reason the jump is
 * worth having.** A body that blinked out and back in gave player 2 one tile
 * to read, at the instant it arrived. A body that visibly crosses gives them a
 * whole beat of *knowing where it is going before it gets there* — long enough
 * to say a letter and a number while it is still in the air, so the cannon can
 * already be on the tile when it lands. That is not a courtesy: the simulation
 * has the body on the landing tile from the top of the beat (`sim/wisp.ts`),
 * so a shot at the named tile connects mid-flight. The line is drawing what is
 * already true.
 *
 * Quadratic and not the sine the body flies, and they are not meant to match
 * exactly: the curve is a hint under the movement, and a dotted line lying
 * exactly along a body's path is a line the body hides.
 */
function drawArc(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: { x: number; y: number },
  to: { x: number; y: number },
  flight: number,
  beatPhase: number,
  apexTiles: number,
): void {
  const dash = l.tile * 0.16;
  ctx.save();
  ctx.strokeStyle = PALETTE.wispRim;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.2, l.tile * 0.045);
  // Brightest as it leaves and fading as it arrives: what the line is for is
  // over once the pair has read the tile off it.
  ctx.globalAlpha = 0.55 * (1 - flight * 0.55);
  ctx.setLineDash([dash * 0.3, dash]);
  // Drifting toward the landing tile at the beat's pace, for `drawLegs`'
  // reason: a still dotted line reads as a wall, and the one thing this line
  // has to say is *this way*.
  ctx.lineDashOffset = -beatPhase * dash * 4;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  // How much the drawn curve bows, in tiles: the full apex once the jump
  // crosses a couple of columns, and nothing at all when it goes straight up
  // its own column. A quadratic whose two ends share an x degenerates — it
  // becomes a line drawn twice, running off the top of the field and back —
  // which is a picture of nothing. The body still arcs; on an in-column jump
  // the guide is simply the straight run to the tile, which is the honest
  // drawing of a hop that does not go anywhere sideways.
  const across = Math.min(1, Math.abs(to.x - from.x) / (l.tile * 2));
  // The control point of a quadratic sits at twice the height the curve
  // reaches, hence the doubling. The whole curve is drawn from the first frame
  // of the flight and does not grow with the body: it is the *path*, and a
  // path that arrived a piece at a time would be a trail — which says where it
  // has been, when the only thing worth saying is where it is going.
  ctx.quadraticCurveTo(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2 - l.tile * apexTiles * ARC_LIFT * 2 * across,
    to.x,
    to.y,
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.restore();
}

/**
 * The tile it is going to land on, marked while it is in the air.
 *
 * **A square and not a body, which is where this parts company with the
 * dart.** `dart-path.ts` draws its preview as the body itself, hollow, because
 * "a dart is going to be here" is what that pair says out loud and a
 * dart-shaped hole says it. What *this* pair says out loud is two characters
 * off a lettered grid, and the thing those two characters name is a square.
 * So the mark is the square: the same tile the lattice under it has already
 * drawn, brought up bright, with a ring at its centre for the body to come
 * down into. A blob-shaped hole would be a picture of the creature where a
 * picture of the *tile* is what has to be read.
 *
 * It grows brighter as the body falls toward it, which is the only urgency
 * this creature has: the call is worth less the later it is made.
 */
function drawTarget(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  to: { x: number; y: number },
  flight: number,
): void {
  const half = l.tile * 0.46;
  const dash = l.tile * 0.2;
  ctx.save();
  ctx.strokeStyle = PALETTE.wispRim;
  ctx.lineWidth = Math.max(1.4, l.tile * 0.05);
  ctx.globalAlpha = 0.35 + 0.5 * flight;
  ctx.setLineDash([dash * 0.5, dash * 0.4]);
  ctx.strokeRect(to.x - half, to.y - half, half * 2, half * 2);
  ctx.setLineDash([]);

  // The ring it comes down into, closing as it falls — the one part of this
  // mark that moves, so an eye that has already read the letter still knows
  // how long is left.
  ctx.strokeStyle = PALETTE.wisp;
  ctx.globalAlpha = 0.5 + 0.4 * flight;
  ctx.beginPath();
  ctx.ellipse(to.x, to.y, half * (0.66 - 0.3 * flight), half * (0.24 - 0.1 * flight), 0, 0, TAU);
  ctx.stroke();
  ctx.restore();

  halo(ctx, to.x, to.y, l.tile * 0.8, PALETTE.wisp, 0.1 + 0.2 * flight);
}

/**
 * The pool under it: a flat patch of its own light on the ground below the
 * body, tight and bright when it is standing, wide and faint at the apex.
 *
 * The one mark here that is not about a tile — it is about the *height*,
 * which is otherwise unreadable on a field drawn from straight ahead: a body
 * higher up the screen is a body further up the field, so without something
 * left on the ground under it an arc and a drift toward the top of the field
 * are the same picture.
 *
 * Light and not a shadow, which is the whole palette's argument arriving here:
 * the field is near black, so a dark ellipse on it is nothing at all. What a
 * bioluminescent body casts downward is its own glow, and that reads on this
 * background the way a shadow reads on a lit one.
 */
function drawPool(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  beatPhase: number,
  j: WispJump,
): void {
  // `creatureCenter` and not a second interpolation by hand: the pool has to
  // be under the body, and two copies of the glide are two places for it to
  // stop being.
  const { x, y } = creatureCenter(l, c, beatPhase);
  const rx = l.tile * (0.3 + 0.34 * j.arc + 0.16 * j.land + 0.06 * j.crouch);
  halo(ctx, x, y + l.tile * 0.28, rx * 2, PALETTE.wisp, 0.4 - 0.26 * j.arc);
}
