import { hullRow, type SimConfig } from "./config.js";
import { nextInt } from "./rng.js";
import { type BossState, type Creature, colSpan } from "./types.js";
import type { World } from "./world.js";

/**
 * The Bulb Queen's whole choreography.
 *
 * She paces, she announces, and she opens for a moment — that is the whole
 * mark. Her rocks are a separate, fixed clock: nothing here is random except
 * which side one grows from, and even that is drawn from the seeded rng, so
 * the whole encounter replays identically on both devices.
 */

/**
 * The three phases, tightening the mark's cadence as she loses petals. These
 * numbers are the boss rather than a knob on it — changing one writes a
 * different fight, not a different difficulty — so they live here as
 * choreography and not in `SimConfig`.
 *
 * The beats a bloom stands open are `openBeats`: the purity scan bans the bare
 * word `window` anywhere in `sim`, because it cannot tell a DOM global from a
 * property name.
 */
interface Phase {
  /** She is in this phase while her petals are above this number. */
  above: number;
  /** Beats from one announcement to the next. */
  cycle: number;
  /** Beats between the announcement and the opening. */
  tell: number;
  /** Beats a bloom stands open. */
  openBeats: number;
}

const PHASES: readonly Phase[] = [
  { above: 7, cycle: 6, tell: 2, openBeats: 2 },
  { above: 4, cycle: 5, tell: 2, openBeats: 2 },
  { above: 0, cycle: 4, tell: 1, openBeats: 2 },
];

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

/**
 * Beats between one scripted rock and the next. Fixed for the whole fight —
 * not tied to her phase or her health, so it is one thing the pair can learn
 * once and rely on from her very first beat to her last.
 */
const ROCK_CYCLE = 8;

/** Blooms announced so far. Decides the colour, which alternates cyan first. */
const BLOOMS = 0;
/** Which way she is walking: 1 right, -1 left. */
const WALK = 1;

/** The side her very first rock will come from — drawn once, at the moment she takes the field. */
export function initialDropSide(world: World): -1 | 1 {
  return nextInt(world.rng, 2) === 0 ? -1 : 1;
}

export function stepBoss(world: World): void {
  const boss = world.boss;
  if (boss === null) return;
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
function enterPhase(world: World, boss: BossState, queen: Creature): void {
  const phase = PHASES.findIndex((p) => queen.petals > p.above);
  if (phase === boss.phase) return;
  boss.phase = phase;
  boss.phaseBeat = world.beat;
  queen.color = null;
  forget(boss);
}

/**
 * How close to the hull she has earned, purely from petals lost — one tile
 * per petal, all the way down, for as long as she has any left. The only
 * ceiling is the field itself: she may never reach the row the hull resolves
 * on, whatever a wave author sets her starting petals to.
 */
function queenRow(cfg: SimConfig, boss: BossState, queen: Creature): number {
  const maxDrop = Math.max(0, hullRow(cfg) - 1 - cfg.queenRow);
  const drop = Math.min(maxDrop, boss.startPetals - queen.petals);
  return cfg.queenRow + Math.max(0, drop);
}

/** One tile nearer the hull for every petal she has lost, for as long as she has any left. */
function descend(world: World, boss: BossState, queen: Creature): void {
  const target = queenRow(world.cfg, boss, queen);
  if (target === queen.row) return;
  queen.fromRow = queen.row;
  queen.row = target;
}

/**
 * The bloom is over once this beat has *reached or passed* its close — not on
 * equality. A shot that lands moves the close beat back to the beat of the
 * hit, which is already behind us by the time this runs again, and an
 * announcement that is never cleared is one she never blooms or walks out of.
 *
 * A miss just closes it. There is no punishment here — her rocks are their
 * own thing, on `spitCycle`'s clock, not a consequence of a missed mark.
 */
function closeBloom(world: World, boss: BossState, queen: Creature): void {
  if (boss.openBeat === -1) return;
  if (world.beat < boss.closeBeat) return;
  queen.color = null;
  forget(boss);
}

/** She opens. That is all this beat does now — the mark, nothing riding on it. */
function openBloom(world: World, boss: BossState, queen: Creature): void {
  if (world.beat !== boss.openBeat) return;
  queen.color = boss.tellColor;
}

/**
 * The announcement. Her column is the one she is standing in, because she has
 * stopped walking for the length of the bloom — that is the whole reason the
 * tell is worth saying out loud.
 */
function announce(world: World, boss: BossState, queen: Creature, plan: Phase): void {
  if (boss.openBeat !== -1) return;
  if ((world.beat - boss.phaseBeat) % plan.cycle !== 0) return;
  boss.tellCol = queen.col;
  boss.tellColor = boss.scratch[BLOOMS]! % 2 === 0 ? "cyan" : "red";
  boss.openBeat = world.beat + plan.tell;
  boss.closeBeat = boss.openBeat + plan.openBeats;
  boss.scratch[BLOOMS]! += 1;
}

/**
 * One column a beat, turning at the edges, and never while a bloom is live.
 * The edge is `clampQueenCol`'s, not the field's: she turns where her
 * outermost torch would leave the grid, so both eggs stay over columns the
 * pair can name and drop into.
 */
function walk(world: World, boss: BossState, queen: Creature): void {
  if (boss.openBeat !== -1) return;
  const turned = queen.col + boss.scratch[WALK]!;
  if (turned !== clampQueenCol(world.cfg, turned)) boss.scratch[WALK] = -boss.scratch[WALK]!;
  queen.col = clampQueenCol(world.cfg, queen.col + boss.scratch[WALK]!);
}

/** No bloom announced, and none open. */
function forget(boss: BossState): void {
  boss.tellCol = -1;
  boss.tellColor = null;
  boss.openBeat = -1;
  boss.closeBeat = -1;
}

/**
 * Her rocks, on a fixed clock of their own, counted from the wave's own start
 * so it never drifts with anything else about her. The side for the *next*
 * one is drawn the instant this one lands, so the tell for it is up for the
 * whole cycle rather than appearing late — `boss.dropSide` is never `0` for
 * longer than the length of this one call.
 */
function spitCycle(world: World, boss: BossState, queen: Creature): void {
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
