import { markMoment } from "./balance.js";
import { hullRow } from "./config.js";
import { guardArmed, shieldRow } from "./hull-guard.js";
import { impactDamage } from "./impact.js";
import { beadIsSpent } from "./strand.js";
import {
  bodyCenterCol,
  type Color,
  type Creature,
  isWardable,
  occupiesCol,
  spanOf,
} from "./types.js";
import { wardTurns } from "./ward.js";

import { MILLI, type World } from "./world.js";

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
  applyHullDamage(world, amount);
  world.scars.push({ col, beat: world.beat, kind });
  if (world.scars.length > world.cfg.maxScars) world.scars.shift();
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
function damageSpan(world: World, c: Creature, amount: number): void {
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

export { guardArmed, guardWindowTicks, shieldRow, ticksSinceGuard } from "./hull-guard.js";
