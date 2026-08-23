import { hullRow, ticksPerBeat } from "./config.js";
import type { Bullet, Color, Creature } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * Shots sit on tile centres and cross exactly `bulletTilesPerBeat` tiles per
 * beat. Both hang off the beat, never off each other — otherwise a faster
 * bullet quietly turns the cannon into a continuous stream (spec 5.8).
 *
 * At the defaults that is 12 tiles over 75 ticks, so a bullet gains exactly
 * 160 thousandths of a tile per tick and crosses one every 6.25 ticks. The
 * remainder is carried in `subMilli` and never rounded away.
 */
export function fire(world: World, color: Color): void {
  if (world.over) return;
  const cooldown = Math.round(world.cfg.fireEveryBeats * ticksPerBeat(world.cfg));
  if (world.tick - world.lastFireTick < cooldown) return;
  world.lastFireTick = world.tick;
  world.bullets.push({
    id: world.nextId++,
    col: world.cannonCol,
    row: hullRow(world.cfg) - 1,
    subMilli: 0,
    color,
  });
  world.events.push({ type: "fire", col: world.cannonCol, color });
}

export function advanceBullets(world: World): void {
  const stepMilli = Math.round(
    (world.cfg.bulletTilesPerBeat * MILLI) / ticksPerBeat(world.cfg),
  );
  const alive: Bullet[] = [];

  for (const b of world.bullets) {
    b.subMilli += stepMilli;
    let consumed = false;
    while (b.subMilli >= MILLI) {
      b.subMilli -= MILLI;
      if (resolveAt(world, b)) {
        consumed = true;
        break;
      }
      b.row -= 1;
      if (b.row < 0) {
        consumed = true;
        break;
      }
    }
    if (!consumed) alive.push(b);
  }
  world.bullets = alive;
}

/** True when the bullet is spent on the tile it currently occupies. */
function resolveAt(world: World, b: Bullet): boolean {
  const hit = world.creatures.find((c) => c.col === b.col && c.row === b.row);
  if (!hit) return false;

  if (hit.kind === "meteor") {
    // A rock cannot be broken, because it does not live. The shot leaves a
    // crater and nothing else — the rule made visible (spec 9).
    hit.holes = Math.min(world.cfg.maxHoles, hit.holes + 1);
    world.events.push({ type: "hole", col: hit.col, row: hit.row });
    return true;
  }
  if (hit.color !== b.color) {
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return true;
  }

  // Matching ammunition resonates the light organ until it bursts.
  world.score += world.cfg.scoreDestroy;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: hit.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
  return true;
}
