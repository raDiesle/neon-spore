import { describe, expect, it } from "bun:test";
import {
  blisterIsUp,
  blisterLeft,
  blisterStrokes,
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
 * THE BLISTER's COMBO (`sim/blister.ts`, `sim/blister-swipe.ts`): THE COMBO
 * LAB's PRESS, THEN PULL on the body — a `tap` that is counted and gone, and
 * then SWIPE's stroke to the right in its place; the two are one blow. The
 * pull alone counts nothing, the press alone counts nothing, and a sink
 * between them loses the press.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const REACH = CFG.blisterSwipeMilli;

const combo = (count: number, by: 1 | 2 | "both" = 2): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count,
  gesture: "combo",
});

const tap = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "tap", id },
});

const drag = (tick: number, player: 1 | 2, id: number, on: boolean, x: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "blisterSwipe", on, fromMilli: x, fromYMilli: 0, id },
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
  const press = (player: 1 | 2) => go(1, [tap(world.tick, player, body()!.id)]);
  /** A stroke to the right, `x` thousandths of a tile, pressed and lifted. */
  const pull = (player: 1 | 2, x = REACH) => {
    const id = body()!.id;
    go(1, [drag(world.tick, player, id, true, 0)]);
    go(1, [drag(world.tick, player, id, false, x)]);
  };
  const blows = () => events.filter((e) => e.type === "blisterBlow").length;
  return { world, events, go, body, untilUp, press, pull, blows };
}

describe("a COMBO blister, pressed and then pulled", () => {
  it("takes a blow for a press and then a pull, and asks for the press again", () => {
    const s = stage([combo(3)]);
    s.untilUp();
    s.press(2);
    expect(s.blows()).toBe(0);
    expect(blisterStrokes(s.body()!)).toBe(true);
    s.pull(2);
    expect(s.blows()).toBe(1);
    expect(blisterStrokes(s.body()!)).toBe(false);
    s.pull(2);
    expect(s.blows()).toBe(1);
  });

  it("is knocked out by its count of presses and pulls", () => {
    const s = stage([combo(2)]);
    s.untilUp();
    s.press(2);
    s.pull(2);
    s.press(2);
    s.pull(2);
    expect(s.blows()).toBe(2);
    expect(s.body()).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
  });

  it("counts nothing for a pull with no press before it, nor for presses alone", () => {
    const s = stage([combo(3)]);
    s.untilUp();
    s.pull(2);
    s.press(2);
    s.press(2);
    expect(s.blows()).toBe(0);
    expect(blisterLeft(CFG, s.body()!)).toBe(3);
  });

  it("refuses a pull let go short, and keeps the press for the next one", () => {
    const s = stage([combo(3)]);
    s.untilUp();
    s.press(2);
    s.pull(2, REACH / 2);
    expect(s.blows()).toBe(0);
    expect(s.events.some((e) => e.type === "pullShort")).toBe(true);
    s.pull(2);
    expect(s.blows()).toBe(1);
  });

  it("loses the press when it sinks before the pull", () => {
    const s = stage([combo(3)]);
    s.untilUp();
    s.press(2);
    while (s.body() && blisterIsUp(s.body()!)) s.go(1);
    s.untilUp();
    expect(blisterStrokes(s.body()!)).toBe(false);
    s.pull(2);
    expect(s.blows()).toBe(0);
  });

  it("counts nothing from the seat its `by` does not name", () => {
    const s = stage([combo(3)]);
    s.untilUp();
    s.press(1);
    s.pull(1);
    expect(s.blows()).toBe(0);
    expect(blisterStrokes(s.body()!)).toBe(false);
  });

  it("takes the press from one hand and the pull from the other on a BOTH blister", () => {
    const s = stage([combo(3, "both")]);
    s.untilUp();
    s.press(1);
    s.pull(2);
    expect(s.blows()).toBe(1);
  });

  it("replays to the same world", () => {
    const s = stage([combo(1)]);
    const c = s.untilUp();
    const at = s.world.tick;
    const replay = record({
      name: "a COMBO blister pressed and pulled out",
      seed: 0,
      queue: [combo(1)],
      ticks: at + TPB,
      inputs: [
        tap(at, 2, c.id),
        drag(at + 1, 2, c.id, true, 0),
        drag(at + 2, 2, c.id, false, REACH),
      ],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(runReplay(replay).creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
