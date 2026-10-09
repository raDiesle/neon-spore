import { describe, expect, it } from "bun:test";
import {
  blisterIsUp,
  blisterLeft,
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE BLISTER's RUB (`sim/blister-rub.ts`): a scrub back and forth over the
 * body, a blow a reversal. The hand is a `RubCount` on `blisterRub` — `id`
 * the reversals since it went down, the body in `fromMilli` — and each count
 * higher than the last is that many fresh reversals. A sink leaves a hand
 * still rubbing dead until it lifts.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const rubbed = (count: number, by: 1 | 2 | "both" = 2): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count,
  gesture: "rub",
});

const says = (
  tick: number,
  player: 1 | 2,
  body: number,
  turns: number,
  on = true,
): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "blisterRub", on, fromMilli: body, fromYMilli: 0, id: turns },
});

function stage(queue: SpawnEntry[]) {
  const world = createWorld({ ...CFG }, 0, queue);
  const events: SimEvent[] = [];
  const go = (ticks: number, inputs: TimedCommand[] = []) => {
    for (let t = 0; t < ticks; t++) {
      step(
        world,
        inputs.filter((i) => i.tick === world.tick),
      );
      events.push(...world.events);
    }
  };
  const body = () => world.creatures.find((c) => c.kind === "blister");
  const untilUp = (): Creature => {
    for (let t = 0; t < TPB * 12; t++) {
      const c = body();
      if (c && blisterIsUp(c)) return c;
      go(1);
    }
    throw new Error("the blister never came up");
  };
  /** A press, `turns` reversals a tick apart, and a lift. */
  const rub = (player: 1 | 2, turns: number) => {
    const c = body();
    if (!c) throw new Error("no blister to rub");
    for (let n = 0; n <= turns; n++) go(1, [says(world.tick, player, c.id, n)]);
    go(1, [says(world.tick, player, c.id, turns, false)]);
  };
  const blows = () => events.filter((e) => e.type === "blisterBlow").length;
  return { world, events, go, body, untilUp, rub, blows };
}

describe("a RUB blister, scrubbed back and forth", () => {
  it("is knocked out by its count of reversals", () => {
    const s = stage([rubbed(3)]);
    s.untilUp();
    s.rub(2, 3);
    expect(s.blows()).toBe(3);
    expect(s.body()).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
  });

  it("is not, by one reversal too few", () => {
    const s = stage([rubbed(3)]);
    s.untilUp();
    s.rub(2, 2);
    expect(s.blows()).toBe(2);
    expect(blisterLeft(CFG, s.body()!)).toBe(1);
  });

  it("counts nothing for the press, and starts again from nought after a lift", () => {
    const s = stage([rubbed(5)]);
    s.untilUp();
    s.rub(2, 0);
    expect(s.blows()).toBe(0);
    s.rub(2, 2);
    s.rub(2, 1);
    expect(s.blows()).toBe(3);
  });

  it("counts nothing more from a hand still rubbing when it sinks, until it lifts", () => {
    const s = stage([rubbed(5)]);
    const c = s.untilUp();
    s.go(1, [says(s.world.tick, 2, c.id, 0)]);
    s.go(1, [says(s.world.tick, 2, c.id, 1)]);
    while (s.body() && blisterIsUp(s.body()!)) s.go(1);
    s.untilUp();
    s.go(1, [says(s.world.tick, 2, c.id, 4)]);
    expect(s.blows()).toBe(1);
    s.go(1, [says(s.world.tick, 2, c.id, 4, false)]);
    s.rub(2, 1);
    expect(s.blows()).toBe(2);
  });

  it("counts nothing from the seat its `by` does not name", () => {
    const s = stage([rubbed(3)]);
    s.untilUp();
    s.rub(1, 3);
    expect(s.blows()).toBe(0);
  });

  it("counts each hand's own reversals on a BOTH blister", () => {
    const s = stage([rubbed(4, "both")]);
    const c = s.untilUp();
    const t = s.world.tick;
    s.go(3, [
      says(t, 1, c.id, 0),
      says(t, 2, c.id, 0),
      says(t + 1, 1, c.id, 1),
      says(t + 1, 2, c.id, 1),
      says(t + 2, 1, c.id, 2),
    ]);
    expect(s.blows()).toBe(3);
  });

  it("replays to the same world", () => {
    const s = stage([rubbed(2)]);
    const c = s.untilUp();
    const at = s.world.tick;
    const replay = record({
      name: "a RUB blister rubbed out",
      seed: 0,
      queue: [rubbed(2)],
      ticks: at + TPB,
      inputs: [says(at, 2, c.id, 0), says(at + 1, 2, c.id, 1), says(at + 2, 2, c.id, 2)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(runReplay(replay).creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
