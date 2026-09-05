import { describe, expect, it } from "bun:test";
import {
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  fallTilesPerBeat,
  hashWorld,
  hullPercent,
  hullRow,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG); // 75
const HULL = hullRow(CFG); // 14

/**
 * A creature listed at wave-beat 0 spawns on the first beat and stands on row
 * 0; from there one row per beat. So it meets the hull on beat `HULL + 1`.
 */
const IMPACT_TICK = TPB * (HULL + 1);
/**
 * The beat a body nobody answered is actually *through* the hull: one beat
 * past the beat it lands on it. Every body stops on the ship's row instead of
 * falling past it, and spends the beat render/ draws it crossing that last
 * tile standing there — which is the last beat the shield can still turn a
 * rock and the cannon can still break a slick (`hull.ts`). Every miss below is
 * measured from here, every save from `IMPACT_TICK`.
 */
const BREACH_TICK = IMPACT_TICK + TPB;

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const meteor = (col: number): SpawnEntry => ({ beat: 0, col, kind: "meteor", color: null });
const slick = (col: number, color: Color): SpawnEntry => ({ beat: 0, col, kind: "slick", color });
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
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

describe("the beat", () => {
  it("moves a creature exactly one tile per beat, on tile centres", () => {
    const { world } = run([slick(3, "red")], TPB * 6 + 1);
    // Spawned on beat 1 at row 0, so after six beats it stands on row 5.
    expect(world.creatures).toHaveLength(1);
    expect(world.creatures[0]!.row).toBe(5);
    expect(Number.isInteger(world.creatures[0]!.row)).toBe(true);
  });

  it("brings a creature in from above the grid, not out of thin air", () => {
    const { world } = run([slick(3, "red")], TPB + 1);
    expect(world.creatures[0]!.row).toBe(0);
    expect(world.creatures[0]!.fromRow).toBe(-1);
  });
});

describe("the hull", () => {
  it("takes damage and keeps a break where a creature landed", () => {
    const { world } = run([slick(4, "red")], BREACH_TICK + 1);
    expect(world.creatures).toHaveLength(0);
    expect(hullPercent(world)).toBeLessThan(100);
    expect(world.scars.map((s) => s.col)).toContain(4);
  });

  it("regenerates slowly, and the break stays", () => {
    const after = run([slick(4, "red")], BREACH_TICK + 1);
    const later = run([slick(4, "red")], BREACH_TICK + CFG.tickHz);
    expect(hullPercent(later.world)).toBeGreaterThan(hullPercent(after.world));
    // A second of regeneration is worth exactly hullRegenPerSecond points.
    expect(hullPercent(later.world) - hullPercent(after.world)).toBeCloseTo(
      CFG.hullRegenPerSecond,
      1,
    );
    expect(later.world.scars).toHaveLength(1);
  });
});

describe("the shield", () => {
  it("deflects only when player 2 has the column and player 1 triggers in time", () => {
    const { world, events } = run([meteor(5)], IMPACT_TICK + 1, [
      shieldTo(10, 5),
      guard(IMPACT_TICK - 20),
    ]);
    expect(world.guard.deflected).toBe(1);
    expect(world.guard.mistimed).toBe(0);
    expect(world.guard.tries).toBe(1);
    expect(hullPercent(world)).toBe(100);
    expect(events.some((e) => e.type === "deflect")).toBe(true);
  });

  it("counts the right column at the wrong moment separately", () => {
    // The interesting failure: they agreed on where and missed on when.
    // Measured back from the beat the rock meets the *shield*, one row above
    // the hull — that is the moment the trigger is judged against now, so a
    // press 30 ticks past the edge of the window has to be 30 ticks past
    // that edge and not the ship's (`shieldRow`, sim/hull.ts).
    const early = IMPACT_TICK - TPB - Math.round((CFG.guardWindowMs / 1000) * CFG.tickHz) - 30;
    const { world } = run([meteor(5)], BREACH_TICK + 1, [shieldTo(10, 5), guard(early)]);
    expect(world.guard.deflected).toBe(0);
    expect(world.guard.mistimed).toBe(1);
    expect(hullPercent(world)).toBeLessThan(100);
  });

  it("does nothing from the wrong column, however well timed", () => {
    const { world } = run([meteor(5)], BREACH_TICK + 1, [shieldTo(10, 2), guard(IMPACT_TICK - 20)]);
    expect(world.guard.deflected).toBe(0);
    expect(world.guard.mistimed).toBe(0);
    expect(world.guard.tries).toBe(1);
    expect(hullPercent(world)).toBeLessThan(100);
  });

  it("position alone is not enough", () => {
    const { world } = run([meteor(5)], BREACH_TICK + 1, [shieldTo(10, 5)]);
    expect(world.guard.deflected).toBe(0);
    expect(world.guard.mistimed).toBe(1);
  });

  it("deflects a faster rock tier too, not just the original meteor", () => {
    // Regression: resolveHull used to test `c.kind === "meteor"` literally,
    // so every other tier fell through to the creature branch — undeflectable
    // chip damage instead of a guard try. Any tier must reach the shield
    // branch the same way.
    const rate = fallTilesPerBeat("meteorFast");
    const impactBeat = Math.ceil(HULL / rate) + 1;
    const impactTick = TPB * impactBeat;
    const { world, events } = run(
      [{ beat: 0, col: 5, kind: "meteorFast", color: null }],
      impactTick + 1,
      [shieldTo(10, 5), guard(impactTick - 20)],
    );
    expect(world.guard.tries).toBe(1);
    expect(world.guard.deflected).toBe(1);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreDeflect);
    expect(hullPercent(world)).toBe(100);
    expect(events.some((e) => e.type === "deflect")).toBe(true);
  });
});

