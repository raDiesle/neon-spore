import { type BossState, type Color, livingKindForColor } from "./types.js";
import type { World } from "./world.js";

/**
 * Variant A's choreography for the queen. These numbers are the boss, not a
 * knob on it, so they live here as a named constant and not in `SimConfig`.
 */
const PHASES = [
  {
    threshold: 7,
    cycle: 6,
    tell: 2,
    /** Beats a bloom stands open. */ openBeats: 2,
    runt: false,
    rock: false,
  },
  { threshold: 4, cycle: 5, tell: 2, openBeats: 2, runt: true, rock: false },
  { threshold: 0, cycle: 4, tell: 1, openBeats: 2, runt: true, rock: true },
] as const;

export function stepBossA(world: World): void {
  const boss = world.boss;
  if (!boss) return;

  // scratch[0] blooms announced, scratch[1] runts released, scratch[2] walk dir.
  if (boss.scratch.length === 0) boss.scratch = [0, 0, 1];

  const queen = world.creatures.find((c) => c.id === boss.creatureId);
  if (!queen) return; // She is dead.

  // 2. Phase
  const phase = PHASES.findIndex((p) => queen.petals > p.threshold);
  if (phase !== boss.phase) {
    boss.phase = phase;
    boss.phaseBeat = world.beat;
    queen.color = null;
    boss.tellCol = -1;
    boss.tellColor = null;
    boss.openBeat = -1;
    boss.closeBeat = -1;
  }

  const plan = PHASES[boss.phase]!;

  // 3. Window closing
  // A hit moves closeBeat into the past, so we must clear the announcement
  // once the current beat has reached or passed it.
  if (boss.openBeat !== -1 && world.beat >= boss.closeBeat) {
    if (queen.color !== null) {
      queen.color = null;
      spitRock(world, boss.tellCol);
    }
    boss.tellCol = -1;
    boss.tellColor = null;
    boss.openBeat = -1;
    boss.closeBeat = -1;
  }

  // 4. Window opening
  if (world.beat === boss.openBeat) {
    queen.color = boss.tellColor;
    if (plan.rock) spitRock(world, queen.col);
    if (plan.runt) releaseRunt(world, boss);
  }

  // 5. Announcement
  if (boss.openBeat === -1 && (world.beat - boss.phaseBeat) % plan.cycle === 0) {
    boss.tellCol = queen.col;
    boss.tellColor = boss.scratch[0]! % 2 === 0 ? "cyan" : "red";
    boss.openBeat = world.beat + plan.tell;
    boss.closeBeat = boss.openBeat + plan.openBeats;
    boss.scratch[0]! += 1;
  }

  // 6. Her walk
  if (boss.openBeat === -1) {
    let dir = boss.scratch[2]!;
    let nextCol = queen.col + dir;
    if (nextCol < 0 || nextCol >= world.cfg.cols) {
      dir = -dir as 1 | -1;
      boss.scratch[2] = dir;
      nextCol = queen.col + dir;
    }
    queen.col = nextCol;
    queen.row = world.cfg.queenRow;
    queen.fromRow = world.cfg.queenRow;
  }
}

function releaseRunt(world: World, boss: BossState): void {
  const bloomColor = boss.tellColor ?? "cyan";
  const color: Color = bloomColor === "cyan" ? "red" : "cyan";
  const col = boss.scratch[1]! % 2 === 0 ? 0 : world.cfg.cols - 1;
  world.creatures.push({
    id: world.nextId++,
    kind: livingKindForColor(color),
    col,
    row: world.cfg.queenRow,
    fromRow: world.cfg.queenRow - 1,
    color,
    holes: 0,
    petals: 0,
  });
  boss.scratch[1]! += 1;
}

function spitRock(world: World, col: number): void {
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    col,
    row: world.cfg.queenRow + 1,
    fromRow: world.cfg.queenRow,
    color: null,
    holes: 0,
    petals: 0,
  });
}
