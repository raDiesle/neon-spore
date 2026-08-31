import { markMoment } from "./balance.js";
import { livingKindForColor, occupiesCol } from "./kinds.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CLASP: a slick or a bulb inside a shield of its own, and the first body
 * in this game that **becomes a different creature** instead of dying.
 *
 * Everything else on the field has one answer. A rock is warded, a slick is
 * shot, THE SHELL is chipped and then shot — but a shelled body is a shelled
 * body the whole way down, wearing a count. The clasp is not: the moment the
 * ward lands it *stops being a clasp* and the thing standing in that column is
 * an ordinary slick or bulb, with an ordinary colour, answered by the ordinary
 * rule. The owner named the shape while it was being designed — "transformation
 * from one enemy type into another" — and said to expect more of them, so the
 * three rules below are written to be lifted rather than copied.
 *
 * **The state is the kind, and there is no flag.** A tempting first version
 * gives `Creature` a `shielded: boolean` and leaves the kind alone. That
 * version has two truths about one body and a fingerprint that agrees with
 * itself while the two devices disagree; this one cannot, because the kind is
 * the whole of it. `claspBecomes` is the transformation and `world.hash` now
 * carries `c.kind` — see `hash.ts`, which did not need to until today.
 *
 * **What it turns into is not authored.** `packages/content/src/creatures.ts`
 * fixes one kind to one colour to one shape, so a red clasp can only ever
 * become a slick and a cyan one a bulb. Storing the target beside the colour
 * would be a second place that pairing is decided, and the two would drift the
 * first time a third colour existed. `livingKindForColor` is the one copy.
 *
 * The coupling is [warding](../../../docs/spec/couplings.md) pointed *up*.
 * Player 2 puts the shield in the column, player 1 triggers it, and neither
 * half is worth anything alone — the same two halves, the same 900 ms window,
 * aimed at a creature instead of at a rock. What is new is that the shield
 * stops being a plate on one row and reaches its whole column: a clasp is
 * broken wherever it happens to be when the trigger arrives.
 */

/** Whether this body is still wearing its shield. The kind *is* the state. */
export function claspIsShielded(c: Creature): boolean {
  return c.kind === "clasp";
}

/**
 * The kind a clasp turns into. Read off its colour through the one function
 * that owns the colour-to-silhouette pairing, never written out here.
 *
 * A clasp built without a colour becomes a slick, the same fallback
 * `wornKind` reaches for and for the same reason: a body has to be *some*
 * body. Nothing in the game builds one — `queueFromWave` requires the colour,
 * because it is the word player 2 has to hear before they can fire.
 */
export function claspBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * A shot met a clasp that is still wearing its shield.
 *
 * A shield is not armour with a hit count. Nothing a shot carries gets through
 * one, so there is no chipping branch and no colour test — THE SHELL is the
 * creature that counts hits, and this one deliberately is not it. The only
 * thing that opens a clasp is the ward, and a bolt fired at a shut one is
 * spent on nothing.
 *
 * Deliberately **not** a colour miss. The ammunition may have been exactly
 * right and the shield simply still on, which is a failure of the pair's order
 * of operations rather than of player 2's choice; charging it to the colour
 * balance would read the failure to the wrong player. `resolveWarden` and
 * `resolveQueen` both make the same argument about their own rejections.
 *
 * It lives here rather than in `bullet-hit.ts` because it is a rule about this
 * creature, and because that file is at its length limit — the same seam
 * `shell-round.ts` was split along.
 */
export function claspStruck(world: World, hit: Creature): void {
  world.events.push({ type: "reject", col: hit.col, row: hit.row });
}

/**
 * Break every clasp standing in the shield's column, and turn each into the
 * body it was hiding.
 *
 * Called from the `guard` command and from nowhere else. That is the whole
 * reach rule: a trigger is a moment, the shield's column is a place, and the
 * two together are what opens a clasp at any row on the field — unlike
 * `resolveHull`, which only ever asks its question on one row because a rock
 * has to arrive before it can be turned away.
 *
 * Deliberately **not** counted in `world.guard`. Those three numbers are the
 * rock ledger the balance sheet reads as "rocks that reached the shield, and
 * how many you turned" (docs/spec/systems.md 5.8), and a clasp never reaches
 * anything — folding it in would make `tries` a count of two different events
 * and quietly wrong. It is still a joint moment, and books one.
 */
export function breakClaspsInColumn(world: World): void {
  for (const c of world.creatures) {
    if (!claspIsShielded(c)) continue;
    if (!occupiesCol(c, world.shieldCol)) continue;
    const color = c.color;
    c.kind = claspBecomes(c);
    markMoment(world, true);
    world.score += world.cfg.scoreClaspBreak;
    world.events.push({
      type: "claspBreak",
      col: c.col,
      row: c.row,
      kind: c.kind,
      ...(color === null ? {} : { color }),
    });
  }
}
