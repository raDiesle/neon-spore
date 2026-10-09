import { describe, expect, it } from "bun:test";
import {
  BEARING_TURN,
  type BlisterTurnWay,
  blisterIsUp,
  blisterLeft,
  blisterTurnShare,
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  NO_BEARING,
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
 * THE BLISTER's TURN (`sim/blister-turn.ts`): a full turn round the body the
 * way its channel runs, one blow a turn. The hand is a `drag` on
 * `blisterTurn` read the crank's way — the press with no bearing, every move
 * a bearing round the body's centre, the step between two up to half a turn
 * progress. The wrong way round counts nothing; a sink loses the turn short
 * of whole and leaves the hand on it dead until it lifts.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const EIGHTH = BEARING_TURN / 8;

const turned = (count: number, way?: BlisterTurnWay, by: 1 | 2 | "both" = 2): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by,
  count,
  gesture: "turn",
  way,
});

const drag = (tick: number, player: 1 | 2, id: number, on: boolean, at: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "blisterTurn", id, on, fromMilli: at },
});

/** Bearings an eighth apart from the top, `eighths` of them, signed by the way. */
const round = (eighths: number, sign: 1 | -1): number[] =>
  Array.from(
    { length: eighths + 1 },
    (_, i) => (((sign * i * EIGHTH) % BEARING_TURN) + BEARING_TURN) % BEARING_TURN,
  );

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
  const press = (player: 1 | 2, id: number) =>
    go(1, [drag(world.tick, player, id, true, NO_BEARING)]);
  const through = (player: 1 | 2, id: number, bearings: number[]) => {
    for (const at of bearings) go(1, [drag(world.tick, player, id, true, at)]);
  };
  const lift = (player: 1 | 2, id: number) => go(1, [drag(world.tick, player, id, false, 0)]);
  /** A press, the thumb round `eighths` eighths of a turn, and a lift. */
  const wind = (player: 1 | 2, eighths: number, sign: 1 | -1 = 1) => {
    const c = body();
    if (!c) throw new Error("no blister to turn");
    press(player, c.id);
    through(player, c.id, round(eighths, sign));
    lift(player, c.id);
  };
  const blows = () => events.filter((e) => e.type === "blisterBlow").length;
  return { world, events, go, body, untilUp, press, through, lift, wind, blows };
}

describe("a TURN blister, turned round the way its channel runs", () => {
  it("loses one blow to a full turn clockwise, its way when none is named", () => {
    const s = stage([turned(3)]);
    s.untilUp();
    s.wind(2, 8);
    expect(s.blows()).toBe(1);
    expect(blisterLeft(CFG, s.body()!)).toBe(2);
  });

  it("counts nothing for half a turn, and shows how far it has come", () => {
    const s = stage([turned(3)]);
    const c = s.untilUp();
    s.press(2, c.id);
    s.through(2, c.id, round(4, 1));
    expect(s.blows()).toBe(0);
    expect(blisterTurnShare(s.body()!)).toBe(0.5);
  });

  it("keeps the turn in progress across a lift, while it is up", () => {
    const s = stage([turned(3)]);
    s.untilUp();
    s.wind(2, 4);
    s.wind(2, 4);
    expect(s.blows()).toBe(1);
  });

  it("counts nothing the wrong way round, either way it is authored", () => {
    for (const [way, sign] of [
      ["cw", -1],
      ["ccw", 1],
    ] as const) {
      const s = stage([turned(3, way)]);
      s.untilUp();
      s.wind(2, 8, sign);
      expect(s.blows()).toBe(0);
      s.wind(2, 8, sign === 1 ? -1 : 1);
      expect(s.blows()).toBe(1);
    }
  });

  it("is knocked out by its count of turns, one hand going round and round", () => {
    const s = stage([turned(2)]);
    const c = s.untilUp();
    s.press(2, c.id);
    s.through(2, c.id, [...round(8, 1), ...round(8, 1).slice(1)]);
    expect(s.body()).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
  });

  it("loses the turn short of whole on a sink, and a hand left on it is dead until it lifts", () => {
    const s = stage([turned(3)]);
    const c = s.untilUp();
    s.press(2, c.id);
    s.through(2, c.id, round(6, 1));
    while (s.body() && blisterIsUp(s.body()!)) s.go(1);
    expect(blisterTurnShare(s.body()!)).toBe(0);
    s.untilUp();
    s.through(2, c.id, round(8, 1));
    expect(s.blows()).toBe(0);
    s.lift(2, c.id);
    s.wind(2, 8);
    expect(s.blows()).toBe(1);
  });

  it("counts nothing from the seat its `by` does not name", () => {
    const s = stage([turned(3)]);
    s.untilUp();
    s.wind(1, 8);
    expect(s.blows()).toBe(0);
  });

  it("winds one turn between two hands on a BOTH blister", () => {
    const s = stage([turned(3, "cw", "both")]);
    const c = s.untilUp();
    s.press(1, c.id);
    s.press(2, c.id);
    s.through(1, c.id, round(4, 1));
    s.through(2, c.id, round(4, 1));
    expect(s.blows()).toBe(1);
  });

  it("replays to the same world", () => {
    const s = stage([turned(1)]);
    const c = s.untilUp();
    const at = s.world.tick;
    const inputs = [
      drag(at, 2, c.id, true, NO_BEARING),
      ...round(8, 1).map((b, i) => drag(at + 1 + i, 2, c.id, true, b)),
    ];
    const replay = record({
      name: "a TURN blister turned out",
      seed: 0,
      queue: [turned(1)],
      ticks: at + TPB,
      inputs,
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(runReplay(replay).creatures.some((x) => x.kind === "blister")).toBe(false);
  });
});