describe("shots", () => {
  it("destroy a creature of the matching colour", () => {
    const inputs = [aim(10, 3)];
    for (let t = 200; t < IMPACT_TICK; t += 60) inputs.push(fire(t, "red"));
    const { world, events } = run([slick(3, "red")], IMPACT_TICK, inputs);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreDestroy);
    expect(hullPercent(world)).toBe(100);
  });

  it("bounce off a creature of the wrong colour", () => {
    const inputs = [aim(10, 3)];
    for (let t = 200; t < IMPACT_TICK; t += 60) inputs.push(fire(t, "cyan"));
    const { world, events } = run([slick(3, "red")], IMPACT_TICK - 1, inputs);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(world.creatures).toHaveLength(1);
  });

  it("leave a hole in a meteor and do nothing else", () => {
    const inputs = [aim(10, 3)];
    for (let t = 200; t < IMPACT_TICK; t += 60) inputs.push(fire(t, "red"));
    const { world, events } = run([meteor(3)], IMPACT_TICK - 1, inputs);
    expect(world.creatures).toHaveLength(1);
    expect(world.creatures[0]!.holes).toBeGreaterThan(0);
    expect(world.creatures[0]!.holes).toBeLessThanOrEqual(CFG.maxHoles);
    expect(events.some((e) => e.type === "hole")).toBe(true);
  });

  it("keep to the beat: twelve tiles per beat, half a beat between shots", () => {
    const { world } = run([], 300, [fire(0, "red"), fire(20, "cyan")]);
    // The second shot falls inside the cooldown and never happens.
    expect(world.bullets.length + world.nextId).toBeGreaterThan(0);
    const fired = run([], 2, [fire(0, "red"), fire(1, "cyan")]);
    expect(fired.world.bullets).toHaveLength(1);

    // A bullet already advances on the tick it is fired, so one beat of travel
    // is exactly TPB iterations.
    const one = run([], TPB, [fire(0, "red")]);
    const b = one.world.bullets[0]!;
    const travelled = HULL - 1 - b.row + b.subMilli / 1000;
    expect(travelled).toBeCloseTo(CFG.bulletTilesPerBeat, 6);
  });
});

describe("waves", () => {
  it("asks the host for the next wave once the field is clear", () => {
    const { world, events } = run([slick(3, "red")], IMPACT_TICK + TPB * 5);
    const asks = events.filter((e) => e.type === "needWave");
    expect(asks).toHaveLength(1);
    expect(asks[0]).toEqual({ type: "needWave", wave: 1 });
    // Asked exactly once — the host has not answered, and it does not nag.
    expect(world.restBeat).toBe(-1);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreWave);
  });
});

describe("replays across waves", () => {
  it("plays on into a wave the replay carries, and stops at one it does not", () => {
    const two = record({
      name: "two waves",
      seed: 0,
      ticks: IMPACT_TICK + TPB * 6,
      queues: [[slick(3, "red")], [meteor(6)]],
      inputs: [],
    });
    const world = runReplay(two);
    expect(world.wave).toBe(1);
    expect(world.creatures[0]!.kind).toBe("meteor");
    // Same inputs, same fingerprint — the whole point of the format.
    expect(hashWorld(runReplay(two))).toBe(two.expectHash!);

    // Without a queue for wave 1 the field simply stays empty.
    const one = runReplay({ ...two, queues: [[slick(3, "red")]] });
    expect(one.wave).toBe(0);
    expect(one.creatures).toHaveLength(0);
  });
});
