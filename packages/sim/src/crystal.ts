import { markMoment, metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { type CrossDir, crossAwayFromWall, crossField } from "./cross.js";
import { guardArmed } from "./hull-guard.js";
import { livingKindForColor } from "./kinds.js";
import { spanOf } from "./span.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CRYSTAL: two bodies in one shell, three tiles wide, and the first
 * arrival that asks for **all four hands at one moment**.
 *
 * It is a slick and a bulb joined at a thin middle tile and armoured all the
 * way round — an hourglass lying on its side. The two ends steer it: it comes
 * in on THE CAROM's diagonal (`crystalCols` columns and `crystalRows` rows a
 * beat) and turns at the side walls the way a carom does, through the same
 * `crossField`. Nothing about the crossing is new; what is new is the answer.
 *
 * **Only the middle can be broken, and only while the ship's shield stands
 * under it.** The middle is authored one colour per wave, red or cyan, and it
 * is shown on both screens. A bolt of that colour up the middle lane, on a
 * tick the shield is armed *in that same lane*, breaks the join: the shell
 * comes off, and what is left is an ordinary red slick in the left lane and
 * an ordinary cyan bulb in the right, each falling straight down its own
 * column for the matching cannon. Two easy kills, bought with one hard shot.
 *
 * So the sentence is four things said at once: player 1 puts the cannon on
 * the middle and holds the shield trigger, player 2 puts the shield on the
 * same lane and fires the colour — the shield's column and the cannon's
 * column are two different controls held by two different seats, and this
 * is the one body that needs them in the same lane on the same tick.
 *
 * **And a wrong shot costs a row.** A bolt that meets the shell anywhere
 * else, or meets the middle without the shield standing there, or in the
 * wrong colour, is thrown off — and the whole body dives `crystalDiveRows`
 * toward the ship. Fourteen beats becomes thirteen with every guess, which
 * is what stops the pair firing up the middle on every tick and waiting for
 * the shield to happen to be there.
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
): { crystalDir: CrystalDir } {
  return { crystalDir: crossAwayFromWall(cfg.cols, col, span) };
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
 * Whether the ship's shield is standing under this one's middle **right
 * now**: the trigger's window is open and the plate is in that lane. One
 * question with one answer, asked by the rule below and by render for the
 * light on the join — two readings of it that disagreed would light a body
 * a shot then bounces off.
 */
export function crystalHeld(world: World, c: Creature): boolean {
  return guardArmed(world) && world.shieldCol === crystalMiddleCol(c);
}

/** One beat of it, in place of the fall: `stepCarom`'s arrangement exactly. */
export function stepCrystal(world: World, c: Creature): void {
  const cfg = world.cfg;
  c.row += cfg.crystalRows;
  const step = crossField(cfg.cols, c.col, spanOf(c), crystalHeading(c), cfg.crystalCols);
  c.col = step.col;
  c.crystalDir = step.dir;
  if (step.turned) {
    world.events.push({ type: "crystalBounce", col: step.col, row: c.row, dir: step.dir });
  }
}

/** What a whole one costs the hull — `caromImpactDamage`'s reason. */
export function crystalImpactDamage(cfg: SimConfig): number {
  return cfg.damageCrystal;
}

/**
 * A shot met a crystal. Returns whether the bullet goes on, and it never
 * does: the shell stops a lance as a rock does.
 *
 * Three wrong answers and one right one. The wrong colour up a held middle is
 * a colour miss and is booked as one — both screens can read the join. The
 * other two are refusals rather than misses, on `claspStruck`'s terms: a
 * bolt into the shell, or into a middle nothing is holding, was never a
 * colour question. All three dive the body a row, which is the price.
 */
export function crystalStruck(world: World, b: Bullet, hit: Creature): boolean {
  const cfg = world.cfg;
  const middle = crystalMiddleCol(hit);
  const held = b.col === middle && crystalHeld(world, hit);
  if (!held || b.color !== hit.color) {
    if (held) missedColor(world);
    else markMoment(world, false);
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    // Where it was, then the dive — written the way `recoilStruck` writes a
    // knock-back, so render glides the row it just lost rather than cutting
    // to it.
    hit.fromRow = hit.row;
    hit.row += cfg.crystalDiveRows;
    world.events.push({ type: "crystalDive", col: middle, row: hit.row });
    return false;
  }

  metColor(world);
  world.score += cfg.scoreCrystalSplit;
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
  return false;
}
