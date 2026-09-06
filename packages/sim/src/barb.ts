import { markMoment } from "./balance.js";
import { ticksPerBeat } from "./config.js";
import { breachHull } from "./hull-damage.js";
import { occupiesCol } from "./span.js";
import type { World } from "./world.js";

/**
 * THE BARB: the first body in this game that punishes the **shield**, and the
 * mirror of THE LURE one control across.
 *
 * THE LURE is a body a shot must never be spent on: it looks like an ordinary
 * target, the cannon is the wrong answer, and left alone it leaves. This is
 * that argument pointed at the other seat. A barb looks like an ordinary
 * arrival standing in a column; the trigger is the wrong answer, and the pair
 * has to get the dome *out of its column* rather than merely not press.
 *
 * **It is answered where a clasp is answered, and that is the whole of the
 * reach rule.** `breakClaspsInColumn` opens a clasp wherever it stands, on the
 * beat the trigger arrives, because the shield is a column and not a plate on
 * one row. A barb is caught by exactly the same question asked with the
 * opposite sign: any barb in the shield's column when the dome comes up is a
 * barb the dome has run onto. Neither creature waits for the hull row, and
 * neither ever reaches `resolveHull`'s ward branch — a barb is not `wardable`,
 * so nothing about it is turned away and it goes on falling with the hooks
 * still on it.
 *
 * **What it costs is a hole and a tail.** The hole is `barbTearDamage`, in the
 * shield's own column, because that is where the ship is torn. The tail is
 * `barbScarBeats`, and it is the creature: for those beats `guardArmed` says
 * no whatever player 1 does, so the rock already on its way down is a rock
 * nobody can ward. A cost paid once would be a trade; a defence that is gone
 * for three beats is a conversation.
 *
 * **A torn dome cannot be torn again**, and that is a decision rather than an
 * oversight. Under a shield malfunction the trigger comes up on every beat by
 * itself, so a barb sitting in the shield's column would otherwise charge the
 * hull once a beat until it landed — a punishment nobody can be inside of long
 * enough to answer. While the scar is open there is nothing left to catch, so
 * the pair pays once per `barbScarBeats` and has that long to slide clear.
 */

/** Ticks the dome wards nothing after a barb has caught it. */
export function barbScarTicks(world: World): number {
  return Math.round(world.cfg.barbScarBeats * ticksPerBeat(world.cfg));
}

/**
 * Whether the dome is torn open right now — the one place that is decided.
 *
 * `guardArmed` asks it and answers `false`, so every reader of *is the shield
 * live* inherits the scar without knowing this creature exists: the ward, the
 * clasp, the worm's plating, the button's own glow. That is deliberate and it
 * is the reason the scar is a fact about the shield rather than a flag on the
 * barb — a rule spelled out again at each of those four sites would be four
 * chances to forget one.
 */
export function domeScarred(world: World): boolean {
  return world.tick - world.domeScarTick < barbScarTicks(world);
}

/**
 * The dome came up. Any barb standing in its column catches it.
 *
 * Called from `armShield` and from nowhere else, so a trigger and a
 * malfunction's automatic arming reach it by the same path and cannot drift
 * apart — which matters more here than anywhere, because the wave this
 * creature is written for is the one where the arming is not a press.
 */
export function barbCatchesDome(world: World): void {
  if (domeScarred(world)) return;
  const caught = world.creatures.find((c) => c.kind === "barb" && occupiesCol(c, world.shieldCol));
  if (!caught) return;
  world.domeScarTick = world.tick;
  // Before the breach, because this is what happened and the breach is what it
  // cost — the order `crawlerBurrow` already establishes.
  world.events.push({ type: "barbTear", col: world.shieldCol, row: caught.row });
  markMoment(world, false);
  breachHull(
    world,
    world.shieldCol,
    "barb",
    caught.fromRow,
    world.cfg.barbTearDamage,
    caught.color,
  );
}
