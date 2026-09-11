import { fenceIsOpen } from "./fence.js";
import { creatureLane, creatureMilli } from "./mid-beat.js";
import { queenOccupiesCol } from "./queen-mark.js";
import { type Bullet, type Creature, occupiesLane, spanOf } from "./types.js";
import type { World } from "./world.js";

/**
 * **What a shot meets on a stretch of a column**, and the one place that
 * question is answered.
 *
 * Cut off `bullets.ts` when THE LANCE stopped being a bolt: a travelling shot
 * asks it about a tick's worth of climb and the beam asks it about the whole
 * column at once (`lance-burn.ts`), and two callers of one rule is exactly
 * when it stops belonging to either of them.
 */

/**
 * The first creature the swept segment `from..to` touches, or undefined.
 *
 * Every creature carries an invisible box, `spanOf` columns wide and
 * `hitHeightMilli` tall, centred on it. Shots only ever travel straight up the
 * middle of a column, so the column is the whole of the horizontal test and
 * the shape of the creature never enters into it — a lobe that leans out of
 * its column is drawing, not hitbox.
 *
 * That box is placed by `creatureLane` rather than by `c.col`, for the reason
 * `creatureMilli` is not `c.row`: a body part-way through a move is part-way
 * through it in both axes, and the eye judges a hit by where the thing is
 * drawn.
 *
 * The queen is the one exception: her own column carries nothing, and the
 * two columns that do (`queenOccupiesCol`) are not a span either — nothing
 * stands in the tile between them. `occupiesCol`/`colSpan` cannot be asked
 * to describe that, so she gets her own column test instead of the shared one.
 */
export function firstAlong(
  world: World,
  b: Bullet,
  from: number,
  to: number,
): Creature | undefined {
  const half = Math.round(world.cfg.hitHeightMilli / 2);
  let best: Creature | undefined;
  let bestMilli = 0;
  for (const c of world.creatures) {
    // A tether is not shootable, and it does not stop a shot either: it is a
    // line hanging in a column the pair still has to fire up. It is answered
    // by a hand and by nothing else (docs/spec/bosses.md 11.4).
    if (c.kind === "tether") continue;
    // Nor is THE GYRE's hub, for the same two reasons at once: there is
    // nothing on it to shoot, and the tile at the middle of a wheel is empty —
    // what a shot meets in those columns is a mount or nothing (`gyre.ts`). A
    // hub that stopped bolts would put a wall across five columns of the
    // field with no body anywhere in it.
    if (c.kind === "gyre") continue;
    // Nor THE GUM, in the air or on the ship: nothing fired reaches it, and a
    // bolt fired up a lane it is falling down goes past it to whatever is
    // above. On the ship it stops the shot *before* it exists instead
    // (`gumOverCannon`, in `firePress`), which is the block the pair hears.
    if (c.kind === "gum") continue;
    // THE FENCE stops a bolt in every column it is still **shut** in, and in
    // none of the ones it is open in: a hole is a hole, so a shot fired up a
    // way through reaches whatever is above it rather than dying on a gap the
    // pair had already made. `fenceIsOpen` is the rule and it takes the burnt
    // columns as well as the authored ones, so the second shot up a column the
    // first one cut is not wasted (`fence.ts`).
    if (c.kind === "fence" && fenceIsOpen(c, b.col)) continue;
    const inCol =
      c.kind === "queen"
        ? queenOccupiesCol(c.col, b.col)
        : occupiesLane(creatureLane(world, c), spanOf(c), b.col);
    if (!inCol) continue;
    const pos = creatureMilli(world, c);
    if (pos - half > from || pos + half < to) continue;
    // Several boxes can overlap the sweep; the shot stops at the lowest one,
    // the one it reaches first.
    if (!best || pos > bestMilli) {
      best = c;
      bestMilli = pos;
    }
  }
  return best;
}
