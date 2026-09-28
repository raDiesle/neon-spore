import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  NO_BRAKE,
  type SimEvent,
  spoolBoss,
  spoolCol,
  startWave,
  step,
  type TimedCommand,
  type World,
} from "../src/index.js";

/**
 * **The navigator's press on THE SPOOL's brake is refused, and said**
 * (`spool-hand.ts`): `spoolRefuse`, carrying her seat, and nothing else moves
 * — which is what the knob's red verdict is drawn from (`render/spool-fx.ts`).
 * Only the press: a lift of hers says nothing, and a slack casing has no brake
 * to refuse her on. That her hand does nothing at all is `spool.test.ts`'s.
 */

const CFG = { ...DEFAULT_CONFIG };

function install(): World {
  const world = createWorld({ ...CFG }, 7);
  startWave(world, 0, [], [], { kind: "spool" });
  return world;
}

const press = (player: 1 | 2, on = true): Omit<TimedCommand, "tick"> => ({
  player,
  command: { kind: "drag", target: "spoolBrake", on, fromMilli: 0, fromYMilli: 400 },
});

function said(world: World, ...commands: Omit<TimedCommand, "tick">[]): SimEvent[] {
  step(
    world,
    commands.map((c) => ({ ...c, tick: world.tick })),
  );
  return [...world.events];
}

describe("the navigator's press on THE SPOOL's brake", () => {
  it("is refused in the middle, with her seat on it, and moves nothing", () => {
    const refused = install();
    const quiet = install();
    const events = said(refused, press(2));
    said(quiet);
    expect(events).toContainEqual({ type: "spoolRefuse", col: spoolCol(CFG), player: 2 });
    expect(spoolBoss(refused)?.brakeMilli).toBe(NO_BRAKE);
    expect(hashWorld(refused)).toBe(hashWorld(quiet));
  });

  it("says nothing on her lift, nor on the pilot's own press", () => {
    const world = install();
    expect(said(world, press(2, false)).map((e) => e.type)).not.toContain("spoolRefuse");
    const his = said(world, press(1)).map((e) => e.type);
    expect(his).toContain("spoolGrip");
    expect(his).not.toContain("spoolRefuse");
  });

  it("is not refused once the casing is slack, where there is no brake", () => {
    const world = install();
    const s = spoolBoss(world);
    if (s === null) throw new Error("the wave installed no spool");
    s.phase = "slack";
    s.phaseBeat = world.beat;
    expect(said(world, press(2)).map((e) => e.type)).not.toContain("spoolRefuse");
  });
});
