import { describe, expect, it } from "bun:test";
import {
  blisterIsUp,
  blisterLeft,
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  gripsCreature,
  hashWorld,
  NO_GRIP,
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
 * THE BLISTER's HOLD (`sim/blister-hold.ts`): a press kept on it while it is
 * up, one blow a beat held, the count kept across surfacings as a tap's is,
 * and the beat in progress lost on a release or a sink. The press is the
 * ordinary `grip`, which is a mouse's press exactly as it is a thumb's: one
 * pointer down, one pointer up.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const held = (count: number, by: 1 | 2 | "both" = 2): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count,
  gesture: "hold",
});

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
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
  /** Presses from `player` now and keeps the press for `ticks`, then lets go. */
  const hold = (player: 1 | 2, ticks: number) => {
    const c = body();
    if (!c) throw new Error("no blister to hold");
    go(1, [grip(world.tick, player, c.id)]);
    go(ticks - 1);
    go(1, [grip(world.tick, player, NO_GRIP)]);
  };
  const blows = () => events.filter((e) => e.type === "blisterBlow").length;
  return { world, events, go, body, untilUp, hold, blows };
}

describe("a HOLD blister, held by a press (a mouse's as a thumb's)", () => {
  it("is knocked out by a press kept on it for its count of beats", () => {
    const s = stage([held(2)]);
    s.untilUp();
    s.hold(2, TPB * 2);
    expect(s.blows()).toBe(2);
    expect(s.body()).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
  });

  it("is not, by one let go a beat early", () => {
    const s = stage([held(2)]);
    s.untilUp();
    s.hold(2, TPB * 2 - TPB);
    expect(s.blows()).toBe(1);
    expect(blisterLeft(CFG, s.body()!)).toBe(1);
  });

  it("loses the beat in progress on a release, and never a blow dealt", () => {
    const s = stage([held(2)]);
    s.untilUp();
    s.hold(2, TPB + TPB / 2);
    expect(s.blows()).toBe(1);
    expect(s.body()?.blisterHeldTicks).toBeUndefined();
  });

  it("keeps its count across a sink, and lets go of a hand left on it", () => {
    const s = stage([held(3)]);
    const c = s.untilUp();
    s.go(1, [grip(s.world.tick, 2, c.id)]);
    while (s.body() && blisterIsUp(s.body()!)) s.go(1);
    // Up for its two beats, held through both: two blows, one owed, hand off.
    expect(s.blows()).toBe(CFG.blisterUpBeats);
    expect(gripsCreature(s.world, 2, c.id)).toBe(false);
    s.untilUp();
    s.hold(2, TPB);
    expect(s.body()).toBeUndefined();
  });

  it("refuses the hand its `by` does not name, and a tap counts nothing on it", () => {
    const s = stage([held(2)]);
    const c = s.untilUp();
    s.go(1, [grip(s.world.tick, 1, c.id)]);
    expect(gripsCreature(s.world, 1, c.id)).toBe(false);
    s.go(1, [{ tick: s.world.tick, player: 2, command: { kind: "tap", id: c.id } }]);
    s.go(TPB);
    expect(s.blows()).toBe(0);
  });

  it("finishes twice as fast under two hands on a BOTH blister", () => {
    const s = stage([held(2, "both")]);
    const c = s.untilUp();
    s.go(1, [grip(s.world.tick, 1, c.id), grip(s.world.tick, 2, c.id)]);
    s.go(TPB - 1);
    expect(s.body()).toBeUndefined();
  });

  it("refuses a hand on a TAP blister, so a tap that rests stays a tap", () => {
    const s = stage([{ ...held(2), gesture: undefined }]);
    const c = s.untilUp();
    s.go(1, [grip(s.world.tick, 2, c.id)]);
    expect(gripsCreature(s.world, 2, c.id)).toBe(false);
  });

  it("replays to the same world", () => {
    const s = stage([held(2)]);
    const c = s.untilUp();
    const at = s.world.tick;
    const replay = record({
      name: "a HOLD blister held out",
      seed: 0,
      queue: [held(2)],
      ticks: at + TPB * 3,
      inputs: [grip(at, 2, c.id), grip(at + TPB * 2, 2, NO_GRIP)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(runReplay(replay).creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
