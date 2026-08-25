import { expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { step, ticksPerBeat } from "../src/index.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import { type BossEntry, createWorld, type SimEvent, type World } from "../src/world.js";

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function stepTicks(world: World, n: number): void {
  for (let i = 0; i < n; i++) step(world, []);
}

function stepBeats(world: World, n: number): void {
  stepTicks(world, n * TPB);
}

function stepTo(world: World, targetTick: number, cmds: TimedCommand[] = []): void {
  while (world.tick < targetTick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
  }
}

function tickOfBeat(beat: number): number {
  return beat * TPB;
}

function queenOf(world: World): Creature {
  const q = world.creatures.find((c) => c.kind === "queen");
  if (!q) throw new Error("no queen");
  return q;
}

function aim(tick: number, col: number): TimedCommand {
  return { tick, player: 1, command: { kind: "cannonCol", col } };
}

function fire(tick: number, color: Color): TimedCommand {
  return { tick, player: 2, command: { kind: "fire", color } };
}

test("she never leaves cfg.queenRow for at least sixty beats", () => {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { variant: "a", col: 5, petals: 9 });

  stepBeats(world, 60);

  const queen = queenOf(world);
  expect(queen.row).toBe(CFG.queenRow);
  expect(queen.fromRow).toBe(CFG.queenRow);
});

test("first bloom announces on beat 1, opens at beat 3, closes at beat 5 with a meteor", () => {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { variant: "a", col: 5, petals: 9 });

  // The announcement is made on the first beat.
  stepBeats(world, 1);
  const boss = world.boss!;
  const tellCol = boss.tellCol;
  const tellColor = boss.tellColor;
  expect(tellColor).not.toBeNull();
  expect(boss.openBeat).toBe(3);
  expect(boss.closeBeat).toBe(5);

  stepTo(world, tickOfBeat(3));
  const queen = queenOf(world);
  expect(queen.color).toBe(tellColor);

  stepTo(world, tickOfBeat(5));
  expect(queen.color).toBeNull();
  const meteors = world.creatures.filter((c) => c.kind === "meteor");
  expect(meteors.length).toBe(1);
  expect(meteors[0]!.col).toBe(tellCol);
  expect(meteors[0]!.row).toBe(CFG.queenRow + 1);
});

test("after a full phase-0 cycle plus one beat she has walked", () => {
  const startCol = 3;
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { variant: "a", col: startCol, petals: 9 });

  stepBeats(world, 7);

  const queen = queenOf(world);
  expect(queen.col).not.toBe(startCol);
});

test("matching shot while open takes exactly one petal and leaves no meteor", () => {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { variant: "a", col: 3, petals: 9 });

  const fireTick = tickOfBeat(3);
  const cmds: TimedCommand[] = [];
  stepTo(world, fireTick, cmds);

  const queen = queenOf(world);
  const color = queen.color!;
  expect(color).not.toBeNull();

  // She walks again the moment the bloom is over, so the column she was hit in
  // has to be remembered here rather than read back afterwards.
  const hitCol = queen.col;
  cmds.push(aim(fireTick, hitCol), fire(fireTick, color));
  // Events live for exactly one tick, so they have to be caught as they pass
  // rather than read off the world at the end.
  const seen: SimEvent[] = [];
  const target = fireTick + TPB * 2;
  while (world.tick < target) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    seen.push(...world.events);
  }

  expect(queen.petals).toBe(8);
  expect(queen.color).toBeNull();
  expect(world.creatures.some((c) => c.kind === "meteor")).toBe(false);
  expect(seen).toContainEqual(expect.objectContaining({ type: "petal", col: hitCol, left: 8 }));
});

test("phase-1 bloom releases a living creature of the opposite colour", () => {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { variant: "a", col: 3, petals: 9 });

  const queen = queenOf(world);
  queen.petals = 7;
  stepBeats(world, 1);
  expect(world.boss!.phase).toBe(1);

  stepBeats(world, 2);
  const bloomColor = queen.color!;
  expect(bloomColor).not.toBeNull();

  const living = world.creatures.filter((c) => c.kind !== "queen" && c.kind !== "meteor");
  expect(living.length).toBe(1);
  expect(living[0]!.color).toBe(bloomColor === "cyan" ? "red" : "cyan");
});

test("two worlds stepped identically have the same state after a hundred beats", () => {
  const seed = 12345;
  const w1 = createWorld({ ...CFG }, seed);
  const w2 = createWorld({ ...CFG }, seed);
  const boss: BossEntry = { variant: "a", col: 5, petals: 9 };
  startWave(w1, 0, [], [], boss);
  startWave(w2, 0, [], [], boss);

  stepBeats(w1, 100);
  stepBeats(w2, 100);

  expect(JSON.stringify(w1)).toBe(JSON.stringify(w2));
});

test("a hit does not freeze her: she announces and walks again within one phase-0 cycle", () => {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { variant: "a", col: 3, petals: 9 });

  const fireTick = tickOfBeat(3);
  const cmds: TimedCommand[] = [];
  stepTo(world, fireTick, cmds);

  const queen = queenOf(world);
  const color = queen.color!;
  expect(color).not.toBeNull();

  const hitCol = queen.col;
  cmds.push(aim(fireTick, hitCol), fire(fireTick, color));
  stepTo(world, tickOfBeat(7), cmds);

  expect(queen.petals).toBe(8);
  expect(world.boss!.tellCol).not.toBe(-1);
  expect(queen.col).not.toBe(hitCol);
});
