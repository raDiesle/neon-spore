import type { Creature, World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type WispJump, wispJump, wisps } from "./wisp.js";
import { drawAim } from "./wisp-aim.js";
import { drawGather, drawImpact } from "./wisp-land.js";

/**
 * What a jumping wisp puts on the *field* rather than on itself: the pool of
 * its own light it keeps on the ground under it, the shock that goes out when
 * it lands, and the gather on the tile it is about to leave. Where it is
 * *going* is `wisp-aim.ts` next door — the subjects came apart when the mark
 * stopped belonging to the flight and started belonging to the whole dwell.
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
    const here = { x: tileCX(l, c.col), y: tileCY(l, c.row) };
    // Where it is going, and the arc to it — the leg being flown mid-jump and
    // the one not taken yet the rest of the time (`wisp-aim.ts`).
    drawAim(ctx, l, world.cfg, c, j, beatPhase);
    if (j.land > 0) drawImpact(ctx, l, here, j.land);
    if (j.crouch > 0) drawGather(ctx, l, here, j.crouch);
    drawPool(ctx, l, c, beatPhase, j);
  }
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
