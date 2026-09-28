import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimEvent,
  sinewBoss,
  sinewHeld,
  startWave,
  step,
  type TimedCommand,
  type World,
} from "../src/index.js";

/**
 * **A press on the other seat's handle of THE SINEW is refused, and said**
 * (`sinew-hand.ts`): `sinewRefuse`, carrying the presser's seat and the
 * pressed handle's column, and nothing else moves — which is what the red on
 * that handle is drawn from (`render/sinew-fx.ts`). Only the press: a lift
 * says nothing, and a landed mass has no handle to refuse anyone on. That
 * each seat's own handle takes its hand is `sinew.test.ts`'.
 */

const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: true };

function install(): World {
  const world = createWorld({ ...CFG }, 7);
  startWave(world, 0, [], [], { kind: "sinew" });
  return world;
}

const press = (
  player: 1 | 2,
  target: "sinewLeft" | "sinewRight",
  on = true,
): Omit<TimedCommand, "tick"> => ({
  player,
  command: { kind: "drag", target, on, fromMilli: 0, fromYMilli: 0 },
});

function said(world: World, ...commands: Omit<TimedCommand, "tick">[]): SimEvent[] {
  step(
    world,
    commands.map((c) => ({ ...c, tick: world.tick })),
  );
  return [...world.events];
}

const refusals = (events: SimEvent[]) => events.filter((e) => e.type === "sinewRefuse");

describe("a press on the other seat's handle of THE SINEW", () => {
  it("is refused with the presser's seat, and moves nothing", () => {
    const refused = install();
    const quiet = install();
    const events = said(refused, press(2, "sinewLeft"));
    said(quiet);
    expect(refusals(events)).toEqual([expect.objectContaining({ type: "sinewRefuse", player: 2 })]);
    const s = sinewBoss(refused);
    if (s === null) throw new Error("the wave installed no sinew");
    expect(sinewHeld(s, 1)).toBe(false);
    expect(sinewHeld(s, 2)).toBe(false);
    expect(hashWorld(refused)).toBe(hashWorld(quiet));
  });

  it("says the pressed handle's column, either way round", () => {
    const hers = refusals(said(install(), press(2, "sinewLeft")))[0];
    const his = refusals(said(install(), press(1, "sinewRight")))[0];
    const left = said(install(), press(1, "sinewLeft")).find((e) => e.type === "sinewGrip");
    const right = said(install(), press(2, "sinewRight")).find((e) => e.type === "sinewGrip");
    expect(hers?.col).toBe(left?.col);
    expect(his?.col).toBe(right?.col);
    expect(his).toMatchObject({ player: 1 });
  });

  it("says nothing on a lift, nor on a seat's own press", () => {
    const world = install();
    expect(refusals(said(world, press(2, "sinewLeft", false)))).toEqual([]);
    expect(refusals(said(world, press(1, "sinewLeft"), press(2, "sinewRight")))).toEqual([]);
  });

  it("is not refused once the mass has landed", () => {
    const world = install();
    const s = sinewBoss(world);
    if (s === null) throw new Error("the wave installed no sinew");
    s.outBeat = world.beat;
    expect(refusals(said(world, press(2, "sinewLeft")))).toEqual([]);
  });
});
