import { expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hullRow, step, ticksPerBeat } from "../src/index.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import { type BossEntry, createWorld, type World } from "../src/world.js";

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
const FIRE_TICK = TPB * 2;

function queenAt(world: World): Creature {
  const q = world.creatures.find((c) => c.kind === "queen");
  if (!q) throw new Error("no queen");
  return q;
}

function aim(tick: number, col: number): TimedCommand {
  return { tick, player: 1, command: { kind: "cannonCol", col } };
}

function shoot(tick: number, color: Color): TimedCommand {
  return { tick, player: 2, command: { kind: "fire", color } };
}

function fireAtQueen(world: World, color: Color): void {
  const q = queenAt(world);
  const cmds: TimedCommand[] = [aim(FIRE_TICK, q.col), shoot(FIRE_TICK, color)];
  const limit = FIRE_TICK + TPB * (HULL + 2);
  for (let t = 0; t < limit; t++) {
    step(
      world,
      cmds.filter((c) => c.tick === t),
    );
    if (
      world.events.some((e) => e.type === "reject" || e.type === "petal" || e.type === "queenDown")
    )
      break;
  }
}

test("startWave installs the queen at cfg.queenRow", () => {
  const cfg = { ...DEFAULT_CONFIG };
  const world = createWorld(cfg, 0);
  const boss: BossEntry = { variant: "a", col: 5, petals: 8 };
  startWave(world, 0, [], [], boss);

  expect(world.creatures.length).toBe(1);
  const queen = world.creatures[0]!;
  expect(queen.kind).toBe("queen");
  expect(queen.row).toBe(cfg.queenRow);
  expect(queen.fromRow).toBe(cfg.queenRow);
  expect(queen.color).toBeNull();
  expect(queen.petals).toBe(8);

  expect(world.boss).not.toBeNull();
  expect(world.boss!.creatureId).toBe(queen.id);
  expect(world.boss!.variant).toBe("a");
});

test("startWave without a boss leaves no queen and no boss state", () => {
  const cfg = { ...DEFAULT_CONFIG };
  const world = createWorld(cfg, 0);
  startWave(world, 0, [], []);

  expect(world.creatures.length).toBe(0);
  expect(world.boss).toBeNull();
});

test("closed queen rejects any shot and keeps her petals", () => {
  const world = createWorld({ ...CFG }, 0);
  const boss: BossEntry = { variant: "a", col: 3, petals: 8 };
  startWave(world, 0, [], [], boss);
  // Hold the choreography still so the case tests the shot, not the bloom cycle.
  // Pin the phase too: an unentered phase is a phase change waiting to happen.
  world.boss!.openBeat = 10_000;
  world.boss!.closeBeat = 10_000;
  world.boss!.phase = 0;
  const queen = queenAt(world);

  expect(queen.color).toBeNull();
  fireAtQueen(world, "red");

  expect(queen.petals).toBe(8);
  expect(
    world.events.some((e) => e.type === "reject" && e.col === queen.col && e.row === queen.row),
  ).toBe(true);
  expect(world.boss).not.toBeNull();
});

test("open queen rejects a mismatched colour", () => {
  const world = createWorld({ ...CFG }, 0);
  const boss: BossEntry = { variant: "a", col: 3, petals: 8 };
  startWave(world, 0, [], [], boss);
  // Hold the choreography still so the case tests the shot, not the bloom cycle.
  // Pin the phase too: an unentered phase is a phase change waiting to happen.
  world.boss!.openBeat = 10_000;
  world.boss!.closeBeat = 10_000;
  world.boss!.phase = 0;
  const queen = queenAt(world);
  queen.color = "cyan";

  fireAtQueen(world, "red");

  expect(queen.petals).toBe(8);
  expect(world.events.some((e) => e.type === "reject")).toBe(true);
});

test("open queen loses exactly one petal to a matching shot", () => {
  const world = createWorld({ ...CFG }, 0);
  const boss: BossEntry = { variant: "a", col: 3, petals: 8 };
  startWave(world, 0, [], [], boss);
  // Hold the choreography still so the case tests the shot, not the bloom cycle.
  // Pin the phase too: an unentered phase is a phase change waiting to happen.
  world.boss!.openBeat = 10_000;
  world.boss!.closeBeat = 10_000;
  world.boss!.phase = 0;
  const queen = queenAt(world);
  queen.color = "red";

  fireAtQueen(world, "red");

  expect(queen.petals).toBe(7);
  expect(queen.color).toBeNull();
  expect(world.boss!.closeBeat).toBe(world.beat);
  expect(world.events).toContainEqual(
    expect.objectContaining({ type: "petal", col: queen.col, left: 7 }),
  );
});

test("losing the last petal brings the queen down", () => {
  const world = createWorld({ ...CFG }, 0);
  const boss: BossEntry = { variant: "a", col: 3, petals: 1 };
  startWave(world, 0, [], [], boss);
  // Hold the choreography still so the case tests the shot, not the bloom cycle.
  // Pin the phase too: an unentered phase is a phase change waiting to happen.
  world.boss!.openBeat = 10_000;
  world.boss!.closeBeat = 10_000;
  world.boss!.phase = 2;
  const queen = queenAt(world);
  queen.color = "red";

  fireAtQueen(world, "red");

  expect(world.events.some((e) => e.type === "queenDown" && e.col === queen.col)).toBe(true);
  expect(world.creatures.some((c) => c.kind === "queen")).toBe(false);
  expect(world.boss).toBeNull();
});
