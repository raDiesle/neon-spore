import { bodyCenterCol, type Color, type Creature, spanOf } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **What the hull loses, and what it gets back.**
 *
 * Cut out of `hull.ts` when THE FENCE's own answer took that file over its
 * 250-line limit, and along the seam that file had already written down in
 * `regenerateHull`'s own header — *one file for what the hull loses and what
 * it gets back*. Next door is the question of what happens to a body that
 * reached the ship: which row it is answered on, whether the shield turned it,
 * whether the dome was standing in a gap. Every one of those ends in a call to
 * something here, and none of them cares how a scar is recorded.
 *
 * `hull.ts` re-exports all four, so nothing that already reached for
 * `breachHull`, `hullPercent` or `regenerateHull` through it had to move.
 */

/**
 * Hull damage, shared by a single-column hit and a spanning one.
 *
 * `amount` is in whole hull points and is rounded into thousandths here, not
 * assumed to be an integer: a blast that splits one price between the places
 * it broke the hull in (`resolveLure`, bullet-hit.ts) hands this a third of a
 * number, and a stored `Milli` field that is not an integer is two devices
 * one rounding step apart (CLAUDE.md rule 3).
 */
function applyHullDamage(world: World, amount: number): void {
  if (world.cfg.hullInvulnerable) return;
  world.hullMilli = Math.max(0, world.hullMilli - Math.round(amount * MILLI));
  if (world.hullMilli <= 0) world.over = true;
}

/**
 * One column of the hull, broken. The whole of what "something got through"
 * means: the damage, the scar that stays, and the `breach` event render/ hangs
 * the impact on.
 *
 * Exported because a creature reaching the hull is no longer the only way this
 * happens — THE MIRROR answers a wrong step by breaking the hull directly
 * (`mirror.ts`), and a lure shot two rows up breaks it in three places at once
 * (`resolveLure`, bullet-hit.ts). Both must break it the same way, with the
 * same event, or the picture and the record of the damage would quietly
 * diverge.
 */
export function breachHull(
  world: World,
  col: number,
  kind: Creature["kind"],
  fromRow: number,
  amount: number,
  /** The body's own colour, so the burst is thrown in it. Defaults to null,
   * which is the truth for every caller that breaks the hull without a body:
   * a rock, and the rounds that cost the hull from off the field. */
  color: Color | null = null,
): void {
  world.scars.push({ col, beat: world.beat, kind });
  if (world.scars.length > world.cfg.maxScars) world.scars.shift();
  breachUnscarred(world, col, kind, fromRow, amount, color);
}

/**
 * **The same cost with nothing torn in the plating**: the hull points and the
 * `breach` event, and no scar.
 *
 * One caller, and it is the creature the distinction was written for. THE
 * FENCE is a live wire, not a body: it does not strike the ship, it *earths
 * through the dome standing in its way* (`resolveFence`, hull.ts). The owner
 * asked for that to look like what it is — no cracks in the skin, and the
 * shield's own line put out in several places instead (`shield-outage.ts`) —
 * and a crack is what a `Scar` draws, so there is nothing here for one to hang
 * from. The damage is unchanged: what a fence costs is `fenceDamage` either
 * way, and only the picture of it moved.
 *
 * `breachHull` is this function with a scar in front of it, so the two can
 * never disagree about what a breach *is*: one event, one amount, one place.
 */
export function breachUnscarred(
  world: World,
  col: number,
  kind: Creature["kind"],
  fromRow: number,
  amount: number,
  color: Color | null = null,
): void {
  applyHullDamage(world, amount);
  world.events.push({
    type: "breach",
    col,
    damage: amount,
    span: 1,
    kind,
    fromRow,
    color,
    beat: world.beat,
  });
}

/** Hull integrity as a plain 0..100 number, for display only. */
export function hullPercent(world: World): number {
  return world.hullMilli / MILLI;
}

/**
 * The hull mending itself, one tick's worth. It lived in `world.ts` beside the
 * `step` that calls it until that file ran out of room; this is where it
 * always belonged, next to the two functions that break the hull in the first
 * place — one file for what the hull loses and what it gets back.
 */
export function regenerateHull(world: World): void {
  // Nothing mends while the run belongs to the pair. That rule used to name
  // THE FORK here; the gate that replaced it needs no line of its own, because
  // `step` returns before this function for as long as a wave's opening holds
  // the field (`briefing.ts`). A guide the pair can sit behind while the hull
  // heals would be the same exploit through a new door, and it is shut.
  if (world.over) return;
  const perTick = Math.round((world.cfg.hullRegenPerSecond * MILLI) / world.cfg.tickHz);
  world.hullMilli = Math.min(100 * MILLI, world.hullMilli + perTick);
}

/**
 * A miss costs the hull `amount` once, no matter how many columns the
 * creature spans — the torch is one impact, not two — but every column it
 * covers scars, since that is where the hull visibly broke. The `breach`
 * event still fires once, on the creature's visual centre, so an effect that
 * reacts to it plays once rather than stacked on top of itself per column.
 */
export function damageSpan(world: World, c: Creature, amount: number): void {
  applyHullDamage(world, amount);
  const span = spanOf(c);
  for (let col = c.col; col < c.col + span; col++) {
    // The scar carries the width too: a crater is drawn at the size of the
    // rock that made it (`rockRadius`), and a two-wide meteor that left
    // one-tile dents would read as two small hits rather than one big one.
    world.scars.push({ col, beat: world.beat, kind: c.kind, ...(c.span ? { span: c.span } : {}) });
    if (world.scars.length > world.cfg.maxScars) world.scars.shift();
  }
  world.events.push({
    type: "breach",
    col: bodyCenterCol(c, c.col),
    damage: amount,
    span,
    kind: c.kind,
    fromRow: c.fromRow,
    color: c.color,
    beat: world.beat,
  });
}
