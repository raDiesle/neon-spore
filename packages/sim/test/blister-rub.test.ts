import { describe, expect, it } from "bun:test";
import {
  blisterIsUp,
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
 * body, and the first reversal is the one blow that knocks it out. The hand
 * is a `RubCount` on `blisterRub` — `id` the reversals since it went down,
 * the body in `fromMilli` — and a count higher than the last is a fresh
 * reversal.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const rubbed = (by: 1 | 2 | "either" | "both" = 2): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by,
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
  it("is knocked out by its first reversal", () => {
    const s = stage([rubbed()]);
    s.untilUp();
    s.rub(2, 1);
    expect(s.blows()).toBe(1);
    expect(s.body()).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
  });

  it("counts nothing for the press alone", () => {
    const s = stage([rubbed()]);
    s.untilUp();
    s.rub(2, 0);
    expect(s.blows()).toBe(0);
    expect(blisterIsUp(s.body()!)).toBe(true);
    s.rub(2, 1);
    expect(s.body()).toBeUndefined();
  });

  it("counts nothing from the seat its `by` does not name", () => {
    const s = stage([rubbed()]);
    s.untilUp();
    s.rub(1, 3);
    expect(s.blows()).toBe(0);
  });

  it("is knocked out once by two hands turning back together on an EITHER blister", () => {
    const s = stage([rubbed("either")]);
    const c = s.untilUp();
    const t = s.world.tick;
    s.go(2, [
      says(t, 1, c.id, 0),
      says(t, 2, c.id, 0),
      says(t + 1, 1, c.id, 1),
      says(t + 1, 2, c.id, 1),
    ]);
    expect(s.blows()).toBe(1);
    expect(s.body()).toBeUndefined();
  });

  it("replays to the same world", () => {
    const s = stage([rubbed()]);
    const c = s.untilUp();
    const at = s.world.tick;
    const replay = record({
      name: "a RUB blister rubbed out",
      seed: 0,
      queue: [rubbed()],
      ticks: at + TPB,
      inputs: [says(at, 2, c.id, 0), says(at + 1, 2, c.id, 1)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(runReplay(replay).creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
