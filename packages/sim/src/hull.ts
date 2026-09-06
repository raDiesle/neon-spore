import { markMoment } from "./balance.js";
import { hullRow } from "./config.js";
import { grateIsOpen } from "./grate.js";
import { breachHull, damageSpan } from "./hull-damage.js";
import { guardArmed, shieldRow } from "./hull-guard.js";
import { impactDamage } from "./impact.js";
import { beadIsSpent } from "./strand.js";
import { type Creature, isWardable, occupiesCol } from "./types.js";
import { wardTurns } from "./ward.js";

import type { World } from "./world.js";

/**
 * Check for impacts at the hull. Creatures that reach the hull row either
 * damage it (normal creatures and undeflected meteors) or are deflected
 * (meteors when the shield is in column and player 1 triggered it in time).
 *
 * A rock is asked the shield's question a row early, at `shieldRow` — that is
 * where the shield is, and a rock nobody answers there sinks into it and is
 * asked again on the ship's own row, which is the last beat there is. So
 * nothing that used to be saveable stops being saveable; what changes is that
 * a rock answered in time now turns at the surface instead of at the plating.
 *
 * **Nothing is through on the beat it reaches the ship's row.** A body that
 * came from above this beat is still being drawn arriving, whatever it is, and
 * it breaks the hull on the beat after — the beat the pair watches it land.
 *
 * Guard tries always increments for a meteor, once, on the beat it leaves the
 * field — turned away or not. Deflected and mistimed count the two failure
 * states that matter for learning (docs/spec/systems.md 5.8).
 */
export function resolveHull(world: World): void {
  const survivors: Creature[] = [];
  const shipRow = hullRow(world.cfg);
  const guardRow = shieldRow(world.cfg);

  for (const c of world.creatures) {
    // **THE GRATE, and the only body on this field the trigger cannot answer.**
    // It is the width of the field, so there is no column to be in and no
    // moment to be on: the wall reaches the shield's row and either the dome
    // is standing in one of the gaps or it is not. Armed or idle makes no
    // difference — see `grate.ts` for why that is the creature rather than an
    // omission — so this branch stands ahead of the ward's and never reaches
    // it. `resolveGrate` is the whole of what happens either way.
    if (c.kind === "grate") {
      if (c.row < guardRow) {
        survivors.push(c);
        continue;
      }
      if (resolveGrate(world, c, shipRow)) survivors.push(c);
      continue;
    }

    const wardable = isWardable(c.kind);
    // A body the shield answers is in reach of it a row before it is in reach
    // of the hull. Nothing else is: the shield has nothing to say to a slick
    // or a boss, so those are still only resolved on the ship's row. THE
    // WARDEN's line never arrives here at all — it hangs where the rim puts it
    // and falls no further (docs/spec/bosses.md 11.4). `isWardable` rather
    // than `isMeteorKind`, so THE VOLLEY is offered the same row: it is a rock
    // until the pair has warded it three times.
    if (c.row < (wardable ? guardRow : shipRow)) {
      survivors.push(c);
      continue;
    }

    const inColumn = wardable && occupiesCol(c, world.shieldCol);

    if (wardable && inColumn && guardArmed(world)) {
      // Turned. Most bodies leave the field here; a volley is hit back *up*
      // it and comes down again, which is the one thing about a ward that is
      // a fact about the creature rather than about the shield (`ward.ts`).
      if (wardTurns(world, c, guardRow)) survivors.push(c);
      continue;
    }

    // **Nothing is through on the beat it reaches the ship's row.** `fromRow`
    // is the row the picture is still gliding this body out of, so while it
    // came from above the ship it is *arriving* rather than arrived. Only on
    // the beat after — the one it is drawn standing still on the hull — is it
    // through, and until then the trigger and the cannon both still reach it.
    //
    // For a rock that is two beats of grace and they are one rule: a rock a
    // row above the ship is arriving on the ship's row, and a rock standing on
    // the ship's row is arriving at the plating, because the fall is clamped
    // there (`beat.ts`) and render/ spends that beat drawing the last tile
    // come down. The test used to name the shield, so a slick was taken off
    // the field the beat it *entered* the ship's row, a whole tile clear of
    // the hull, and was seen to burst in mid-air. The beat belongs to the
    // body: what it buys is the picture of the thing landing on what it breaks.
    if (c.fromRow < shipRow) {
      survivors.push(c);
      continue;
    }

    // A raisin is a corpse on a string and it breaks nothing. One reaches the
    // ship only because the pair ran out of thread to shoot, and the bead it
    // was has already been paid for — charging the hull for it a second time
    // would make finishing a strand worth nothing on the beat the rest of it
    // lands (`strand.ts`).
    if (beadIsSpent(c)) continue;

    if (wardable) {
      // It leaves the field here, so this is where it counts as a try — once,
      // whichever of the two rows it was finally answered on.
      world.guard.tries += 1;
      if (inColumn) world.guard.mistimed += 1;
      markMoment(world, false);
      damageSpan(world, c, world.cfg.damageMeteor);
    } else {
      // What it costs. `damageCreature` for everything that merely arrived,
      // and more for the two that did not: a charging ghost, head first, and a
      // carom nobody cracked open, which is a rock the shield was never
      // offered. One question, asked once (`impact.ts`).
      breachHull(world, c.col, c.kind, c.fromRow, impactDamage(world.cfg, c), c.color);
    }
  }
  world.creatures = survivors;
}

/**
 * A wall that has reached the shield's row. Returns whether it **stays on the
 * field**, which is the ordinary one more beat every arrival gets.
 *
 * Three answers, in the order the pair experiences them. The dome is standing
 * in a gap, and the wall goes over the ship: the guard record takes it as a
 * try and a deflection, because putting the shield in the right column is
 * exactly the half of the ward this creature keeps and the whole of the half
 * it asks for. Or the dome is in the way and the wall is still *arriving* —
 * `fromRow` above the ship — in which case it hangs there for one more beat
 * and the shield can still be moved under it, which is the same grace a rock
 * gets and the reason a call that lands late is still worth making. Or it is
 * neither, and the current earths itself through the dome: one breach, in the
 * shield's own column, because the ship is broken where the wall found it and
 * not along its whole width.
 */
function resolveGrate(world: World, c: Creature, shipRow: number): boolean {
  if (grateIsOpen(c, world.shieldCol)) {
    world.guard.tries += 1;
    world.guard.deflected += 1;
    markMoment(world, true);
    world.score += world.cfg.scoreDeflect;
    world.events.push({ type: "gratePass", col: world.shieldCol, row: c.row });
    return false;
  }
  if (c.fromRow < shipRow) return true;
  world.guard.tries += 1;
  // Right column, wrong moment is the failure class `mistimed` counts, and
  // there is no moment here to get wrong — so a wall that lands on the dome is
  // a try nobody met and nothing else. Counting it as mistimed would put a
  // timing lesson in the pair's balance sheet for a creature that has none.
  markMoment(world, false);
  breachHull(world, world.shieldCol, c.kind, c.fromRow, world.cfg.grateDamage);
  return false;
}

// **What a breach costs and how the hull mends** — `breachHull`, `damageSpan`,
// `hullPercent` and `regenerateHull` — is `hull-damage.ts` next door, cut out
// when THE GRATE took this file over its limit. What is left here is the one
// question this file was named for: what happens to a body that reached the
// ship. All four are re-exported below, so nothing that reached for one
// through this file had to move.
export { breachHull, hullPercent, regenerateHull } from "./hull-damage.js";
export { guardArmed, guardWindowTicks, shieldRow, ticksSinceGuard } from "./hull-guard.js";
