import { markMoment } from "./balance.js";
import { hullRow, type SimConfig } from "./config.js";
import { type Creature, colSpan, isMeteorKind, occupiesCol, spanCenterCol } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * The row the shield answers a rock on: one above the ship's own.
 *
 * The shield is not painted on the hull, it stands off it — a closed dome
 * whose crown sits about a third of a tile above the hull row's centre, which
 * is roughly where a rock's underside first touches something. So a rock that
 * is only tested when it stands *on* the ship has already gone through the
 * thing that was supposed to turn it, and both of the things the owner
 * reported follow from that: the trigger does nothing at the moment the rock
 * meets the shield, and a rock that is turned turns from inside it.
 *
 * A rule rather than `hullRow(cfg) - 1` written out where it is needed —
 * that shape is a second copy of where the shield is, and it will drift.
 */
export function shieldRow(cfg: SimConfig): number {
  return Math.max(0, hullRow(cfg) - 1);
}

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
 * Guard tries always increments for a meteor, once, on the beat it leaves the
 * field — turned away or not. Deflected and mistimed count the two failure
 * states that matter for learning (docs/spec/systems.md 5.8).
 */
export function resolveHull(world: World): void {
  const survivors: Creature[] = [];
  const shipRow = hullRow(world.cfg);
  const guardRow = shieldRow(world.cfg);

  for (const c of world.creatures) {
    // A rock is in reach of the shield a row before it is in reach of the
    // hull. Nothing else is: the shield has nothing to say to a slick or a
    // boss, so those are still only resolved on the ship's row. THE WARDEN's
    // line never arrives here at all — it hangs where the rim puts it and
    // falls no further (docs/spec/bosses.md 11.4).
    if (c.row < (isMeteorKind(c.kind) ? guardRow : shipRow)) {
      survivors.push(c);
      continue;
    }

    if (isMeteorKind(c.kind)) {
      const inColumn = occupiesCol(c, world.shieldCol);
      const windowTicks = Math.round((world.cfg.guardWindowMs / 1000) * world.cfg.tickHz);
      // A ward frees player 1 from the *timing* only, not from the aiming — the
      // shield still has to be in the meteor's column, so player 2's job is
      // untouched.
      const inTime =
        (world.tick - world.guardTick <= windowTicks && world.guardTick <= world.tick) ||
        world.tick <= world.wardUntilTick;

      if (inColumn && inTime) {
        world.guard.tries += 1;
        world.guard.deflected += 1;
        markMoment(world, true);
        world.score += world.cfg.scoreDeflect;
        world.events.push({
          type: "deflect",
          col: spanCenterCol(c.kind, c.col),
          span: colSpan(c.kind),
          kind: c.kind,
          fromRow: c.fromRow,
        });
        continue;
      }
      // Nobody turned it at the surface, so it is inside the shield now. That
      // is not the end of it: the ship's own row is still a beat away for a
      // rock that falls one tile a beat, and a trigger that arrives in that
      // beat still saves the hull, exactly as it did before this row moved.
      // Nothing that used to be answerable stopped being answerable.
      if (c.row < shipRow) {
        survivors.push(c);
        continue;
      }
      // It leaves the field here, so this is where it counts as a try — once,
      // whichever of the two rows it was finally answered on.
      world.guard.tries += 1;
      if (inColumn) world.guard.mistimed += 1;
      markMoment(world, false);
      damageSpan(world, c, world.cfg.damageMeteor);
    } else {
      breachHull(world, c.col, c.kind, c.fromRow, world.cfg.damageCreature);
    }
  }
  world.creatures = survivors;
}

/** Hull damage, shared by a single-column hit and a spanning one. */
function applyHullDamage(world: World, amount: number): void {
  if (world.cfg.hullInvulnerable) return;
  world.hullMilli = Math.max(0, world.hullMilli - amount * MILLI);
  if (world.hullMilli <= 0) world.over = true;
}

/**
 * One column of the hull, broken. The whole of what "something got through"
 * means: the damage, the scar that stays, and the `breach` event render/ hangs
 * the impact on.
 *
 * Exported because a creature reaching the hull is no longer the only way this
 * happens — THE MIRROR answers a wrong step by breaking the hull directly
 * (`mirror.ts`), and it must break it the same way, with the same event, or
 * the picture and the record of the damage would quietly diverge.
 */
export function breachHull(
  world: World,
  col: number,
  kind: Creature["kind"],
  fromRow: number,
  amount: number,
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
  const span = colSpan(c.kind);
  for (let col = c.col; col < c.col + span; col++) {
    world.scars.push({ col, beat: world.beat, kind: c.kind });
    if (world.scars.length > world.cfg.maxScars) world.scars.shift();
  }
  world.events.push({
    type: "breach",
    col: spanCenterCol(c.kind, c.col),
    damage: amount,
    span,
    kind: c.kind,
    fromRow: c.fromRow,
    beat: world.beat,
  });
}
