import { bodyCenterCol, type Color, type Creature, spanOf } from "./types.js";
import { failWave } from "./wave-fail.js";
import type { World } from "./world.js";

/**
 * **What a breach is**: a scar where the ship broke, a `breach` event the
 * picture and the sound hang on, and the wave lost (`wave-fail.ts`).
 *
 * Cut out of `hull.ts` when THE FENCE's own answer took that file over its
 * 250-line limit. Next door is the question of what happens to a body that
 * reached the ship: which row it is answered on, whether the shield turned
 * it, whether the dome was standing in a gap. Every one of those ends in a
 * call to something here, and none of them cares how a scar is recorded.
 *
 * Until 12 September 2026 a breach also took points off a hull, and this
 * file was *what the hull loses and what it gets back* — `hullMilli`,
 * `hullPercent`, `regenerateHull`, and a `damage*` figure for every body in
 * `SimConfig`. The owner's rule retired all of it: a hit costs the wave, and
 * every hit costs the same. What a breach still carries is a **weight**, and
 * that is for the ear alone — a rock going through the plate is not the sound
 * of a slick brushing it (`audio/bind-breach.ts`).
 */

/**
 * How a breach sounds. `heavy` is a rock or anything that arrived as one — a
 * carom, a crystal, a coil nobody opened, a charging ghost, a round's wreck
 * coming down — and `light` is a body that merely arrived, or a share of a
 * blast torn in several places.
 */
export type BreachWeight = "light" | "heavy";

/**
 * One column of the hull, broken. The whole of what "something got through"
 * means: the wave lost, the scar that stays, and the `breach` event render/
 * hangs the impact on.
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
  weight: BreachWeight,
  /** The body's own colour, so the burst is thrown in it. Defaults to null,
   * which is the truth for every caller that breaks the hull without a body:
   * a rock, and the rounds that cost the hull from off the field. */
  color: Color | null = null,
): void {
  world.scars.push({ col, beat: world.beat, kind });
  if (world.scars.length > world.cfg.maxScars) world.scars.shift();
  breachUnscarred(world, col, kind, fromRow, weight, color);
}

/**
 * **The same hit with nothing torn in the plating**: the wave lost and the
 * `breach` event, and no scar.
 *
 * One caller, and it is the creature the distinction was written for. THE
 * FENCE is a live wire, not a body: it does not strike the ship, it *earths
 * through the dome standing in its way* (`resolveFence`, hull.ts). The owner
 * asked for that to look like what it is — no cracks in the skin, and the
 * shield's own line put out in several places instead (`shield-outage.ts`) —
 * and a crack is what a `Scar` draws, so there is nothing here for one to hang
 * from.
 *
 * `breachHull` is this function with a scar in front of it, so the two can
 * never disagree about what a breach *is*: one event, one weight, one place.
 */
export function breachUnscarred(
  world: World,
  col: number,
  kind: Creature["kind"],
  fromRow: number,
  weight: BreachWeight,
  color: Color | null = null,
): void {
  failWave(world);
  world.events.push({
    type: "breach",
    col,
    weight,
    span: 1,
    kind,
    fromRow,
    color,
    beat: world.beat,
  });
}

/**
 * A rock is one impact, not two, however many columns it spans — but every
 * column it covers scars, since that is where the hull visibly broke. The
 * `breach` event still fires once, on the creature's visual centre, so an
 * effect that reacts to it plays once rather than stacked on top of itself
 * per column.
 */
export function damageSpan(world: World, c: Creature, weight: BreachWeight): void {
  failWave(world);
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
    weight,
    span,
    kind: c.kind,
    fromRow: c.fromRow,
    color: c.color,
    beat: world.beat,
  });
}
