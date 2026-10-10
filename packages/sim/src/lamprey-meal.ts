import { midCol } from "./config.js";
import {
  freshLamprey,
  type LampreyMorsel,
  type LampreyState,
  type LampreyStep,
} from "./lamprey.js";
import { lampreyLeapTo } from "./lamprey-leap.js";
import { lampreyDownTile } from "./lamprey-plug.js";
import {
  lampreyDrop,
  lampreyEat,
  lampreyEdible,
  lampreyHeadTo,
  lampreyInto,
  lampreyOnField,
  lampreyOutside,
  lampreyRoams,
} from "./lamprey-roam.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LAMPREY's meal**, as it arrives: it crawls in from the side and eats
 * what falls for it, then crawls straight on to its first tile (the owner, 9
 * October 2026: *eating enemies in other level of falling … not same time
 * distance between them … moving in some different speeds … skip that it
 * goes away the screen*).
 *
 * **The install is here too** (`installLamprey`), the arrival's first beat:
 * moved out of `lamprey-step.ts` on line count when the plug came in.
 *
 * **Each morsel says where and when** (`LampreyMorsel`): the column it falls
 * in, the row the head waits for it on, the beat of the meal it falls on, and
 * how many tiles a beat the head goes after it. The beats are authored on
 * the wave, so one may still be falling as the next sets off and the head
 * swims up from a low catch to a high one; the head always goes after the
 * lowest, the one that would reach the hull first.
 *
 * **Which morsel the head is after is counted, not kept**: every body of the
 * meal on the field is still falling, so the one it is after is the meal's
 * `served` less the ones still falling (`leg`).
 */

/** Crawling in from the side to where it waits for its first morsel. */
export function lampreyEntering(world: World, s: LampreyState): void {
  const first = s.meal[0];
  const col = lampreyOnField(world, first?.col ?? s.nextCol);
  if (lampreyHeadTo(world, s, col, catchRow(world, first), world.cfg.lampreyCrawlTiles)) {
    lampreyInto(world, s, "feeding");
  }
}

/** A beat of its meal: what is due dropped, the head after the lowest, and on to its first tile once all are gone. */
export function lampreyFeeding(world: World, s: LampreyState): void {
  for (let m = s.meal[s.served]; m !== undefined; m = s.meal[s.served]) {
    if (world.beat - s.phaseBeat < (m.beat ?? 0)) break;
    s.served += 1;
    const c = lampreyDrop(world, m.kind, m.col);
    if (c !== null) world.events.push({ type: "lampreyFeed", food: m.kind, col: c.col });
  }
  const falling = world.creatures.filter((c) => lampreyEdible(s, c)).sort(lowest);
  s.leg = s.served - falling.length;
  const morsel = s.meal[s.leg];
  if (morsel === undefined) {
    s.prey = -1;
    lampreyRoams(world, s, 2);
    return;
  }
  const tiles = morsel.tiles ?? world.cfg.lampreyLungeTiles;
  const at = catchRow(world, morsel);
  const c = falling[0];
  s.prey = c?.id ?? -1;
  if (c === undefined) {
    // Nothing falling yet: on to where the next one will be caught.
    lampreyHeadTo(world, s, lampreyOnField(world, morsel.col), at, tiles);
    return;
  }
  lampreyHeadTo(world, s, c.col, c.row + 1 < at ? at : c.row + 1, tiles);
  lampreyEat(world, s);
}

/** The row the head waits for a morsel on. */
function catchRow(world: World, m: LampreyMorsel | undefined): number {
  return m?.row ?? world.cfg.lampreyFeedRow;
}

/** The lowest first, the older of two on a row first. */
const lowest = (a: Creature, b: Creature): number => b.row - a.row || a.id - b.id;

/**
 * In from off the field's side nearer its meal, at the row it waits for the
 * first morsel on, the first stay's tile drawn now — a leap of its `jump`
 * from the top middle — so the crawl on after the meal knows where it ends.
 */
export function installLamprey(
  world: World,
  steps: readonly LampreyStep[],
  meal: readonly LampreyMorsel[] = [],
): LampreyState {
  const cfg = world.cfg;
  const top = { col: midCol(cfg), row: cfg.lampreyRowTop };
  const side = lampreyOutside(world, meal[0]?.col ?? 0);
  const row = meal[0]?.row ?? cfg.lampreyFeedRow;
  const s = freshLamprey(world.beat, { col: side, row }, top, steps, meal);
  const first =
    lampreyDownTile(cfg, steps[0]) ?? lampreyLeapTo(world, s, top, steps[0]?.jump ?? 1, -1);
  s.nextCol = first.col;
  s.nextRow = first.row;
  world.events.push({ type: "lampreyEnter", col: side < 0 ? 0 : cfg.cols - 1 });
  return s;
}
