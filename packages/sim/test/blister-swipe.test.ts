import { describe, expect, it } from "bun:test";
import {
  type BlisterSwipeWay,
  type BlisterWay,
  blisterIsUp,
  blisterLeft,
  blisterSwipeShare,
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
 * THE BLISTER's SWIPE (`sim/blister-swipe.ts`): a stroke across the body the
 * way its arrow points, one blow a stroke. The hand is a `drag` on
 * `blisterSwipe`, and the lift is judged — far enough along its way, and more
 * along than across. A short stroke, a sideways one and one the wrong way
 * count nothing; a sink voids a stroke still open.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const FAR = CFG.blisterSwipeMilli;

const swiped = (count: number, way?: BlisterWay, by: 1 | 2 | "both" = 2): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count,
  gesture: "swipe",
  way,
});

const drag = (
  tick: number,
  player: 1 | 2,
  id: number,
  on: boolean,
  dx: number,
  dy: number,
): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "blisterSwipe", id, on, fromMilli: dx, fromYMilli: dy },
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
  /** A press, a move to (dx, dy) and a lift there, a tick each. */
  const stroke = (player: 1 | 2, dx: number, dy: number) => {
    const c = body();
    if (!c) throw new Error("no blister to stroke");
    go(1, [drag(world.tick, player, c.id, true, 0, 0)]);
    go(1, [drag(world.tick, player, c.id, true, dx, dy)]);
    go(1, [drag(world.tick, player, c.id, false, dx, dy)]);
  };
  const blows = () => events.filter((e) => e.type === "blisterBlow").length;
  return { world, events, go, body, untilUp, stroke, blows };
}

describe("a SWIPE blister, stroked the way its arrow points", () => {
  it("loses one blow to a stroke right, its way when none is named", () => {
    const s = stage([swiped(3)]);
    s.untilUp();
    s.stroke(2, FAR, 0);
    expect(s.blows()).toBe(1);
    expect(blisterLeft(CFG, s.body()!)).toBe(2);
  });

  it("is knocked out by its count of strokes", () => {
    const s = stage([swiped(2)]);
    s.untilUp();
    s.stroke(2, FAR, 0);
    s.stroke(2, FAR + 200, 100);
    expect(s.body()).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
  });

  it("counts each of the four ways only the way it points", () => {
    const strokes: Record<BlisterSwipeWay, [number, number]> = {
      right: [FAR, 0],
      left: [-FAR, 0],
      down: [0, FAR],
      up: [0, -FAR],
    };
    for (const way of Object.keys(strokes) as BlisterSwipeWay[]) {
      const s = stage([swiped(3, way)]);
      s.untilUp();
      for (const [other, [dx, dy]] of Object.entries(strokes)) {
        if (other !== way) s.stroke(2, dx, dy);
      }
      expect(s.blows()).toBe(0);
      const [dx, dy] = strokes[way];
      s.stroke(2, dx, dy);
      expect(s.blows()).toBe(1);
    }
  });

  it("counts nothing for a short stroke, or one more across than along", () => {
    const s = stage([swiped(3)]);
    s.untilUp();
    s.stroke(2, FAR - 1, 0);
    s.stroke(2, FAR, FAR + 1);
    expect(s.blows()).toBe(0);
    expect(blisterLeft(CFG, s.body()!)).toBe(3);
  });

  it("shows how far the open stroke has come, and empties on the lift", () => {
    const s = stage([swiped(3)]);
    const c = s.untilUp();
    s.go(1, [drag(s.world.tick, 2, c.id, true, 0, 0)]);
    s.go(1, [drag(s.world.tick, 2, c.id, true, FAR / 2, 0)]);
    expect(blisterSwipeShare(s.world, s.body()!)).toBe(0.5);
    s.go(1, [drag(s.world.tick, 2, c.id, false, FAR / 2, 0)]);
    expect(blisterSwipeShare(s.world, s.body()!)).toBe(0);
  });

  it("counts nothing for a stroke left open across a sink", () => {
    const s = stage([swiped(3)]);
    const c = s.untilUp();
    s.go(1, [drag(s.world.tick, 2, c.id, true, 0, 0)]);
    while (s.body() && blisterIsUp(s.body()!)) s.go(1);
    s.untilUp();
    s.go(1, [drag(s.world.tick, 2, c.id, true, FAR, 0)]);
    s.go(1, [drag(s.world.tick, 2, c.id, false, FAR, 0)]);
    expect(s.blows()).toBe(0);
    // The thumb lifted; the next stroke is a stroke again.
    s.stroke(2, FAR, 0);
    expect(s.blows()).toBe(1);
  });

  it("counts nothing from the seat its `by` does not name", () => {
    const s = stage([swiped(3)]);
    s.untilUp();
    s.stroke(1, FAR, 0);
    expect(s.blows()).toBe(0);
  });

  it("takes a blow from each hand on a BOTH blister", () => {
    const s = stage([swiped(3, "right", "both")]);
    const c = s.untilUp();
    const t = s.world.tick;
    s.go(3, [
      drag(t, 1, c.id, true, 0, 0),
      drag(t, 2, c.id, true, 0, 0),
      drag(t + 1, 1, c.id, true, FAR, 0),
      drag(t + 1, 2, c.id, true, FAR, 0),
      drag(t + 2, 1, c.id, false, FAR, 0),
      drag(t + 2, 2, c.id, false, FAR, 0),
    ]);
    expect(s.blows()).toBe(2);
  });

  it("replays to the same world", () => {
    const s = stage([swiped(1)]);
    const c = s.untilUp();
    const at = s.world.tick;
    const replay = record({
      name: "a SWIPE blister stroked out",
      seed: 0,
      queue: [swiped(1)],
      ticks: at + TPB,
      inputs: [
        drag(at, 2, c.id, true, 0, 0),
        drag(at + 1, 2, c.id, true, FAR, 0),
        drag(at + 2, 2, c.id, false, FAR, 0),
      ],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(runReplay(replay).creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
