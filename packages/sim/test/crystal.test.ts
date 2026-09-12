import { describe, expect, it } from "bun:test";
import { resolve } from "../src/bullet-hit.js";
import {
  crystalHeading,
  crystalHeld,
  crystalMiddleCol,
  crystalMiddleLane,
  crystalStruck,
} from "../src/crystal.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  isGrippable,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  spanOf,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import { creatureLane } from "../src/mid-beat.js";
import type { Bullet, Creature } from "../src/types.js";

/**
 * THE CRYSTAL: a slick and a bulb joined at a thin middle and armoured all
 * round, crossing on the carom's diagonal. What is worth pinning is the half a
 * reader of `crystal.ts` cannot check by eye — that the middle is a column and
 * not a seam, that the shield alone does nothing and the shot alone does
 * nothing, that a wrong shot costs nothing but the shot, that the middle a
 * bolt is tested against is the one drawn on this tick, that the two halves
 * come out in the columns the two ends were standing in, and that a second
 * device walking the same beats arrives at the same fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

const crystal = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "crystal",
  color,
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shield = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

type World = ReturnType<typeof createWorld>;

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): World {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < ticks; t++) step(world, byTick.get(t) ?? []);
  return world;
}

/** The tick a crystal entered at beat 0 is standing on a row (`carom.test.ts`). */
const tickAtRow = (row: number): number => TPB * (row / CFG.crystalRows + 1);

/** A crystal standing on a row, and the world it is standing in. */
function standing(row: number, color: "red" | "cyan" = "red"): { world: World; body: Creature } {
  const world = createWorld({ ...CFG }, 0, [crystal(0, color)]);
  for (let t = 0; t < tickAtRow(row) + 1; t++) step(world, []);
  world.events.length = 0;
  return { world, body: world.creatures[0]! };
}

