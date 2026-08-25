import { expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { step, ticksPerBeat } from "../src/index.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import { type BossEntry, createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * The Bulb Queen's choreography, played out headlessly. These seven cases are
 * the ones the design in `docs/spec/bosses.md` 11.0 is judged by.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const BOSS: BossEntry = { col: 5, petals: 9 };

/**
 * The hull holds. She spits a rock at every bloom she is not answered on, and
 * left to itself a headless run drowns inside a minute — at which point `step`
 * stops advancing the tick and a loop waiting for one never returns. What is
 * under test here is her choreography, not how long a hull survives it.
 */
function install(petals = BOSS.petals): World {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 0);
  startWave(world, 0, [], [], { ...BOSS, petals });
  return world;
}

function queenOf(world: World): Creature {
  const q = world.creatures.find((c) => c.kind === "queen");
  if (!q) throw new Error("no queen on the field");
  return q;
}

/** Step to a tick, feeding commands on the tick they are stamped for. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): SimEvent[] {
  const seen: SimEvent[] = [];
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    seen.push(...world.events);
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
  return seen;
}

const beatTick = (beat: number): number => beat * TPB;
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: Color): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

test("she holds her row for sixty beats", () => {
  const world = install();
  runTo(world, beatTick(60));
  const queen = queenOf(world);
  expect(queen.row).toBe(CFG.queenRow);
  expect(queen.fromRow).toBe(CFG.queenRow);
});

test("her first bloom is announced on beat 1, opens on 3 and closes on 5", () => {
  const world = install();

  runTo(world, beatTick(1) + 1);
  const boss = world.boss!;
  const col = boss.tellCol;
  expect(boss.tellColor).toBe("cyan");
  expect(col).toBe(BOSS.col);
  expect(queenOf(world).color).toBeNull();

  runTo(world, beatTick(3) + 1);
  expect(queenOf(world).color).toBe("cyan");

  runTo(world, beatTick(5) + 1);
  expect(queenOf(world).color).toBeNull();
  const rocks = world.creatures.filter((c) => c.kind === "meteor");
  expect(rocks.length).toBe(1);
  expect(rocks[0]!.col).toBe(col);
});

test("left alone through a cycle she has walked", () => {
  const world = install();
  runTo(world, beatTick(7));
  expect(queenOf(world).col).not.toBe(BOSS.col);
});

test("a matching shot while she is open takes exactly one petal and no rock follows", () => {
  const world = install();
  runTo(world, beatTick(3));

  const queen = queenOf(world);
  const color = queen.color;
  expect(color).not.toBeNull();
  // She walks again the moment the bloom is over, so the column she is hit in
  // has to be taken now rather than read back at the end.
  const hitCol = queen.col;
  const at = world.tick;

  const seen = runTo(world, beatTick(6), [aim(at, hitCol), fire(at, color!)]);

  expect(queen.petals).toBe(BOSS.petals - 1);
  expect(queen.color).toBeNull();
  expect(world.creatures.some((c) => c.kind === "meteor")).toBe(false);
  expect(seen).toContainEqual(
    expect.objectContaining({ type: "petal", col: hitCol, left: BOSS.petals - 1 }),
  );
});

test("a bloom in phase 1 releases a runt of the opposite colour", () => {
  const world = install(7);

  runTo(world, beatTick(1) + 1);
  expect(world.boss!.phase).toBe(1);
  expect(world.boss!.tellColor).toBe("cyan");

  runTo(world, beatTick(3) + 1);
  const runts = world.creatures.filter((c) => c.kind !== "queen");
  expect(runts.length).toBe(1);
  expect(runts[0]!.color).toBe("red");
  expect(runts[0]!.kind).toBe("slick");
});

test("a hit does not leave her frozen", () => {
  const world = install();
  runTo(world, beatTick(3));

  const queen = queenOf(world);
  const hitCol = queen.col;
  const at = world.tick;
  runTo(world, beatTick(4), [aim(at, hitCol), fire(at, queen.color!)]);
  expect(queen.petals).toBe(BOSS.petals - 1);

  // One phase-0 cycle later she is announcing again, and she has moved.
  runTo(world, beatTick(10));
  expect(world.boss!.tellCol).not.toBe(-1);
  expect(queen.col).not.toBe(hitCol);
});

test("two worlds stepped alike agree after a hundred beats", () => {
  const one = install();
  const two = install();
  runTo(one, beatTick(100));
  runTo(two, beatTick(100));
  expect(hashWorld(one)).toBe(hashWorld(two));
});
