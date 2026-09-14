import { stepRockAcross } from "./rock-cross.js";
import { spanOf } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GUM**: a sticky mass that falls straight down one lane, cannot be
 * shot, is not stopped by the shield, and has to be **swiped away in the
 * air** — by either seat, to the left or to the right — before it reaches
 * the ship. One that gets there hits the hull like everything else does and
 * splashes across it.
 *
 * **The swipe is the grip's own gesture**, THE CAIRN's arrangement exactly
 * (`hand.ts`): a hand on a falling gum is a `"pull"`, worth nothing while the
 * thumb rests on it — the gum goes on falling under the finger, un-braked —
 * and spent by carrying it. `carryGrips` measures the carry for every kind
 * (`grip-push.ts`); what the gum does with the first column it earns is fling
 * itself, and the threshold is its own (`gumSwipeMilli`). Either seat, for
 * the brake's reason: the field belongs to both, and this is the one body on
 * it that neither the cannon nor the plate can answer.
 *
 * **It flies out on the crossing rock's path** (`rock-cross.ts`): from the
 * beat it is swiped it walks its own row, `gumFlingCols` a beat the way the
 * hand sent it, and it is gone the moment it is past the wall. No new
 * physics — the same field, the same step, the same exit — and the direction
 * is the hand's alone: there is no wrong side any more, only too late.
 *
 * **Too late is the ship's row.** A gum standing there has arrived, and
 * `carryGrips` refuses every arrival by the rule it refuses a rock: the
 * column it breaks is the one the pair watched it come down in. It then goes
 * through `resolveHull`'s ordinary gates — resolved on the beat it is drawn
 * standing on the hull — and breaks it **without a scar** (`breachUnscarred`),
 * THE FENCE's arrangement: the picture of a gum landing is not a crack in the
 * plating but the thing splashing over it, and a crack is what a `Scar`
 * draws (`render/gum-splash.ts`).
 *
 * **It used to stick.** Until 14 September 2026 a gum landed on the ship,
 * shut the cannon's column, and had to be swiped off by player 2 with the
 * cannon parked under it, toward the nearer wall. The owner took that out for
 * this; the old mechanic is written up on the NOT BUILT YET page
 * (`docs/spec/ideas.md`, MECHANICS) so it could be rebuilt.
 */

/** Whether this body is a gum a hand has already sent flying. Once it is on
 * the path a second carry does nothing: the flick was the whole gesture. */
export function gumIsFlung(c: Creature): boolean {
  return c.kind === "gum" && c.rockDir !== undefined;
}

/**
 * A hand has carried this gum a swipe's worth, the way `dir` says.
 *
 * Called by `carryGrips` on the beat the column is earned, after the fall
 * loop has written the `from` fields — so it is put on the crossing path and
 * takes its first stride *now*, the way a carried rock takes its column now,
 * and the picture glides it out of the lane it was falling down. `rockRow` is
 * the row it is on: it stops falling from here and flies level.
 */
export function gumSwiped(world: World, c: Creature, dir: -1 | 1): void {
  c.rockDir = dir;
  c.rockRow = c.row;
  c.pushBeat = world.beat;
  world.events.push({ type: "gumFlung", col: c.col, row: c.row, span: spanOf(c), dir });
  stepRockAcross(world, c);
}
