import type { QueenState } from "./boss-state.js";
import { hullRow, type SimConfig } from "./config.js";
import { stepMirror } from "./mirror.js";
import {
  announce,
  closeBloom,
  forget,
  openBloom,
  PHASES,
  pickNextBloom,
  ROCK_CYCLE,
} from "./queen-mark.js";
import { nextInt } from "./rng.js";
import { type Creature, colSpan } from "./types.js";
import type { World } from "./world.js";

/**
 * The Bulb Queen's whole choreography.
 *
 * She paces, walks and drops her rocks here. The mark itself — announcing,
 * opening, closing, which of the two spots is real — is `queen-mark.ts`;
 * this file calls it from `stepBoss` and otherwise leaves it alone.
 */

/**
 * How far out from her own column, in tiles, the centre of a flank torch
 * sits. Half a tile off a whole number because a torch is two tiles wide and
 * therefore has no whole column at its centre (`spanCenterCol`).
 *
 * It is also what keeps her honest: a torch this far out is clear of every
 * part of her that render/ draws, so the rock that breaks off has nothing of
 * hers underneath it and falls straight down from the socket it sat in. The
 * walk bound, the spawn column and the socket render/ draws the egg at all
 * come from this one number.
 */
export const QUEEN_FLANK_TILES = 2.5;

/** The leftmost column of the torch riding one of her sides. */
export function queenTorchCol(queenCol: number, side: -1 | 1): number {
  return queenCol + side * QUEEN_FLANK_TILES - (colSpan("torch") - 1) / 2;
}

/** Columns from her own out to the outer edge of a flank torch. */
export function queenHalfCols(): number {
  return queenTorchCol(0, 1) + colSpan("torch") - 1;
}

/**
 * Her column, held where her whole span — both flank torches included — is
 * still on the field. She is wider than she used to be, and a torch clamped
 * back inboard to fit would no longer be under the socket it left, which is
 * the one thing the drop is supposed to promise.
 */
export function clampQueenCol(cfg: SimConfig, col: number): number {
  const half = queenHalfCols();
  return Math.max(half, Math.min(cfg.cols - 1 - half, col));
}

/** Which way she is walking: 1 right, -1 left. */
const WALK = 1;

/** The side her very first rock will come from — drawn once, at the moment she takes the field. */
export function initialDropSide(world: World): -1 | 1 {
  return nextInt(world.rng, 2) === 0 ? -1 : 1;
}

/**
 * One beat of whichever boss the wave installed. The dispatch lives here, and
 * not in `beat.ts`, so `onBeat` keeps calling one thing: a wave has a boss or
 * it does not, and which one it is has never been the beat's business.
 */
export function stepBoss(world: World): void {
  const boss = world.boss;
  if (boss === null) return;
  if (boss.kind === "mirror") {
    stepMirror(world, boss);
    return;
  }
  if (boss.scratch.length === 0) boss.scratch = [0, 1];

  const queen = world.creatures.find((c) => c.id === boss.creatureId);
  if (queen === undefined) return; // The last petal came off; she is gone.

  enterPhase(world, boss, queen);
  descend(world, boss, queen);
  const plan = PHASES[boss.phase] ?? PHASES[0]!;

  closeBloom(world, boss, queen);
  openBloom(world, boss, queen);
  announce(world, boss, queen, plan);
  walk(world, boss, queen);
  spitCycle(world, boss, queen);
}

/**
 * Her phase follows from her petals and nothing else, so it cannot drift out of
 * step with them. She is installed with `phase: -1`, which is not a phase but
 * "none entered yet" — that is what makes her first beat a phase change, and
 * what lets her announce her opening bloom on it instead of a cycle later.
 */
function enterPhase(world: World, boss: QueenState, queen: Creature): void {
  const phase = PHASES.findIndex((p) => queen.petals > p.above);
  if (phase === boss.phase) return;
  boss.phase = phase;
  boss.phaseBeat = world.beat;
  queen.color = null;
  forget(boss);
  // Her very first beat is a phase change (she is installed at phase -1), so
  // this is also where the opening bloom is chosen.
  pickNextBloom(world, boss);
}

/**
 * How close to the hull she has earned, purely from petals lost — one tile
 * per petal, all the way down, for as long as she has any left. The only
 * ceiling is the field itself: she may never reach the row the hull resolves
 * on, whatever a wave author sets her starting petals to.
 */
function queenRow(cfg: SimConfig, boss: QueenState, queen: Creature): number {
  const maxDrop = Math.max(0, hullRow(cfg) - 1 - cfg.queenRow);
  const drop = Math.min(maxDrop, boss.startPetals - queen.petals);
  return cfg.queenRow + Math.max(0, drop);
}

/** One tile nearer the hull for every petal she has lost, for as long as she has any left. */
function descend(world: World, boss: QueenState, queen: Creature): void {
  const target = queenRow(world.cfg, boss, queen);
  if (target === queen.row) return;
  queen.fromRow = queen.row;
  queen.row = target;
}

/**
 * One column a beat, turning at the edges, and never while a bloom is live.
 * The edge is `clampQueenCol`'s, not the field's: she turns where her
 * outermost torch would leave the grid, so both eggs stay over columns the
 * pair can name and drop into.
 */
function walk(world: World, boss: QueenState, queen: Creature): void {
  if (boss.openBeat !== -1) return;
  const turned = queen.col + boss.scratch[WALK]!;
  if (turned !== clampQueenCol(world.cfg, turned)) boss.scratch[WALK] = -boss.scratch[WALK]!;
  queen.col = clampQueenCol(world.cfg, queen.col + boss.scratch[WALK]!);
}

/**
 * Her rocks, on a fixed clock of their own, counted from the wave's own start
 * so it never drifts with anything else about her. The side for the *next*
 * one is drawn the instant this one lands, so the tell for it is up for the
 * whole cycle rather than appearing late — `boss.dropSide` is never `0` for
 * longer than the length of this one call.
 */
function spitCycle(world: World, boss: QueenState, queen: Creature): void {
  if (world.waveBeat % ROCK_CYCLE !== 0) return;
  const side: -1 | 1 = boss.dropSide === -1 ? -1 : 1;
  spit(world, queen, queenTorchCol(queen.col, side));
  boss.releaseBeat = world.beat;
  boss.releaseSide = side;
  boss.dropSide = nextInt(world.rng, 2) === 0 ? -1 : 1;
}

/**
 * The torch on that flank breaks off. It is the one that was already riding
 * her there, not a second rock grown beside it: it is pushed in the socket's
 * own column at her own row and stands still for the beat, which is the beat
 * render/ hands the picture over on — the egg stops being drawn and the
 * creature is drawn in its place, same rock, same size, same facing.
 *
 * From the next beat it falls at the torch's own speed, the only speed it
 * ever has, and straight down: nothing of her reaches below a torch this far
 * out (`QUEEN_FLANK_TILES`), so there is nothing to slide clear of first.
 */
function spit(world: World, queen: Creature, col: number): void {
  world.creatures.push({
    id: world.nextId++,
    kind: "torch",
    col,
    row: queen.row,
    fromRow: queen.row,
    color: null,
    holes: 0,
    petals: 0,
  });
}
