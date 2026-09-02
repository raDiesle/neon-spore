import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { clampSpanCol, livingKindForColor } from "./kinds.js";
import type { Bullet, Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE ECHO: the first body that is worth *more* the earlier it is taken, and
 * the first that punishes a shot fired late by becoming four of them.
 *
 * Every other arrival is one sentence with a deadline behind it — say the
 * colour, say the column, before it reaches the hull. This one has two
 * deadlines and they point opposite ways. It comes down half as fast as
 * anything else, so the hull is never what is pressing; but one beat after it
 * arrives it divides, and one beat after that both halves divide again, and
 * from then on the pair is answering four bodies in four columns instead of
 * one. The urgency is in front of the pair rather than behind them, which is a
 * shape nothing else in the game has.
 *
 * **So the pair has to interrupt each other.** A wave with an echo in it also
 * has ordinary bodies falling at full speed, and those are the ones that look
 * urgent. The echo is the slow one, the one it is always reasonable to leave
 * until later — and leaving it until later is exactly what costs four shots
 * instead of one. That decision cannot be made by either seat alone: player 1
 * has the cannon and cannot fire, player 2 has both triggers and cannot move
 * the cannon, and the whole of what has to be said out loud is *that one
 * first*.
 *
 * **It is a slick or a bulb, small.** No silhouette of its own, deliberately —
 * `wornKind` resolves it to the body its authored colour names and render
 * draws it at a fraction of the usual footprint. A shape of its own would be a
 * new word for the pair to learn about a creature whose whole sentence is a
 * count and an order; what they say about one is "two reds, four and six",
 * which is vocabulary they already have. The size is the tell that it is not
 * an ordinary body, and the fan is the tell that it was one.
 */

/**
 * How many times this body still divides. Absent on every other kind, and zero
 * on an echo that has finished — which is the only state in which it is simply
 * a small body falling.
 *
 * Call this rather than reading `c.echoSplits` by hand: the count is what the
 * spread, the worth and the split pass all read, and a second spelling of the
 * fallback is how the picture and the score come to disagree about which
 * generation a body is.
 */
export function echoSplitsLeft(c: Creature): number {
  return c.echoSplits ?? 0;
}

/**
 * How many bodies this one still becomes, itself included — one doubling per
 * split left. It is what a shot at this body is worth (`echoStruck`), and it
 * is the whole argument for the price: a shot that catches an echo before it
 * has divided has taken four bodies off the field, and being paid for one of
 * them would teach the pair to wait.
 */
export function echoBodies(c: Creature): number {
  return 1 << echoSplitsLeft(c);
}

/**
 * Whether every echo on the field takes its step down on this beat.
 *
 * Read straight off `world.beat`, the way `throbIsOpen` and `wispHops` are,
 * rather than from a phase stored on each body. Two echoes therefore fall
 * together whatever beat they arrived on, which is the property the pair
 * needs: four bodies out of one arrival are one clock, so "the next one" is a
 * beat both of them can count rather than four rhythms on one screen.
 */
export function echoFalls(cfg: SimConfig, beat: number): boolean {
  return beat % cfg.echoFallBeats === 0;
}

/**
 * How many columns each half steps away from the body it came out of.
 *
 * **It halves every generation**, which is what makes the four end up evenly
 * spaced rather than in two piles. A fixed spread of one column would put the
 * second generation back in its own grandparent's lane — two bodies in one
 * column is one body as far as a spoken call goes, and the count the pair says
 * out loud would be wrong. Two columns then one gives four lanes two apart,
 * which is a fan a person reads at a glance and names from left to right.
 */
export function echoSpread(splitsLeft: number): number {
  return 1 << Math.max(0, splitsLeft - 1);
}

/** The field an echo arrives with: the whole count of divisions ahead of it. */
export function echoOnSpawn(cfg: SimConfig): { echoSplits: number } {
  return { echoSplits: cfg.echoSplits };
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
 * One beat of dividing, for the whole field at once.
 *
 * **Every echo that was already standing when the beat began divides, and the
 * halves it leaves behind do not.** That is what "one beat later" means here,
 * and it is why this creature needs no age on it: a body pushed by this pass
 * is not walked by it, so it divides on the *next* call, and an arrival out of
 * the queue divides on the beat after it enters. One field, `echoSplits`, and
 * no second clock to disagree with the shared one.
 *
 * The halves inherit everything the parent had except its column and its
 * count. `fromCol` is the parent's own column, so render glides them out of
 * the body they came from rather than snapping them into existence two lanes
 * away — and that glide is the only announcement the split gets. It is enough:
 * both screens draw it, and neither player is being told anything the other
 * one is not.
 */
export function splitEchoes(world: World): void {
  const dividing = world.creatures.filter((c) => c.kind === "echo" && echoSplitsLeft(c) > 0);
  if (dividing.length === 0) return;
  const gone = new Set(dividing.map((c) => c.id));
  world.creatures = world.creatures.filter((c) => !gone.has(c.id));
  for (const parent of dividing) {
    const spread = echoSpread(echoSplitsLeft(parent));
    const left = echoSplitsLeft(parent) - 1;
    for (const side of [-1, 1] as const) {
      world.creatures.push({
        ...parent,
        id: world.nextId++,
        // An echo is one tile wide, so the clamp is over a span of one — but
        // it is `clampSpanCol` rather than a pair of comparisons written here,
        // because "keep a body's whole width on the field" is a rule this file
        // calls and does not re-derive (`kinds.ts`).
        col: clampSpanCol(parent.col + side * spread, world.cfg.cols, 1),
        fromCol: parent.col,
        echoSplits: left,
      });
    }
  }
}

/**
 * A shot met an echo. Returns whether the bullet goes on, the same contract
 * `resolve` has — a lance that killed one carries on up the column, because
 * what stopped it was the body and the body is gone.
 *
 * **The worth is `echoBodies` times the price of one**, which is the rule this
 * creature is balanced on: an arrival is worth the same whether it is taken in
 * one shot or in four, so the pair is never paid for being slow. They are only
 * charged for it — in shots, and in the columns those shots were not covering.
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
