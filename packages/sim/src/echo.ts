import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import { clampSpanCol } from "./span.js";
import type { Bullet, Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE ECHO: the first body that is worth *more* the earlier it is taken, and
 * the first that punishes a shot fired late by becoming eight of them.
 *
 * Every other arrival is one sentence with a deadline behind it — say the
 * colour, say the column, before it reaches the hull. This one has two
 * deadlines and they point opposite ways. It comes down half as fast as
 * anything else, so the hull is never what is pressing; but it divides while
 * it falls, and each division is a body the pair has to place, name and take
 * separately. The urgency is in front of the pair rather than behind them,
 * which is a shape nothing else in the game has.
 *
 * **The waits grow, and the last one is the one nobody should see.** A body
 * divides `echoSplitBeats` beats after it comes into being, its halves twice
 * that long after, and theirs three times — three beats, then six, then nine.
 * At `echoFallBeats` the whole descent is twenty-seven beats, so the third
 * division lands with barely a third of the field left: a pair playing this
 * creature properly never watches it happen. It is the failure state made
 * visible rather than a stage of the fight, and the growing gap is what makes
 * every one of them a decision rather than a rhythm — the second wait is long
 * enough to feel like the thing is finished with, and it is not.
 *
 * **Each division turns a corner** (`ECHO_AXES`): sideways, then up and down,
 * then both at once. Two halves side by side is the plainest picture of a
 * thing coming apart; four in a two-by-two block is as close together as
 * bodies can stand, which is the whole point — an echo that fanned five
 * columns wide on its first division would own the field before it had asked
 * the pair anything. It only opens out on the last one, and by then the pair
 * has had eighteen beats to stop it.
 *
 * **It is a slick or a bulb, small, with a seam down it.** No silhouette of
 * its own, deliberately — `wornKind` resolves it to the body its authored
 * colour names, and render draws it at a fraction of the usual footprint with
 * a furrow across the axis it is about to divide on, straining wider as the
 * moment comes (`render/echo.ts`). The pair keeps the two words it already
 * has; what the picture adds is *when* and *which way*, which is exactly what
 * they have to say to each other.
 */

/**
 * How many times this body still divides. Absent on every other kind, and zero
 * on an echo that has finished — which is the only state in which it is simply
 * a small body falling.
 *
 * Call this rather than reading `c.echoSplits` by hand: the count is what the
 * axis, the wait, the worth and the seam all read, and a second spelling of
 * the fallback is how the picture and the score come to disagree about which
 * generation a body is.
 */
export function echoSplitsLeft(c: Creature): number {
  return c.echoSplits ?? 0;
}

/**
 * How many bodies this one still becomes, itself included — one doubling per
 * division left. It is what a shot at this body is worth (`echoStruck`), and
 * it is the whole argument for the price: a shot that catches an echo before
 * it has divided has taken eight bodies off the field, and being paid for one
 * of them would teach the pair to wait.
 */
export function echoBodies(c: Creature): number {
  return 1 << echoSplitsLeft(c);
}

/**
 * Whether every echo on the field takes its step down on this beat.
 *
 * Read straight off `world.beat`, the way `throbIsOpen` and `wispHops` are,
 * rather than from a phase stored on each body. Every echo therefore falls on
 * the same beats whatever beat it arrived on, which is the property the pair
 * needs: eight bodies out of one arrival are one falling clock, so "the next
 * one" is a beat both of them can count. The *dividing* clock is the opposite
 * and deliberately so — that one is per body (`echoBeat`), because two arrivals
 * a few beats apart must not come apart in unison, or the field turns over all
 * at once and there is nothing left to put in an order.
 */
export function echoFalls(cfg: SimConfig, beat: number): boolean {
  return beat % cfg.echoFallBeats === 0;
}

/** The fields an echo arrives with: every division ahead of it, and the beat
 * the first wait is counted from. */
export function echoOnSpawn(
  cfg: SimConfig,
  beat: number,
): { echoSplits: number; echoBeat: number } {
  return { echoSplits: cfg.echoSplits, echoBeat: beat };
}

/**
 * The body an echo is drawn as — the slick or the bulb its authored colour
 * names. Reached through `wornKind` and never called at a draw site directly,
 * for the reason every other worn body has one: what a thing *is* and what it
 * *looks like* are two questions, and a second copy of the pairing is how a
 * body comes to be drawn in a colour a shot does not match.
 *
 * A slick for an echo built without a colour. Nothing in the game builds one —
 * a wave authors red or cyan the way it does for a dart — and a body has to be
 * drawn as something, which is the same fallback `wornKind` already makes for
 * a lure.
 */
export function echoBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * A shot met an echo. Returns whether the bullet goes on, the same contract
 * `resolve` has — a lance that killed one carries on up the column, because
 * what stopped it was the body and the body is gone.
 *
 * **The worth is `echoBodies` times the price of one**, which is the rule this
 * creature is balanced on: an arrival is worth the same whether it is taken in
 * one shot or in eight, so the pair is never paid for being slow. They are
 * only charged for it — in shots, and in the columns those shots were not
 * covering.
 *
 * A wrong colour is an ordinary colour miss, deliberately. Both players see an
 * echo the whole way down and both see what colour it is, so getting it wrong
 * is the same mistake it would be against a slick and is scored as one.
 *
 * It lives here rather than in `bullet-hit.ts` for `ghostStruck`'s reason: it
 * is a rule about one creature, and that file is at its length limit.
 */
export function echoStruck(world: World, b: Bullet, hit: Creature): boolean {
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  metColor(world);
  world.score += world.cfg.scoreEchoKill * echoBodies(hit);
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
  b.pierced += 1;
  return b.lance && b.pierced < world.cfg.lancePierce;
}
