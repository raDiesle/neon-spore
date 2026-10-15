import { describe, expect, it } from "bun:test";
import {
  blisterIsUp,
  blisterLeft,
  blisterLeverHeld,
  blisterLeverInBand,
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
 * THE BLISTER's LEVER (`sim/blister-lever.ts`): THE LEVER LAB's lever on the
 * body — its knob carried down a groove into a band and held there for
 * `blisterLeverBeats`, a blow for every hold long enough. Out of the band the
 * count starts again; a hand counted once is spent until it lifts; a lift
 * before the hold is done is refused out loud; a sink loses the hold.
 */

/** Up four beats rather than two, so a test can hold, lift and hold again in one surfacing. */
const CFG: SimConfig = { ...DEFAULT_CONFIG, blisterUpBeats: 4 };
const TPB = ticksPerBeat(CFG);
const HOLD = CFG.blisterLeverBeats * TPB;
const BAND = Math.round((CFG.blisterLeverFromMilli + CFG.blisterLeverToMilli) / 2);

const levered = (count: number, by: 1 | 2 | "both" = 2): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count,
  gesture: "lever",
});

const lever = (tick: number, player: 1 | 2, id: number, on: boolean, y: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "blisterLever", on, fromMilli: 0, fromYMilli: y, id },
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
  /** The knob taken and carried to `y`, in one tick each. */
  const carry = (player: 1 | 2, y: number) => {
    const id = body()!.id;
    go(1, [lever(world.tick, player, id, true, 0)]);
    go(1, [lever(world.tick, player, id, true, y)]);
  };
  const lift = (player: 1 | 2) => go(1, [lever(world.tick, player, body()!.id, false, 0)]);
  const blows = () => events.filter((e) => e.type === "blisterBlow").length;
  return { world, events, go, body, untilUp, carry, lift, blows };
}

describe("a LEVER blister, its knob held in the band", () => {
  it("takes a blow for a hold the length it asks, and none before", () => {
    const s = stage([levered(3)]);
    s.untilUp();
    s.carry(2, BAND);
    expect(blisterLeverInBand(s.world, s.body()!)).toBe(true);
    s.go(HOLD - 2);
    expect(s.blows()).toBe(0);
    s.go(1);
    expect(s.blows()).toBe(1);
  });

  it("is spent once counted, until it lifts and is carried again", () => {
    const s = stage([levered(3)]);
    s.untilUp();
    s.carry(2, BAND);
    s.go(HOLD);
    expect(s.blows()).toBe(1);
    expect(blisterLeverHeld(s.body()!)).toBe(false);
    s.go(4);
    expect(s.blows()).toBe(1);
    s.lift(2);
    expect(s.events.some((e) => e.type === "pullShort")).toBe(false);
    s.carry(2, BAND);
    s.go(HOLD);
    expect(s.blows()).toBe(2);
  });

  it("counts nothing short of the band, nor past it, and starts again out of it", () => {
    const s = stage([levered(3)]);
    s.untilUp();
    s.carry(2, CFG.blisterLeverFromMilli - 100);
    s.go(HOLD / 2);
    expect(s.blows()).toBe(0);
    const id = s.body()!.id;
    s.go(1, [lever(s.world.tick, 2, id, true, CFG.blisterLeverMilli)]);
    s.go(HOLD / 2);
    expect(s.blows()).toBe(0);
    s.go(1, [lever(s.world.tick, 2, id, true, BAND)]);
    s.go(HOLD - 3);
    s.go(1, [lever(s.world.tick, 2, id, true, CFG.blisterLeverMilli)]);
    s.go(1, [lever(s.world.tick, 2, id, true, BAND)]);
    s.go(HOLD - 2);
    expect(s.blows()).toBe(0);
    s.go(1);
    expect(s.blows()).toBe(1);
  });

  it("refuses out loud a lift before the hold is done, and never a press that did not move", () => {
    const s = stage([levered(3)]);
    s.untilUp();
    const id = s.body()!.id;
    s.go(1, [lever(s.world.tick, 2, id, true, 0)]);
    s.lift(2);
    expect(s.events.filter((e) => e.type === "pullShort")).toHaveLength(0);
    s.carry(2, BAND);
    s.go(2);
    s.lift(2);
    expect(s.events.filter((e) => e.type === "pullShort")).toHaveLength(1);
    expect(s.blows()).toBe(0);
  });

  it("loses the hold when it sinks, and the hand counts nothing until it lifts", () => {
    const s = stage([levered(3)]);
    s.untilUp();
    s.carry(2, BAND);
    while (s.body() && blisterIsUp(s.body()!)) s.go(1);
    expect(s.blows()).toBe(1);
    s.untilUp();
    const id = s.body()!.id;
    s.go(1, [lever(s.world.tick, 2, id, true, BAND)]);
    s.go(HOLD);
    expect(s.blows()).toBe(1);
    expect(blisterLeft(CFG, s.body()!)).toBe(2);
  });

  it("counts nothing from the seat its `by` does not name", () => {
    const s = stage([levered(3)]);
    s.untilUp();
    s.carry(1, BAND);
    s.go(HOLD);
    expect(s.blows()).toBe(0);
  });

  it("replays to the same world", () => {
    const s = stage([levered(1)]);
    const c = s.untilUp();
    const at = s.world.tick;
    const replay = record({
      name: "a LEVER blister held out",
      seed: 0,
      queue: [levered(1)],
      ticks: at + 2 * TPB,
      inputs: [lever(at, 2, c.id, true, 0), lever(at + 1, 2, c.id, true, BAND)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(runReplay(replay).creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
