import { hullRow } from "./config.js";
import { type Creature, colSpan, isMeteorKind, occupiesCol, spanCenterCol } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * Check for impacts at the hull. Creatures that reach the hull row either
 * damage it (normal creatures and undeflected meteors) or are deflected
 * (meteors when the shield is in column and player 1 triggered it in time).
 *
 * Guard tries always increments for a meteor. Deflected, mistimed count the
 * two failure states that matter for learning (docs/spec/systems.md 5.8).
 */
export function resolveHull(world: World): void {
  const survivors: Creature[] = [];
  const shipRow = hullRow(world.cfg);

  for (const c of world.creatures) {
    if (c.row < shipRow) {
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
      world.guard.tries += 1;

      if (inColumn && inTime) {
        world.guard.deflected += 1;
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
      if (inColumn) world.guard.mistimed += 1;
      damageSpan(world, c, world.cfg.damageMeteor);
    } else {
      damage(world, c.col, c.kind, c.fromRow, world.cfg.damageCreature);
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

function damage(
  world: World,
  col: number,
  kind: Creature["kind"],
  fromRow: number,
  amount: number,
): void {
  applyHullDamage(world, amount);
  world.scars.push({ col, beat: world.beat });
  if (world.scars.length > world.cfg.maxScars) world.scars.shift();
  world.events.push({ type: "breach", col, damage: amount, span: 1, kind, fromRow });
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
    world.scars.push({ col, beat: world.beat });
    if (world.scars.length > world.cfg.maxScars) world.scars.shift();
  }
  world.events.push({
    type: "breach",
    col: spanCenterCol(c.kind, c.col),
    damage: amount,
    span,
    kind: c.kind,
    fromRow: c.fromRow,
  });
}