/** A bolt already at a column of the body's row — the carom test's instrument. */
function bolt(body: Creature, col: number, color: "red" | "cyan"): Bullet {
  return {
    id: 1,
    col,
    row: body.row,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/**
 * The whole condition: the shield under the middle and the guard armed now.
 * Under the middle *as drawn on this tick* — `standing` leaves the world a
 * tick into a beat, where the body is still in the lane it is leaving, and
 * that lane is the one a bolt is found against and the shield is tested
 * against (`crystalUnder`, `crystalMiddleLane`).
 */
function hold(world: World, body: Creature): void {
  world.shieldCol = crystalMiddleLane(world, body);
  world.guardTick = world.tick;
}

const of = (world: World, type: SimEvent["type"]): SimEvent[] =>
  world.events.filter((e) => e.type === type);

describe("the crossing", () => {
  it("is three tiles wide with the middle on a column of its own", () => {
    const { body } = standing(2);
    expect(spanOf(body)).toBe(3);
    expect(crystalMiddleCol(body)).toBe(body.col + 1);
    expect(Number.isInteger(crystalMiddleCol(body))).toBe(true);
  });

  it("drops crystalRows and crosses crystalCols a beat, away from the nearer wall", () => {
    const { body } = standing(2);
    expect(body.row).toBe(CFG.crystalRows * 2);
    expect(body.col).toBe(CFG.crystalCols * 2);
    expect(crystalHeading(body)).toBe(1);
    const far = run([crystal(CFG.cols - 3)], TPB + 1).creatures[0]!;
    expect(crystalHeading(far)).toBe(-1);
  });

  it("turns on the walls and never leaves the field", () => {
    const world = createWorld({ ...CFG }, 0, [crystal(0)]);
    let bounces = 0;
    for (let t = 0; t < tickAtRow(HULL - 1); t++) {
      step(world, []);
      bounces += of(world, "crystalBounce").length;
      const body = world.creatures[0];
      if (!body) continue;
      expect(body.col).toBeGreaterThanOrEqual(0);
      expect(body.col + spanOf(body)).toBeLessThanOrEqual(CFG.cols);
    }
    expect(bounces).toBeGreaterThanOrEqual(1);
  });

  it("refuses a hand, for the carom's reason", () => {
    expect(isGrippable("crystal")).toBe(false);
  });
});

describe("what opens it", () => {
  it("is off with the shield elsewhere, and off with the shield there but no guard", () => {
    const { world, body } = standing(4);
    expect(crystalHeld(world, body)).toBe(false);
    world.shieldCol = crystalMiddleLane(world, body);
    world.guardTick = -1000;
    expect(crystalHeld(world, body)).toBe(false);
    hold(world, body);
    expect(crystalHeld(world, body)).toBe(true);
  });

  it("is on with the shield armed under either end, not only the middle", () => {
    // The owner, 12 September 2026: the plate answers for the whole width, so
    // that the hard half of the answer is the shot and not the plate.
    const { world, body } = standing(4);
    hold(world, body);
    const left = creatureLane(world, body);
    world.shieldCol = left;
    expect(crystalHeld(world, body)).toBe(true);
    world.shieldCol = left + spanOf(body) - 1;
    expect(crystalHeld(world, body)).toBe(true);
    world.shieldCol = left + spanOf(body);
    expect(crystalHeld(world, body)).toBe(false);
  });

  it("catches a shot at the middle while the shield is not there, and nothing else happens", () => {
    const { world, body } = standing(4);
    const row = body.row;
    expect(crystalStruck(world, bolt(body, crystalMiddleLane(world, body), "red"), body)).toBe(
      false,
    );
    expect(body.kind).toBe("crystal");
    expect(body.row).toBe(row);
    expect(body.fromRow).toBe(row - CFG.crystalRows);
    expect(of(world, "reject")).toHaveLength(1);
    expect(of(world, "crystalCatch")).toHaveLength(1);
    expect(of(world, "crystalSplit")).toHaveLength(0);
  });

  it("catches a shot at either end even while the whole condition holds", () => {
    const { world, body } = standing(4);
    hold(world, body);
    const row = body.row;
    expect(crystalStruck(world, bolt(body, creatureLane(world, body), "red"), body)).toBe(false);
    expect(body.kind).toBe("crystal");
    expect(body.row).toBe(row);
  });

  it("catches the wrong colour at a held middle, and the body goes on as it was", () => {
    const { world, body } = standing(4, "cyan");
    hold(world, body);
    const row = body.row;
    expect(resolve(world, bolt(body, crystalMiddleLane(world, body), "red"), body)).toBe(false);
    expect(body.kind).toBe("crystal");
    expect(body.row).toBe(row);
    expect(of(world, "reject")).toHaveLength(1);
  });

  it("is opened at the middle it is drawn on part-way across a beat, not the one it is going to", () => {
    // One tick into a beat the body is still drawn in the lane it is leaving
    // (`creatureLane`), and that is the lane a bolt is found against — so the
    // join it can open is that lane's middle, one column behind `col`'s.
    const { world, body } = standing(4);
    hold(world, body);
    const drawn = crystalMiddleLane(world, body);
    expect(drawn).toBe(crystalMiddleCol(body) - CFG.crystalCols);
    expect(crystalStruck(world, bolt(body, crystalMiddleCol(body), "red"), body)).toBe(false);
    expect(body.kind).toBe("crystal");
    expect(crystalStruck(world, bolt(body, drawn, "red"), body)).toBe(false);
    expect(body.kind).not.toBe("crystal");
    expect(of(world, "crystalSplit")).toHaveLength(1);
  });

  it("splits into a red slick on the left and a cyan bulb on the right when all four hands agree", () => {
    const { world, body } = standing(4, "cyan");
    hold(world, body);
    const col = body.col;
    const row = body.row;
    const score = world.score;
    expect(resolve(world, bolt(body, crystalMiddleLane(world, body), "cyan"), body)).toBe(false);
    expect(of(world, "crystalSplit")).toHaveLength(1);
    expect(of(world, "destroy")).toHaveLength(0);
    expect(world.creatures).toHaveLength(2);
    const [left, right] = world.creatures as [Creature, Creature];
    expect([left.kind, left.color, left.col, left.row]).toEqual(["slick", "red", col, row]);
    expect([right.kind, right.color, right.col, right.row]).toEqual(["bulb", "cyan", col + 2, row]);
    expect(left.crystalDir).toBeUndefined();
    expect(spanOf(left)).toBe(1);
    expect(world.score).toBe(score + CFG.scoreCrystalSplit);
  });

  it("falls straight as two plain bodies afterwards, killed by the matching cannon", () => {
    const { world, body } = standing(4, "cyan");
    hold(world, body);
    resolve(world, bolt(body, crystalMiddleLane(world, body), "cyan"), body);
    const cols = world.creatures.map((c) => c.col);
    for (let t = 0; t < TPB; t++) step(world, []);
    expect(world.creatures.map((c) => c.col)).toEqual(cols);
    const left = world.creatures[0]!;
    world.events.length = 0;
    resolve(world, bolt(left, left.col, "red"), left);
    expect(of(world, "destroy")).toHaveLength(1);
  });
});

describe("what a whole one costs", () => {
  it("takes damageCrystal off the hull, and the shield alone never stops it", () => {
    // The shield in every column on every beat, with the trigger held down
    // the whole way — the carom test's arrangement, so the failure cannot be
    // blamed on aim or timing. Regeneration off, so the number is the blow.
    const inputs: TimedCommand[] = [];
    for (let beat = 0; beat <= HULL / CFG.crystalRows + 1; beat++) {
      for (let col = 0; col < CFG.cols; col++) inputs.push(shield(TPB * beat, col));
      inputs.push(guard(TPB * beat));
    }
    const world = createWorld({ ...CFG }, 0, [crystal(0)]);
    const byTick = new Map<number, TimedCommand[]>();
    for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
    for (let t = 0; t < tickAtRow(HULL) + TPB + 1; t++) step(world, byTick.get(t) ?? []);
    expect(world.creatures).toHaveLength(0);
    expect(world.retries).toBe(1);
  });
});

describe("two devices", () => {
  it("replays deterministically: crossed, bounced, held, split and shot", () => {
    const at = tickAtRow(5);
    const replay = record({
      name: "crystal held and split",
      seed: 3,
      queue: [crystal(0, "red"), crystal(6, "cyan")],
      ticks: TPB * 16,
      inputs: [
        ...[1, 4, 7].flatMap((col, i) => [
          shield(at + TPB * i, col),
          aim(at + TPB * i, col),
          guard(at + TPB * i + 2),
          fire(at + TPB * i + 2, i % 2 ? "cyan" : "red"),
        ]),
      ],
    });
    const world = runReplay(replay);
    expect(world.beat).toBeGreaterThan(0);
    // Two runs in one process, never a pinned constant (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts the heading into the fingerprint, so two devices cannot differ", () => {
    const left = run([crystal(0)], TPB + 1);
    const right = run([crystal(CFG.cols - 3)], TPB + 1);
    expect(hashWorld(left)).not.toBe(hashWorld(right));
  });
});
