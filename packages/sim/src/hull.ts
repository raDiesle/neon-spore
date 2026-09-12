import { markMoment } from "./balance.js";
import { clingLands, isClingKind } from "./cling.js";
import { hullRow } from "./config.js";
import { fenceIsOpen } from "./fence.js";
import { gumLands } from "./gum.js";
import { breachHull, breachUnscarred, damageSpan } from "./hull-damage.js";
import { guardArmed, shieldRow } from "./hull-guard.js";
import { impactWeight } from "./impact.js";
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
    // **THE FENCE, and the only body on this field the trigger cannot answer.**
    // It is the width of the field, so there is no column to be in and no
    // moment to be on: the wall comes down onto the ship and either the dome
    // is standing in one of the gaps or it is not. Armed or idle makes no
    // difference — see `fence.ts` for why that is the creature rather than an
    // omission — so this branch stands ahead of the ward's and never reaches
    // it. `resolveFence` is the whole of what happens either way.
    //
    // `shipRow` and not the shield's row a tile above it, which is where this
    // used to end. A wall is not a rock the dome turns at its own surface: it
    // goes *over* the ship, and the owner reported the picture that came of
    // resolving it early — the wire vanishing two tiles clear of the hull,
    // before it had touched anything. It falls all the way down now and is
    // answered on the beat it is drawn resting on the ship, which is the rule
    // every other body on this field already follows.
    if (c.kind === "fence") {
      if (c.row < shipRow) {
        survivors.push(c);
        continue;
      }
      if (resolveFence(world, c, shipRow)) survivors.push(c);
      continue;
    }

    // **THE GUM never breaks the hull and never leaves this loop.** It comes
    // down like everything else and, on the beat it is drawn standing on the
    // ship, it sticks — `gumLands` says so once — and it stays a survivor
    // until a hand flings it (`gum.ts`). Before the ward's question, because
    // the shield has nothing to say to it and the fence's branch above is the
    // shape of that: a body with an answer of its own.
    if (c.kind === "gum") {
      if (c.row >= shipRow) gumLands(world, c, shipRow);
      survivors.push(c);
      continue;
    }
    // And THE LIMPET and THE LEECH, on the gum's terms exactly: neither
    // breaks the hull, the shield has nothing to say to either, and on the
    // beat one is drawn standing on the ship it takes its control
    // (`cling.ts`).
    if (isClingKind(c.kind)) {
      if (c.row >= shipRow) clingLands(world, c, shipRow);
      survivors.push(c);
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
      damageSpan(world, c, "heavy");
    } else {
      // How it sounds. Light for everything that merely arrived, and heavy
      // for the ones that did not: a charging ghost, head first, and a carom
      // nobody cracked open, which is a rock the shield was never offered.
      // One question, asked once (`impact.ts`).
      breachHull(world, c.col, c.kind, c.fromRow, impactWeight(world.cfg, c), c.color);
    }
  }
  world.creatures = survivors;
}

/**
 * A wall that has reached the ship's row. Returns whether it **stays on the
 * field**, which is the ordinary one more beat every arrival gets.
 *
 * **The grace comes first, and it comes before either answer.** While
 * `fromRow` is above the ship the wall is still *arriving*: the picture is
 * gliding it down onto the hull, the shield can still be slid under it, and
 * neither the pass nor the breach has happened yet. That gate used to stand
 * between the two answers rather than in front of them, so a dome already in a
 * gap took the wall off the field a whole tile short of the ship — the wire
 * simply stopped existing in mid-air, which is what the owner reported. Both
 * answers are given on the same beat now: the one the pair watches the wall
 * come to rest on them.
 *
 * Then two answers. The dome is standing in a gap, and the wall goes over the
 * ship: the guard record takes it as a try and a deflection, because putting
 * the shield in the right column is exactly the half of the ward this creature
 * keeps and the whole of the half it asks for. Or the dome is in the way and
 * the current earths itself through it: one breach, in the shield's own
 * column, because the ship is broken where the wall found it and not along its
 * whole width.
 *
 * **`breachUnscarred`, so nothing cracks in the plating.** A wire does not
 * strike a hull, it discharges into the thing standing in it, and the owner
 * asked for the damage to read that way — the shield's own line put out in
 * places rather than a tear in the skin (`shield-outage.ts` in render/). The
 * cost is `fenceDamage` either way; only the picture of it moved.
 */
function resolveFence(world: World, c: Creature, shipRow: number): boolean {
  if (c.fromRow < shipRow) return true;
  if (fenceIsOpen(c, world.shieldCol)) {
    world.guard.tries += 1;
    world.guard.deflected += 1;
    markMoment(world, true);
    world.events.push({ type: "fencePass", col: world.shieldCol, row: c.row });
    return false;
  }
  world.guard.tries += 1;
  // Right column, wrong moment is the failure class `mistimed` counts, and
  // there is no moment here to get wrong — so a wall that lands on the dome is
  // a try nobody met and nothing else. Counting it as mistimed would put a
  // timing lesson in the pair's balance sheet for a creature that has none.
  markMoment(world, false);
  breachUnscarred(world, world.shieldCol, c.kind, c.fromRow, "heavy");
  return false;
}

// **What a breach is** — `breachHull`, `breachUnscarred`, `damageSpan` — is
// `hull-damage.ts` next door, cut out when THE FENCE took this file over its
// limit. What is left here is the one question this file was named for: what
// happens to a body that reached the ship. Re-exported below, so nothing that
// reached for one through this file had to move.
export { type BreachWeight, breachHull, breachUnscarred } from "./hull-damage.js";
export { guardArmed, guardWindowTicks, shieldRow, ticksSinceGuard } from "./hull-guard.js";
