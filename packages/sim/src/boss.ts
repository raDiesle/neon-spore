import type { SimConfig } from "./config.js";
import { nextInt } from "./rng.js";
import { type BossState, type Color, type Creature, livingKindForColor } from "./types.js";
import type { World } from "./world.js";

/**
 * The Bulb Queen's whole choreography.
 *
 * She paces, she announces, she opens for a moment, and she answers a bloom
 * the pair missed with a rock in the column she opened in. Nothing here is
 * random: the whole encounter is fixed, which is what makes it learnable and
 * what makes two devices agree about it.
 */

/**
 * The three phases, tightening. These numbers are the boss rather than a knob
 * on it — changing one writes a different fight, not a different difficulty —
 * so they live here as choreography and not in `SimConfig`.
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
  /** She releases a runt when she opens. */
  runt: boolean;
  /** She spits a rock when she opens, hit or not. */
  rock: boolean;
}

const PHASES: readonly Phase[] = [
  { above: 7, cycle: 6, tell: 2, openBeats: 2, runt: false, rock: false },
  { above: 4, cycle: 5, tell: 2, openBeats: 2, runt: true, rock: false },
  { above: 0, cycle: 4, tell: 1, openBeats: 2, runt: true, rock: true },
];

/**
 * How many tiles she may sink toward the hull over the whole fight, one tile
 * per petal lost. Same kind of number as `PHASES` — the boss, not a knob on
 * her — so it lives here rather than in `SimConfig`.
 */
const QUEEN_MAX_DROP = 3;

/** Blooms announced so far. Decides the colour, which alternates cyan first. */
const BLOOMS = 0;
/** Runts released so far. Decides which edge the next one enters from. */
const RUNTS = 1;
/** Which way she is walking: 1 right, -1 left. */
const WALK = 2;

export function stepBoss(world: World): void {
  const boss = world.boss;
  if (boss === null) return;
  if (boss.scratch.length === 0) boss.scratch = [0, 0, 1];

  const queen = world.creatures.find((c) => c.id === boss.creatureId);
  if (queen === undefined) return; // The last petal came off; she is gone.

  enterPhase(world, boss, queen);
  descend(world, boss, queen);
  const plan = PHASES[boss.phase] ?? PHASES[0]!;

  closeBloom(world, boss, queen);
  openBloom(world, boss, queen, plan);
  announce(world, boss, queen, plan);
  walk(world, boss, queen);
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

/** How close to the hull she has earned, purely from petals lost. */
function queenRow(cfg: SimConfig, boss: BossState, queen: Creature): number {
  const drop = Math.min(QUEEN_MAX_DROP, boss.startPetals - queen.petals);
  return cfg.queenRow + Math.max(0, drop);
}

/** One tile nearer the hull for every petal she has lost, up to `QUEEN_MAX_DROP`. */
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
 * Still open means it was missed, and a miss is answered by a rock in the
 * column she opened in.
 */
function closeBloom(world: World, boss: BossState, queen: Creature): void {
  if (boss.openBeat === -1) return;
  if (world.beat < boss.closeBeat) return;
  if (queen.color !== null) {
    queen.color = null;
    // A miss is a punishment, not something to telegraph — it lands exactly
    // where the bloom was, no side shift.
    spit(world, queen, boss.tellCol);
  }
  forget(boss);
}

/** She opens, and whatever else this phase does, it does now. */
function openBloom(world: World, boss: BossState, queen: Creature, plan: Phase): void {
  if (world.beat !== boss.openBeat) return;
  queen.color = boss.tellColor;
  if (plan.rock) {
    const landCol = Math.max(0, Math.min(world.cfg.cols - 1, queen.col + boss.dropSide));
    spit(world, queen, landCol);
  }
  if (plan.runt) release(world, boss, queen);
}

/**
 * The announcement. Her column is the one she is standing in, because she has
 * stopped walking for the length of the bloom — that is the whole reason the
 * tell is worth saying out loud.
 *
 * When this bloom will spit a rock regardless of the outcome, the side it
 * grows from is drawn here, `tell` beats ahead of the drop, so there is time
 * to show it before it happens.
 */
function announce(world: World, boss: BossState, queen: Creature, plan: Phase): void {
  if (boss.openBeat !== -1) return;
  if ((world.beat - boss.phaseBeat) % plan.cycle !== 0) return;
  boss.tellCol = queen.col;
  boss.tellColor = boss.scratch[BLOOMS]! % 2 === 0 ? "cyan" : "red";
  boss.openBeat = world.beat + plan.tell;
  boss.closeBeat = boss.openBeat + plan.openBeats;
  boss.scratch[BLOOMS]! += 1;
  if (plan.rock) boss.dropSide = nextInt(world.rng, 2) === 0 ? -1 : 1;
}

/** One column a beat, turning at the edges, and never while a bloom is live. */
function walk(world: World, boss: BossState, queen: Creature): void {
  if (boss.openBeat !== -1) return;
  const turned = queen.col + boss.scratch[WALK]!;
  if (turned < 0 || turned > world.cfg.cols - 1) boss.scratch[WALK] = -boss.scratch[WALK]!;
  queen.col = queen.col + boss.scratch[WALK]!;
}

/** No bloom announced, and none open. */
function forget(boss: BossState): void {
  boss.tellCol = -1;
  boss.tellColor = null;
  boss.openBeat = -1;
  boss.closeBeat = -1;
  boss.dropSide = 0;
}

/**
 * A runt of the colour she is *not* open in, so the pair cannot park on one
 * colour and answer everything with it. It enters from alternating edges.
 */
function release(world: World, boss: BossState, queen: Creature): void {
  const color: Color = boss.tellColor === "cyan" ? "red" : "cyan";
  const left = boss.scratch[RUNTS]! % 2 === 0;
  world.creatures.push({
    id: world.nextId++,
    kind: livingKindForColor(color),
    col: left ? 0 : world.cfg.cols - 1,
    row: queen.row,
    fromRow: queen.row - 1,
    color,
    holes: 0,
    petals: 0,
  });
  boss.scratch[RUNTS]! += 1;
}

/** A rock, out of her body and one row below her. */
function spit(world: World, queen: Creature, col: number): void {
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    col,
    row: queen.row + 1,
    fromRow: queen.row,
    color: null,
    holes: 0,
    petals: 0,
  });
}
