import { markMoment } from "./balance.js";
import { hullRow, ticksPerBeat } from "./config.js";
import { firstPodAlong, freePod } from "./pods.js";
import { queenOccupiesCol } from "./queen-mark.js";
import { type Bullet, type Color, type Creature, isMeteorKind, occupiesCol } from "./types.js";
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
  const stepMilli = Math.round((world.cfg.bulletTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
  const alive: Bullet[] = [];

  for (const b of world.bullets) {
    const from = bulletMilli(b);
    const to = from - stepMilli;
    // The shot sweeps a segment every tick, so nothing can slip between two
    // samples — one tile of box against 160 thousandths of travel.
    const hit = firstAlong(world, b, from, to);
    const pod = firstPodAlong(world, b.col, from, to);
    // Both can be inside the same sweep. The shot stops at whichever stands
    // lower in the column, because that is the one it reaches first.
    if (pod && (!hit || pod.rowMilli > creatureMilli(world, hit))) {
      freePod(world, pod);
      continue;
    }
    if (hit) {
      resolve(world, b, hit);
      continue;
    }
    if (to < 0) continue; // gone past the top of the field
    b.row = Math.ceil(to / MILLI);
    b.subMilli = b.row * MILLI - to;
    alive.push(b);
  }
  world.bullets = alive;
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

/** Spend the bullet on the creature it met. */
function resolve(world: World, b: Bullet, hit: Creature): void {
  if (isMeteorKind(hit.kind)) {
    // A rock cannot be broken, because it does not live. The shot leaves a
    // crater and nothing else — the rule made visible (docs/spec/graphics.md).
    hit.holes = Math.min(world.cfg.maxHoles, hit.holes + 1);
    world.events.push({ type: "hole", col: hit.col, row: hit.row });
    return;
  }
  if (hit.kind === "queen") {
    resolveQueen(world, b, hit);
    return;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return;
  }

  // Matching ammunition resonates the light organ until it bursts.
  metColor(world);
  world.score += world.cfg.scoreDestroy;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: hit.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
}

/**
 * The queen wears her petals as armour. A shot that matches her open colour,
 * in the one column of the two marks that is actually real this bloom,
 * takes one; anything else — the wrong colour, the wrong side, or a shot at
 * either mark while neither is open — skids off. The last petal brings her
 * down.
 *
 * `b.col`, not `hit.col`, is what the events below carry: `hit.col` is her
 * own centre column, where nothing stands, and a spark or a reject drawn
 * there instead of at the mark a player actually aimed at is drawn nowhere
 * a player was looking.
 */
function resolveQueen(world: World, b: Bullet, hit: Creature): void {
  if (hit.color === null || hit.color !== b.color) {
    // A colour that could never have matched. Which of the two marks it went
    // up does not change that, so it is the colour balance's to carry.
    missedColor(world);
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }
  const weakSide = world.boss?.weakSide ?? 0;
  if (b.col !== hit.col + weakSide) {
    // Right colour, wrong mark — and deliberately *not* a colour miss. The
    // ammunition was correct; what failed was the side, which is the other
    // player's half of the call (`queen-mark.ts`). Charging it to the colour
    // balance would read the failure to the wrong player.
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }

  metColor(world);
  hit.petals -= 1;
  world.score += world.cfg.scoreQueenPetal;
  hit.color = null;
  if (world.boss) world.boss.closeBeat = world.beat;
  world.events.push({ type: "petal", col: b.col, row: hit.row, left: hit.petals });

  if (hit.petals <= 0) {
    world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
    world.score += world.cfg.scoreQueenDown;
    world.boss = null;
    world.events.push({ type: "queenDown", col: b.col, row: hit.row });
  }
}

/**
 * A shot met a creature in its own colour. A joint moment: player 2 is the
 * only one who can see the colour and player 1 is the only one who can load
 * it, so the shot is the pair agreeing out loud (docs/spec/couplings.md).
 *
 * A rock is not counted either way — it has no colour to get right.
 */
function metColor(world: World): void {
  world.balance.colorHits += 1;
  markMoment(world, true);
}

/** The same moment, missed: the wrong colour went up the column. */
function missedColor(world: World): void {
  world.balance.colorMisses += 1;
  markMoment(world, false);
}
