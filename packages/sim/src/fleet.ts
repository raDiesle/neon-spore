import type { FleetState } from "./boss-state.js";
import { midCol } from "./config.js";
import type { FleetEntry } from "./entries.js";
import {
  fleetCols,
  fleetIndex,
  fleetOnBoard,
  fleetRows,
  fleetShipAt,
  shipSunk,
} from "./fleet-board.js";
import { breachHull } from "./hull.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE FLEET: the one where the only one who can see the ships is the one who
 * cannot move the sights.
 *
 * A chart of squares stands over the field with a fleet hidden in it. **Player
 * 1 is shown where every hull lies and holds the only trigger. Player 2 is
 * shown nothing but the sights, and is the only one who can move them.** So
 * the pilot spends the whole fight saying a square out loud and the navigator
 * spends it counting one — and neither of them can do a single thing about the
 * other half.
 *
 * A sixth boss for a sixth question. The Queen is about **what you know**, THE
 * MIRROR about **what you remember**, The Warden about **what your hands are
 * free to do**, THE VANE about **what you can still say when the words no
 * longer line up**, THE GAUGE about **committing to what you have been
 * saying**. This one is about **giving directions**: the seat with the
 * information has no way to act on it except through somebody else's thumbs,
 * one square at a time, across a voice delay. Every other split in this game
 * hands each seat half of one action; this one hands one seat the whole map
 * and the other the whole vehicle.
 *
 * **The sights step, they never jump.** An absolute control would name a
 * square, and a seat that could name a square would not need to be told which
 * one — the fight would be over the moment player 2 could read a coordinate
 * off their own screen. A step can only be counted, and counting is the thing
 * two people do out loud (`command-types.ts`, `aim`).
 *
 * **Nothing here is random.** The placement is authored, the clock is the
 * wave's own beat, and a salvo is arithmetic over a list of integers — the
 * fourth boss in a row that never draws from the rng. What one player knows
 * and the other does not is the whole content of the fight, and it is a fact
 * about which screen is drawing, never about a seed
 * (`docs/spec/structure.md` 7.3).
 *
 * `fleet-board.ts` is the chart; this is only what moves.
 */

/** Before any salvo, far enough back that the first one is never held off. */
const NEVER_FIRED = -1_000_000;

/**
 * THE FLEET takes the field as a chart, not as a body. There is no creature,
 * no row and nothing to fall — the same shape THE VANE and THE MAZE have — so
 * the fall loop, the hull and a hand on the field never learn it is there.
 *
 * The sights open in the middle of the chart. Dead centre is the one square
 * both seats can name without being told anything, which makes the pair's
 * first sentence a direction rather than a coordinate.
 */
export function installFleet(world: World, entry: FleetEntry): FleetState {
  return {
    kind: "fleet",
    ships: entry.ships.map((s) => ({ ...s })),
    struck: [],
    sunkBeat: entry.ships.map(() => -1),
    aimCol: Math.floor(fleetCols(world.cfg) / 2),
    aimRow: Math.floor(fleetRows(world.cfg) / 2),
    openBeat: world.beat,
    firedBeat: NEVER_FIRED,
    lastCol: -1,
    lastRow: -1,
    lastHit: false,
  };
}

/** The fight, if it is the one running. Narrowing in one place rather than six. */
export function fleetRound(world: World): FleetState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "fleet" ? boss : null;
}

/** Beats left on the clock. Never below zero; display and the round both ask. */
export function fleetBeatsLeft(world: World, b: FleetState): number {
  return Math.max(0, world.cfg.fleetRoundBeats - (world.beat - b.openBeat));
}

/** Whether that square has already been fired at, hit or splash. */
export function fleetStruck(world: World, b: FleetState, col: number, row: number): boolean {
  return b.struck.includes(fleetIndex(world.cfg, col, row));
}

/** Ships still afloat. The silhouette of the chart is the health bar. */
export function fleetAfloat(b: FleetState): number {
  return b.sunkBeat.filter((beat) => beat === -1).length;
}

