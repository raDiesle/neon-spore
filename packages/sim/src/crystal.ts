import { markMoment, metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { type CrossDir, crossAwayFromWall, crossField } from "./cross.js";
import { guardArmed } from "./hull-guard.js";
import { livingKindForColor } from "./kinds.js";
import { creatureLane } from "./mid-beat.js";
import { occupiesLane, spanOf } from "./span.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CRYSTAL: two bodies in one shell, three tiles wide, and the first
 * arrival that asks for **all four hands at one moment**.
 *
 * It is a slick and a bulb joined at a thin middle tile and armoured all the
 * way round — an hourglass lying on its side. The two ends steer it, and they
 * steer it **one axis at a time**: `crystalFallBeats` beats straight down the
 * column it is standing in, then `crystalSlideBeats` beats sideways with no
 * fall at all, turning at the side walls through the same `crossField` a carom
 * turns at, and round again.
 *
 * It used to take THE CAROM's diagonal, a lane *and* a row on every beat. The
 * owner, 17 September 2026: *"Change the animation so that it stays in a
 * column, then quickly moves around two beats 2 tiles horizontal, then again
 * vertical. So either vertical or horizontal."* The diagonal is the crossing
 * this body can least afford, and the sentence below says why: four hands have
 * to agree on one lane, and on a diagonal the lane they agreed on expired on
 * the beat they agreed it. A column held for four beats is a lane there is
 * time to say out loud, and the two beats of sideways are the beats the pair
 * spends watching rather than talking.
 *
 * **THE CRYSTAL's own wave moved with the rule.** A crossing that spends two
 * beats in six not descending takes twenty beats to reach the ship where it
 * used to take fourteen, so its four arrivals went from fourteen beats apart
 * to twenty. The shape is unchanged — three alone, then a pair six apart at
 * the end — and the spacing is what keeps *alone* true: two of these at once
 * is two three-tile bodies on eleven columns, each wanting the plate and the
 * cannon on the same beat, and the wave's own sentence is singular.
 *
 * **Only the middle can be broken, and only while the ship's shield stands
 * armed under the body.** The middle is authored one colour per wave, red or
 * cyan, and it is shown on both screens. A bolt of that colour up the middle
 * lane, on a tick the shield is armed under *any* of the three lanes, breaks
 * the join: the shell comes off, and what is left is an ordinary red slick
 * in the left lane and an ordinary cyan bulb in the right, each falling
 * straight down its own column for the matching cannon. Two easy kills,
 * bought with one hard shot.
 *
 * So the sentence is four things said at once: player 1 puts the cannon on
 * the middle and holds the shield trigger, player 2 puts the shield under
 * the body and fires the colour — the shield's column and the cannon's
 * column are two different controls held by two different seats, and this
 * is the one body that needs them under the same thing on the same tick.
 * The shield answers for the whole width and the shot for the middle only:
 * the owner, 12 September 2026, *it should react on the shield when in the
 * same vertical as the whole ship, to make it easier* — the harder half of
 * the answer is the shot, and a plate that had to find one lane of three
 * while the body crossed a lane a beat was two hard halves.
 *
 * **A wrong shot costs nothing but the shot.** A bolt that meets the shell
 * anywhere else, or meets the middle without the shield standing under the
 * body, or in the wrong colour, is caught and thrown off: a spark, a sound,
 * and the body goes on exactly as it was. It used to dive a row for every
 * guess (`crystalDiveRows`); the owner took that out — *when hit wrong, it
 * shouldn't fall faster, just nothing* — and the dive is written up on the
 * NOT BUILT YET page (`docs/spec/ideas.md`, Mechanics) should a wave ever
 * want a crystal that punishes guessing.
 *
 * What lands whole costs `damageCrystal`, the carom's figure: the shield
 * alone was never able to turn it (`impact.ts`, `hull.ts`).
 */

/** Which way across the field it is going, on `CaromDir`'s terms. */
export type CrystalDir = CrossDir;

/** Read this, never `crystalDir` by hand — `caromHeading`'s reason. */
export function crystalHeading(c: Creature): CrystalDir {
  return c.crystalDir ?? 1;
}

/** The fields one arrives with: pointed away from the nearer wall. */
export function crystalOnSpawn(
  cfg: SimConfig,
  col: number,
  span: number,
): { crystalDir: CrystalDir; crystalLeg: number } {
  // Leg nought, which is the first beat of a fall: a body arrives holding a
  // column, so the pair is given a lane to name before it is given a move.
  return { crystalDir: crossAwayFromWall(cfg.cols, col, span), crystalLeg: 0 };
}

/**
 * Whether the next beat of this one is a row down rather than a column across.
 * Read the leg through this, never `crystalLeg` by hand — `crystalHeading`'s
 * reason: render draws the fall and the step writes it, and two copies of the
 * fallback is how the picture and the world come to disagree about which of
 * the two a beat was.
 */
export function crystalFalling(cfg: SimConfig, c: Creature): boolean {
  return crystalLegOf(cfg, c) < cfg.crystalFallBeats;
}

/** How many beats into the cycle it is, folded into the cycle's own range so
 * an absent leg and a body that has just come round read alike. */
function crystalLegOf(cfg: SimConfig, c: Creature): number {
  const cycle = crystalCycle(cfg);
  return (((c.crystalLeg ?? 0) % cycle) + cycle) % cycle;
}

/** The whole fall-then-slide cycle, in beats. At least one, so a config with
 * both legs at nought leaves a body falling rather than looping forever. */
export function crystalCycle(cfg: SimConfig): number {
  return Math.max(1, cfg.crystalFallBeats + cfg.crystalSlideBeats);
}

/**
 * The one tile a shot can break: the middle of the span. `col` is the
 * leftmost column a body occupies (`occupiesCol`), so for a three-wide body
 * the middle is one to its right. Call it rather than writing `c.col + 1`:
 * render lights the join, the shield is tested against it and the bolt is
 * tested against it, and three copies of "+ 1" is how they come to light one
 * lane and break another.
 */
export function crystalMiddleCol(c: Creature): number {
  return c.col + (spanOf(c) - 1) / 2;
}

/**
 * The same tile **on this tick**: the middle of the lane the body is drawn
 * in, part-way across the beat (`creatureLane`). A shot is found against
 * that lane (`bullets.ts`, `firstAlong`), so the shot's own test has to ask
 * about the same body — with the middle read off `col` alone, a bolt up the
 * drawn middle in the first half of a beat met the lane the body was leaving
 * and was caught for it, one column from where both screens showed the join.
 */
export function crystalMiddleLane(world: World, c: Creature): number {
  return creatureLane(world, c) + (spanOf(c) - 1) / 2;
}

/**
 * Whether the ship's shield is standing under this one **right now**, armed
 * or not: the plate is in one of the lanes the body is *drawn* across on this
 * tick (`creatureLane`, the lane a bolt is found against). Render lights the
 * link off this and `claspResonanceIn` grows the ship's arcs off it, so the
 * green comes on under the body the pair can see and not under the one the
 * simulation has already written a lane on.
 */
export function crystalUnder(world: World, c: Creature): boolean {
  return occupiesLane(creatureLane(world, c), spanOf(c), world.shieldCol);
}

/**
 * The whole of the shield's half: standing under the body **and** armed —
 * the trigger's window is open. One question with one answer, asked by the
 * rule below and by render for the gap it opens in the body's own field — two
 * readings of it that disagreed would open a body a shot then bounces off.
 */
export function crystalHeld(world: World, c: Creature): boolean {
  return guardArmed(world) && crystalUnder(world, c);
}

/**
 * One beat of it, in place of the fall — and it is **one or the other**, never
 * both. A beat of a fall drops `crystalRows` and touches no column; a beat of
 * a slide crosses `crystalCols` and touches no row.
 *
 * The leg is advanced first and read before it is advanced, so the beat a body
 * arrives on is the first beat of its fall and not the second.
 *
 * A slide that reaches a wall turns there rather than reflecting off it
 * (`crossField`), which means a slide begun against a wall spends its first
 * beat turning and covers a tile rather than two. That is the crossing rule
 * the whole field is built on — a body between two columns is a body neither
 * player can name — and not a case to special-case out.
 */
export function stepCrystal(world: World, c: Creature): void {
  const cfg = world.cfg;
  const falling = crystalFalling(cfg, c);
  c.crystalLeg = (crystalLegOf(cfg, c) + 1) % crystalCycle(cfg);
  if (falling) {
    c.row += cfg.crystalRows;
    return;
  }
  const step = crossField(cfg.cols, c.col, spanOf(c), crystalHeading(c), cfg.crystalCols);
  c.col = step.col;
  c.crystalDir = step.dir;
  if (step.turned) {
    world.events.push({ type: "crystalBounce", col: step.col, row: c.row, dir: step.dir });
  }
}

/**
 * A shot met a crystal. Returns whether the bullet goes on, and it never
 * does: the shell stops a lance as a rock does.
 *
 * Three wrong answers and one right one. The wrong colour up a held middle is
 * a colour miss and is booked as one — both screens can read the join. The
 * other two are refusals rather than misses, on `claspStruck`'s terms: a
 * bolt into the shell, or into a middle nothing is holding, was never a
 * colour question. All three leave the body as it was: the shell caught the
 * shot, and that is the whole of it (`crystalCatch`).
 */
export function crystalStruck(world: World, b: Bullet, hit: Creature): boolean {
  const middle = crystalMiddleLane(world, hit);
  const held = b.col === middle && crystalHeld(world, hit);
  if (!held || b.color !== hit.color) {
    if (held) missedColor(world);
    else markMoment(world, false);
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    world.events.push({ type: "crystalCatch", col: middle, row: hit.row });
    return false;
  }

  metColor(world);
  // The width, read before the kind changes: a slick answers one.
  const span = spanOf(hit);
  world.events.push({ type: "crystalSplit", col: middle, row: hit.row, color: b.color });
  // The right half first, built off the whole while it is still whole: a
  // cyan bulb in the rightmost lane of the span, on the same row and with the
  // same glide, so it starts where the pair saw it and not a tile away.
  const right: Creature = {
    id: world.nextId++,
    kind: livingKindForColor("cyan"),
    col: hit.col + span - 1,
    row: hit.row,
    fromRow: hit.fromRow,
    ...(hit.fromCol === undefined ? {} : { fromCol: hit.fromCol + span - 1 }),
    color: "cyan",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };
  world.creatures.push(right);
  // And the left half is the body that was struck, now a red slick in the
  // leftmost lane — `col` already names it. The crossing stops being a fact
  // about it, for `caromStruck`'s reason: the fingerprint of a slick is the
  // fingerprint of a slick, whatever made it.
  hit.kind = livingKindForColor("red");
  hit.color = "red";
  hit.crystalDir = undefined;
  hit.crystalLeg = undefined;
  return false;
}
