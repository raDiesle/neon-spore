import { describe, expect, it } from "bun:test";
import {
  type BlisterBy,
  blisterHalfDone,
  blisterIsUp,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  NO_GRIP,
  record,
  runReplay,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE BLISTER's BY, the four settings (`sim/blister.ts`, `blisterDealt`): one
 * seat, either — the default — or both, each seat finishing the gesture before
 * the blow lands, and a HOLD on BOTH counted only while both hands are on.
 */

const TPB = ticksPerBeat(DEFAULT_CONFIG);

const blister = (by?: BlisterBy, gesture?: SpawnEntry["gesture"]): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  ...(by === undefined ? {} : { by }),
  ...(gesture === undefined ? {} : { gesture }),
});

function stage(queue: SpawnEntry[]) {
  const world = createWorld({ ...DEFAULT_CONFIG }, 0, queue);
  const events: SimEvent[] = [];
  const go = (ticks: number, inputs: Omit<TimedCommand, "tick">[] = []) => {
    for (let t = 0; t < ticks; t++) {
      step(world, t === 0 ? inputs.map((i) => ({ ...i, tick: world.tick })) : []);
      events.push(...world.events);
    }
  };
  const body = () => world.creatures.find((c) => c.kind === "blister");
  const id = () => body()?.id ?? -1;
  const untilUp = () => {
    for (let t = 0; t < TPB * 12 && !(body() && blisterIsUp(body()!)); t++) go(1);
    if (!body()) throw new Error("the blister never came up");
  };
  const tap = (player: 1 | 2) => go(1, [{ player, command: { kind: "tap", id: id() } }]);
  const grip = (player: 1 | 2, on = true) =>
    ({ player, command: { kind: "grip", id: on ? id() : NO_GRIP } }) as const;
  const blows = () => events.filter((e) => e.type === "blisterBlow");
  return { world, go, body, untilUp, tap, grip, blows };
}

describe("BY unset", () => {
  it("is either: player 1's tap knocks it out, as player 2's does", () => {
    for (const seat of [1, 2] as const) {
      const s = stage([blister()]);
      s.untilUp();
      expect(s.body()?.blisterBy).toBe("either");
      s.tap(seat);
      expect(s.body()).toBeUndefined();
    }
  });
});

describe("a BOTH blister", () => {
  it("is not knocked out by one seat's tap, however often", () => {
    const s = stage([blister("both")]);
    s.untilUp();
    s.tap(1);
    s.tap(1);
    expect(s.body()).toBeDefined();
    expect(blisterHalfDone(s.body()!, 1)).toBe(true);
    expect(blisterHalfDone(s.body()!, 2)).toBe(false);
    // Said once, so the seat hears it land, and marked as a half; the second
    // tap is refused, the seat's part done until the partner's lands.
    expect(s.blows().map((e) => (e.type === "blisterBlow" ? e.half : 0))).toEqual([1]);
  });

  it("is knocked out when the other seat taps too", () => {
    const s = stage([blister("both")]);
    s.untilUp();
    s.tap(2);
    s.tap(1);
    expect(s.body()).toBeUndefined();
    const last = s.blows().at(-1);
    expect(last?.type === "blisterBlow" && last.half).toBeUndefined();
  });

  it("asks both halves again for each blow it owes", () => {
    const s = stage([{ ...blister("both"), blows: 2 }]);
    s.untilUp();
    s.tap(1);
    s.tap(2);
    expect(s.body()?.blisterBlowsDone).toBe(1);
    expect(s.body()?.blisterHalves).toBeUndefined();
    s.tap(1);
    expect(s.body()).toBeDefined();
    s.tap(2);
    expect(s.body()).toBeUndefined();
  });

  it("on a HOLD, counts nothing under one hand", () => {
    const s = stage([blister("both", "hold")]);
    s.untilUp();
    s.go(TPB * 2, [s.grip(1)]);
    expect(s.body()).toBeDefined();
    expect(s.body()?.blisterHeldTicks).toBeUndefined();
  });

  it("on a HOLD, gives under two hands held together for the beat, a tick a tick", () => {
    const s = stage([blister("both", "hold")]);
    s.untilUp();
    s.go(TPB - 1, [s.grip(1), s.grip(2)]);
    expect(s.body()).toBeDefined();
    s.go(1);
    expect(s.body()).toBeUndefined();
  });

  it("replays to the same world", () => {
    const s = stage([blister("both")]);
    s.untilUp();
    const at = s.world.tick;
    const c = s.body()!.id;
    const replay = record({
      name: "a BOTH blister tapped by each seat",
      seed: 0,
      queue: [blister("both")],
      ticks: at + TPB,
      inputs: [
        { tick: at, player: 1, command: { kind: "tap", id: c } },
        { tick: at + 3, player: 2, command: { kind: "tap", id: c } },
      ],
    });
    const world = runReplay(replay);
    expect(hashWorld(world)).toBe(replay.expectHash!);
    expect(world.creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