/**
 * One beat of the boss, dispatched from `stepBoss`.
 *
 * There is exactly one thing on the beat and it is the clock. Everything else
 * about this fight answers a press, on the tick, because a salvo that waited
 * for the next beat would put a queue between the sentence and the shot — and
 * the sentence is the fight.
 */
export function stepFleet(world: World, b: FleetState): void {
  if (fleetBeatsLeft(world, b) > 0) return;
  // Time is up, and it costs the hull. The middle column, because the chart
  // has columns of its own and the ship does not stand under any of them —
  // the same call THE GAUGE makes for the same reason, and the scar is what
  // makes it read: it is still there when the next wave opens.
  breachHull(world, midCol(world.cfg), "meteorFastest", 0, world.cfg.damageFleet);
  world.boss = null;
}

/**
 * One control, as the fight heard it.
 *
 * Called on the tick from `step`, beside THE WARDEN's rope and THE MAZE's
 * string, and for the same reason all three are there rather than in
 * `applyCommand`: these are the round's own verbs and not the ship's, and the
 * file that owns the round is the file that should say what they do.
 *
 * The seat check is a rule of the simulation rather than a coat of paint on
 * the picture, exactly as THE GAUGE's is: a pilot who could move the sights
 * would be playing both halves of a fight whose only content is that he
 * cannot, and both devices have to agree precisely which presses counted.
 */
export function fleetHeard(world: World, player: 1 | 2, command: Command): void {
  const b = fleetRound(world);
  if (b === null) return;
  if (command.kind === "aim") {
    // The navigator moves. An aim from the pilot is not refused loudly — he
    // has no arrows drawn on his screen at all, so there is nothing to refuse.
    if (player !== 2) return;
    aim(world, b, command.dcol, command.drow);
    return;
  }
  if (command.kind !== "salvo" || player !== 1) return;
  salvo(world, b);
}

/**
 * The sights, one square. Held to the chart rather than wrapped round it: a
 * cursor that came out of the far side would make "three more left" a sentence
 * with two answers.
 */
function aim(world: World, b: FleetState, dcol: number, drow: number): void {
  const col = b.aimCol + Math.sign(dcol);
  const row = b.aimRow + Math.sign(drow);
  if (fleetOnBoard(world.cfg, col, b.aimRow)) b.aimCol = col;
  if (fleetOnBoard(world.cfg, b.aimCol, row)) b.aimRow = row;
}

/**
 * A salvo into whichever square the sights are standing in.
 *
 * Two salvoes in a row cost the rest between them whether the first found
 * anything or not, so a thumb held on the button is slower than a pair who
 * talk — THE GAUGE's call rule, and the reason both exist is the same one.
 *
 * A square that has already been fired at answers `reject` and spends nothing:
 * it is not a miss, it is a press that meant nothing, and the pair should hear
 * the difference.
 */
function salvo(world: World, b: FleetState): void {
  if (world.beat - b.firedBeat < world.cfg.fleetSalvoRestBeats) return;
  const cfg = world.cfg;
  const col = b.aimCol;
  const row = b.aimRow;
  if (fleetStruck(world, b, col, row)) {
    world.events.push({ type: "reject", col, row });
    return;
  }

  b.firedBeat = world.beat;
  b.struck.push(fleetIndex(cfg, col, row));
  b.lastCol = col;
  b.lastRow = row;

  const at = fleetShipAt(b.ships, col, row);
  if (at === -1) {
    b.lastHit = false;
    world.events.push({ type: "fleetSplash", col, row });
    return;
  }

  b.lastHit = true;
  world.score += cfg.scoreFleetHit;
  world.events.push({ type: "fleetHit", col, row });
  if (!shipSunk(cfg, b.ships[at]!, b.struck)) return;

  b.sunkBeat[at] = world.beat;
  world.score += cfg.scoreFleetSunk;
  const left = fleetAfloat(b);
  world.events.push({ type: "fleetSunk", col, row, len: b.ships[at]!.len, left });
  if (left > 0) return;

  world.score += cfg.scoreFleetDown;
  world.events.push({ type: "fleetDown", col, row });
  world.boss = null;
}
