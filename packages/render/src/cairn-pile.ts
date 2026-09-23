import type { CairnState, Creature } from "@neon-spore/sim";
import { drawSlimeFilm, drawSlimeSeams, drawSlimeUnder } from "./cairn-slime.js";
import { cairnUnits, pilePath, unitPath } from "./cairn-units.js";
import type { Layout } from "./layout.js";
import { drawRockBody } from "./meteor.js";
import { meteorLookFor } from "./meteor-looks.js";
import { seenFrom } from "./rock-window.js";

/**
 * THE CAIRN's pile as the game draws it: seven live fires under one clip.
 *
 * **Every unit is the game's two-tile rock and is drawn by the code that draws
 * one** — `drawRockBody`, at `rockRadius(l, 2)`, under the look the pile drew
 * once for the whole of itself. That is not a saving, it is the creature: the
 * boss comes apart into ordinary rocks, so the parts have to *be* ordinary
 * rocks while they are still stacked. A pile painted as one boss-shaped mass
 * would promise a body, and what the pair gets when they pull is a stone.
 *
 * **One look for all seven**, taken from the body's own id rather than each
 * unit's index: three materials mixed in one stack would read as a heap of
 * different things somebody swept together, and this is one thing made of
 * seven of the same thing.
 *
 * **The outline is a clip and the seams are slime.** Every unit's polygon
 * goes into one `Path2D`; filling it would be the union, and clipping to it is
 * the same union used the other way round — so the stones are painted inside
 * the pile's own silhouette and nothing, halo included, reaches past it. Each
 * stone's own edge is then stroked as the slime that binds it (`cairn-slime.ts`),
 * which is its share of the silhouette and of the seams, and the seams are the
 * point. Counting the units is counting the fight.
 *
 * This is the field of `CAIRN_LOOK` (`cairn-look.ts`), and it is what the
 * first perf run of the wave pointed at: seven whole fires a frame, most of
 * each under the stones above it. Whether the pile should instead be a
 * picture taken once is a look, and it is asked in VERSUS rather than here.
 *
 * **What the clip would throw away is not built.** Each stone's fire is told
 * where the outline is — the circles round the seven stones, which contain
 * their facets — and a mark that could not reach it is skipped before its
 * gradient or its path exists (`rock-window.ts`). A stone's plume rises
 * three radii above it, and for the apex nearly all of that is sky.
 */
export function livePile(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Creature,
  boss: CairnState,
  time: number,
): void {
  const stack = cairnUnits(l, body, boss.units, time);
  if (stack.length === 0) return;
  const look = meteorLookFor(body.id);
  const path = pilePath(stack);
  drawSlimeUnder(ctx, stack, time);
  ctx.save();
  ctx.clip(path);
  for (const u of stack) {
    const seed = body.id * 31 + u.slot;
    drawRockBody(ctx, u.x, u.y, u.r, time, seed, 0, look, seenFrom(stack, u.x, u.y));
    // Each stone's seam straight after it, so the stone above covers the part
    // of the line its own body hides and only real joints stay drawn. Inside
    // the clip, so the silhouette keeps the stroke's inner half and the pile
    // does not grow a rim wider than the shape it is (`cairn-slime.ts`).
    drawSlimeSeams(ctx, unitPath(u), l.tile);
  }
  drawSlimeFilm(ctx, stack);
  ctx.restore();
}
