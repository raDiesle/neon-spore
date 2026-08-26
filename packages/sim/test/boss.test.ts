import { expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { colSpan, fallTilesPerBeat, queenTorchCol, step, ticksPerBeat } from "../src/index.js";
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

test("her first bloom is announced on beat 1, opens on 3 and closes on 5, and a miss spits no rock", () => {
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
  // A missed bloom is not a punishment here — her rocks are their own thing,
  // on `spitCycle`'s clock, and none of that clock has fired yet.
  expect(world.creatures.some((c) => c.kind === "torch")).toBe(false);
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

test("she is the only thing on the field — no runt ever joins her", () => {
  const world = install();
  runTo(world, beatTick(40));
  expect(world.creatures.every((c) => c.kind === "queen" || c.kind === "torch")).toBe(true);
});

test("her rocks land on a fixed 8-beat cycle, from her first beat, regardless of health", () => {
  const world = install();
  runTo(world, beatTick(8));

  const queen = queenOf(world);
  const rocks = world.creatures.filter((c) => c.kind === "torch");
  expect(rocks.length).toBe(1);
  // The socket it grew in, on the side that was announced — not a column
  // beside her, and not one the field's edge pulled back inboard.
  const boss = world.boss!;
  expect(boss.releaseBeat).toBe(world.beat);
  expect(rocks[0]!.col).toBe(queenTorchCol(queen.col, boss.releaseSide === -1 ? -1 : 1));
  // Standing still in the socket for the beat it breaks off, so render/ can
  // hand the picture over from the egg to the creature without either moving.
  expect(rocks[0]!.row).toBe(queen.row);
  expect(rocks[0]!.fromRow).toBe(queen.row);

  // The cycle repeats untouched by anything that happened in between — the
  // first rock has long since fallen (it is the fastest kind there is), and
  // a fresh one lands exactly 8 beats after it.
  runTo(world, beatTick(16));
  const second = world.creatures.filter((c) => c.kind === "torch");
  expect(second.length).toBe(1);
  expect(second[0]!.fromRow).toBe(queenOf(world).row);
});

test("what she releases falls at the torch's own speed, from the socket down", () => {
  const world = install();
  runTo(world, beatTick(8));
  const queen = queenOf(world);
  const rock = world.creatures.find((c) => c.kind === "torch")!;
  const col = rock.col;

  // One beat on, it has left her by a whole torch fall and not a tile less —
  // and it has not changed columns, because nothing of hers is under it.
  runTo(world, beatTick(9));
  expect(rock.fromRow).toBe(queen.row);
  expect(rock.row).toBe(queen.row + fallTilesPerBeat("torch"));
  expect(rock.col).toBe(col);
});

test("both her torches stay on the field, wherever she has walked to", () => {
  const world = install();
  for (let beat = 1; beat <= 60; beat++) {
    runTo(world, beatTick(beat));
    const queen = queenOf(world);
    expect(queenTorchCol(queen.col, -1)).toBeGreaterThanOrEqual(0);
    expect(queenTorchCol(queen.col, 1) + colSpan("torch")).toBeLessThanOrEqual(CFG.cols);
  }
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
