import { hullRow, midCol } from "./config.js";
import { removeCreature } from "./field.js";
import { isMeteorKind, livingKindForColor } from "./kinds.js";
import {
  LAMPREY_TAIL_END,
  LAMPREY_TRAIL,
  type LampreyFood,
  type LampreyState,
  lampreyStep,
} from "./lamprey.js";
import { lampreyDescends } from "./lamprey-plug.js";
import { spawnOne } from "./spawn.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LAMPREY as a worm on the field** (the owner, 6 October 2026): it
 * crawls in from the side and eats the meal that falls for it
 * (`lamprey-meal.ts`), crawls straight on to its first tile, and before a
 * step that says `crawl` it crawls the field from side to side instead of
 * leaping, eating what the step drops for it and letting go of dung for the
 * shield.
 *
 * **The head is the simulation's** — the eel's own `col` and `row` while it
 * crawls, a tile a beat (`lampreyCrawlTiles`) and two while it goes for food
 * (`lampreyLungeTiles`) — so both phones eat the same body on the same beat.
 * The body lies along where the head has been (`trailCol`, `trailRow`).
 *
 * **What it eats is a body off the field**, through `removeCreature` like any
 * other: whatever it is after, and any slick, bulb or rock its head passes
 * over — never its own dung, which is a plain rock for the shield to turn
 * (`resolveHull` answers it like any other rock, and the hull takes a miss).
 */

/** The three kinds it eats, and the rocks of every speed. */
export function lampreyEdible(s: LampreyState, c: Creature): boolean {
  if (s.dung.includes(c.id)) return false;
  return c.kind === "slick" || c.kind === "bulb" || isMeteorKind(c.kind);
}

/** The column clamped onto the field. */
export function lampreyOnField(world: World, col: number): number {
  return Math.max(0, Math.min(world.cfg.cols - 1, col));
}

/** Off the field's side nearer `col`, where it crawls in from and out to. */
export function lampreyOutside(world: World, col: number): number {
  const out = world.cfg.lampreyOutCols;
  return col < midCol(world.cfg) ? -out : world.cfg.cols - 1 + out;
}

/** The head a step toward a place, `tiles` at most each way; true once it is there. */
export function lampreyHeadTo(
  world: World,
  s: LampreyState,
  col: number,
  row: number,
  tiles: number,
): boolean {
  const dc = Math.max(-tiles, Math.min(tiles, col - s.col));
  const dr = Math.max(-tiles, Math.min(tiles, row - s.row));
  if (dc !== 0 || dr !== 0) {
    s.trailCol.unshift(s.col);
    s.trailRow.unshift(s.row);
    s.trailCol.length = Math.min(s.trailCol.length, LAMPREY_TRAIL);
    s.trailRow.length = Math.min(s.trailRow.length, LAMPREY_TRAIL);
    s.col += dc;
    s.row += dr;
    s.headBeat = world.beat;
  }
  return s.col === col && s.row === row;
}

/** A body dropped from the top of the field in `col`. */
export function lampreyDrop(world: World, kind: LampreyFood, col: number): Creature | null {
  const color = isMeteorKind(kind) ? null : livingKindForColor("red") === kind ? "red" : "cyan";
  spawnOne(world, { beat: world.beat, col: lampreyOnField(world, col), kind, color });
  return world.creatures.at(-1) ?? null;
}

/** Food dropped for the head to go after. */
function serve(world: World, s: LampreyState, kind: LampreyFood, col: number): void {
  const c = lampreyDrop(world, kind, col);
  if (c === null) return;
  s.prey = c.id;
  world.events.push({ type: "lampreyFeed", food: kind, col: c.col });
}

/** Every edible body within a tile of the head, eaten. */
export function lampreyEat(world: World, s: LampreyState): void {
  const near = world.creatures.filter(
    (c) =>
      lampreyEdible(s, c) &&
      Math.abs(c.col - s.col) <= 1 &&
      Math.abs(c.row - s.row) <= 1 &&
      c.row >= 0,
  );
  for (const c of near) {
    removeCreature(world, c.id);
    if (c.id === s.prey) s.prey = -1;
    world.events.push({ type: "lampreyEat", food: c.kind, col: c.col, row: c.row });
  }
}

