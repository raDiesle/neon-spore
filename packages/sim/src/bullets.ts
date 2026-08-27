import { resolve } from "./bullet-hit.js";
import { hullRow, type SimConfig, ticksPerBeat } from "./config.js";
import { endPrime, lanceReady, priming } from "./lance.js";
import { firstPodAlong, freePod } from "./pods.js";
import { queenOccupiesCol } from "./queen-mark.js";
import { type Bullet, type Color, type Creature, occupiesCol } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * Shots sit on tile centres and cross exactly `bulletTilesPerBeat` tiles per
 * beat. Both hang off the beat, never off each other — otherwise a faster
 * bullet quietly turns the cannon into a continuous stream (docs/spec/systems.md 5.8).
 *
 * At the defaults that is 12 tiles over 75 ticks, so a bullet gains exactly
 * 160 thousandths of a tile per tick and crosses one every 6.25 ticks. The
 * remainder is carried in `subMilli` and never rounded away.
 */
export function fire(world: World, color: Color): void {
  if (world.over) return;
  const cooldown = Math.round(world.cfg.fireEveryBeats * ticksPerBeat(world.cfg));
  // A shot the cooldown refuses never leaves the lobe, so it takes nothing
  // with it either — the charge is only ever spent by a shot that goes out.
  if (world.tick - world.lastFireTick < cooldown) return;
  world.lastFireTick = world.tick;
  // Everything leaves through the same lobe. A full one sends a lance; one
  // that is still filling sends an ordinary shot and loses what was in it,
  // which is the half of the coupling player 2 holds (`lance.ts`).
  const lance = lanceReady(world);
  const spilled = priming(world) && !lance;
  endPrime(world);
  world.bullets.push({
    id: world.nextId++,
    col: world.cannonCol,
    row: hullRow(world.cfg) - 1,
    subMilli: 0,
    color,
    lance,
    pierced: 0,
  });
  world.events.push({ type: "fire", col: world.cannonCol, color, lance });
  if (spilled) world.events.push({ type: "lanceSpilled", col: world.cannonCol });
}

/**
 * How fast this shot travels, in tiles per beat. The only difference a lance
 * makes to its own flight — everything else about the sweep is shared.
 */
function tilesPerBeat(cfg: SimConfig, b: Bullet): number {
  return b.lance ? cfg.lanceTilesPerBeat : cfg.bulletTilesPerBeat;
}

/**
 * Where a bullet stands, in thousandths of a tile counted downwards from row 0.
 * Exactly what render/ draws — `row - subMilli / 1000`.
 */
function bulletMilli(b: Bullet): number {
  return b.row * MILLI - b.subMilli;
}

/**
 * Where a creature stands, in the same units. A creature glides one tile per
 * beat, so between two beats it is genuinely between two rows, and that is the
 * position the eye judges a hit by — `fromRow + (row - fromRow) * beatPhase`,
 * the line render/ draws it on (packages/render/src/creatures.ts).
 *
 * Collision used to compare whole rows instead, and two shots in a hundred
 * went straight through: a creature that dropped a row in the same tick the
 * bullet left it swapped places with the shot without either ever noticing.
 */
function creatureMilli(world: World, c: Creature): number {
  const tpb = ticksPerBeat(world.cfg);
  const phase = world.tick % tpb;
  return c.fromRow * MILLI + Math.round(((c.row - c.fromRow) * phase * MILLI) / tpb);
}

export function advanceBullets(world: World): void {
  const alive: Bullet[] = [];
  for (const b of world.bullets) if (sweep(world, b)) alive.push(b);
  world.bullets = alive;
}

/**
 * One tick of one shot, from where it stands to where it would be. False when
 * the shot is spent and does not survive the tick.
 *
 * The loop is the lance: an ordinary shot resolves at most one body and is
 * gone, but a lance that goes through one carries on along the *same* sweep,
 * because two bodies a tile apart can both sit inside a single tick of travel
 * and a lance that only ever took the lowest of them would need three ticks to
 * do what it does in one. Each turn of the loop either ends the shot or
 * removes a creature from the field, so it cannot run forever.
 */
function sweep(world: World, b: Bullet): boolean {
  const stepMilli = Math.round((tilesPerBeat(world.cfg, b) * MILLI) / ticksPerBeat(world.cfg));
  let from = bulletMilli(b);
  const to = from - stepMilli;

  for (;;) {
    // The shot sweeps a segment every tick, so nothing can slip between two
    // samples — one tile of box against 160 thousandths of travel.
    const hit = firstAlong(world, b, from, to);
    const pod = firstPodAlong(world, b.col, from, to);
    // Both can be inside the same sweep. The shot stops at whichever stands
    // lower in the column, because that is the one it reaches first.
    if (pod && (!hit || pod.rowMilli > creatureMilli(world, hit))) {
      freePod(world, pod);
      return false;
    }
    if (!hit) break;
    // Where it met that body, so a lance carries on from there and cannot
    // meet the same stretch of column twice.
    const met = creatureMilli(world, hit);
    if (!resolve(world, b, hit)) return false;
    from = met;
  }

  if (to < 0) return false; // gone past the top of the field
  b.row = Math.ceil(to / MILLI);
  b.subMilli = b.row * MILLI - to;
  return true;
}

/**
 * The first creature the swept segment `from..to` touches, or undefined.
 *
 * Every creature carries an invisible box, one column wide and
 * `hitHeightMilli` tall, centred on it. Shots only ever travel straight up the
 * middle of a column, so the column is the whole of the horizontal test and
 * the shape of the creature never enters into it — a lobe that leans out of
 * its column is drawing, not hitbox.
 *
 * The queen is the one exception: her own column carries nothing, and the
 * two columns that do (`queenOccupiesCol`) are not a span either — nothing
 * stands in the tile between them. `occupiesCol`/`colSpan` cannot be asked
 * to describe that, so she gets her own column test instead of the shared one.
 */
function firstAlong(world: World, b: Bullet, from: number, to: number): Creature | undefined {
  const half = Math.round(world.cfg.hitHeightMilli / 2);
  let best: Creature | undefined;
  let bestMilli = 0;
  for (const c of world.creatures) {
    // A tether is not shootable, and it does not stop a shot either: it is a
    // line hanging in a column the pair still has to fire up. It is answered
    // by a hand and by nothing else (docs/spec/bosses.md 11.4).
    if (c.kind === "tether") continue;
    const inCol = c.kind === "queen" ? queenOccupiesCol(c.col, b.col) : occupiesCol(c, b.col);
    if (!inCol) continue;
    const pos = creatureMilli(world, c);
    if (pos - half > from || pos + half < to) continue;
    // Several boxes can overlap the sweep; the shot stops at the lowest one,
    // the one it reaches first.
    if (!best || pos > bestMilli) {
      best = c;
      bestMilli = pos;
    }
  }
  return best;
}