/**
 * A beat after its food: the head under it while it is still above, and on it
 * once it is level or below. False with nothing to go after — eaten, shot, or
 * never dropped.
 */
function hunt(world: World, s: LampreyState): boolean {
  const c = world.creatures.find((k) => k.id === s.prey);
  if (c === undefined) {
    s.prey = -1;
    return false;
  }
  const row = c.row < s.row ? s.row : c.row + 1;
  lampreyHeadTo(world, s, c.col, row, world.cfg.lampreyLungeTiles);
  lampreyEat(world, s);
  return true;
}

/** The dung still falling: the rocks it let go of that are still on the field. Once a beat. */
export function lampreySweepDung(world: World, s: LampreyState): void {
  s.dung = s.dung.filter((id) => world.creatures.some((c) => c.id === id));
}

/** Into a phase of the crawl, from this beat. */
export function lampreyInto(world: World, s: LampreyState, phase: LampreyState["phase"]): void {
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.leg = 0;
}

/**
 * The crawl to the next stay begun at `leg`: from the first, across the field
 * with the step's food dropped ahead of it; from the last, straight to the
 * stay's tile.
 */
export function lampreyRoams(world: World, s: LampreyState, leg = 0): void {
  lampreyInto(world, s, "roam");
  s.leg = leg;
  s.roamSide = s.col < midCol(world.cfg) ? 1 : -1;
  world.events.push({ type: "lampreyRoam", col: lampreyOnField(world, s.col) });
  const food = lampreyStep(s)?.food;
  if (food !== undefined && leg === 0) {
    serve(world, s, food, s.col + s.roamSide * world.cfg.lampreyFoodCols);
  }
}

/**
 * Where a leg of the crawl ends: across to the far side high, back to the
 * near side low, then the tile — and before a `tow` or a `plug`, the middle of
 * the field first, so it comes straight down at the hull (`lamprey-tow.ts`,
 * `lamprey-plug.ts`).
 */
export function lampreyLegEnd(world: World, s: LampreyState): { col: number; row: number } {
  const cfg = world.cfg;
  const far = s.roamSide === 1 ? cfg.cols - 1 : 0;
  if (s.leg === 0) return { col: far, row: cfg.lampreyHighRow };
  if (s.leg === 1) return { col: cfg.cols - 1 - far, row: cfg.lampreyLowRow };
  if (s.leg === 2 && towing(s)) return { col: midCol(cfg), row: cfg.lampreyTowFromRow };
  return { col: s.nextCol, row: s.nextRow };
}

/** Whether the crawl on is down at the hull, a tow or a plug: the one with a leg more. */
const towing = (s: LampreyState): boolean => lampreyDescends(lampreyStep(s) ?? undefined);

/**
 * A beat of the crawl: after its food if any is falling, else a leg on, the
 * step's dung dropped at the far side. True once it is on the stay's tile.
 */
export function lampreyRoaming(world: World, s: LampreyState): boolean {
  if (hunt(world, s)) return false;
  const to = lampreyLegEnd(world, s);
  const there = lampreyHeadTo(world, s, to.col, to.row, world.cfg.lampreyCrawlTiles);
  lampreyEat(world, s);
  if (!there) return false;
  if (s.leg === 0 && lampreyStep(s)?.dung === true) dropDung(world, s);
  s.leg += 1;
  return s.leg > (towing(s) ? 3 : 2);
}

/**
 * Dung let go from the tail's end: a rock, one row below the head, for the
 * shield — in the column the tail's end lies over (`LAMPREY_TAIL_END`), kept out of the
 * outermost `lampreyEdgeCols` like a stay, so the heap is never cut by the
 * screen's edge while the head turns at the side.
 */
function dropDung(world: World, s: LampreyState): void {
  const cfg = world.cfg;
  const end = s.trailCol[Math.min(LAMPREY_TAIL_END, s.trailCol.length - 1)] ?? s.col;
  const col = Math.max(cfg.lampreyEdgeCols, Math.min(cfg.cols - 1 - cfg.lampreyEdgeCols, end));
  const c = lampreyDrop(world, "meteor", col);
  if (c === null) return;
  c.row = Math.max(0, Math.min(hullRow(world.cfg) - 1, s.row + 1));
  c.fromRow = c.row;
  s.dung.push(c.id);
  world.events.push({ type: "lampreyDung", col: c.col, row: c.row });
}
