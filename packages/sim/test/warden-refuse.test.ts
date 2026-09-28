import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  WARDEN_PHASES,
  type World,
} from "../src/index.js";

/**
 * **A press THE WARDEN's eye does not take is refused, and said**
 * (`warden-hand.ts`): the other seat's thumb on the eye under NARROW or on the
 * hatch under GLARE, and a swipe that lifted short, each push `wardenRefuse`
 * and change nothing — which is what the eye's red verdict is drawn from
 * (`render/warden-fx.ts`). The hands themselves are `warden-hand.test.ts`'s.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const NARROW = WARDEN_PHASES[0]!.above;
const GLARE = WARDEN_PHASES[1]!.above;

function open(plates: number): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "warden", plates });
  for (let t = 0; t < ticksPerBeat(CFG); t++) step(world, []);
  return world;
}

function said(world: World, ...commands: Omit<TimedCommand, "tick">[]): SimEvent[] {
  step(
    world,
    commands.map((c) => ({ ...c, tick: world.tick })),
  );
  return [...world.events];
}

const drag = (
  target: "wardenEye" | "wardenHatch",
  player: 1 | 2,
  on: boolean,
  milli = 0,
): Omit<TimedCommand, "tick"> => ({
  player,
  command: { kind: "drag", target, on, fromMilli: milli, fromYMilli: 0 },
});

const refusals = (events: SimEvent[]) => events.filter((e) => e.type === "wardenRefuse");

describe("THE WARDEN's refusal", () => {
  it("answers the pilot's thumb on the eye under NARROW, on the press alone", () => {
    const world = open(NARROW);
    expect(refusals(said(world, drag("wardenEye", 1, true)))).toEqual([
      { type: "wardenRefuse", col: expect.any(Number), player: 1 },
    ]);
    expect(refusals(said(world, drag("wardenEye", 1, false)))).toHaveLength(0);
    expect(world.boss?.kind === "warden" && world.boss.eyeHeld).toBe(false);
    expect(refusals(said(world, drag("wardenEye", 2, true)))).toHaveLength(0);
  });

  it("answers the navigator's press on the hatch under GLARE, and throws nothing", () => {
    const world = open(GLARE);
    expect(refusals(said(world, drag("wardenHatch", 2, true)))).toHaveLength(1);
    expect(refusals(said(world, drag("wardenHatch", 2, false, CFG.wardenThrowMilli)))).toHaveLength(
      0,
    );
    expect(world.boss?.kind === "warden" && world.boss.throwBeat).toBe(-1);
  });

  it("answers a swipe that lifted short, and not one that travelled", () => {
    const world = open(GLARE);
    said(world, drag("wardenHatch", 1, true));
    const short = said(world, drag("wardenHatch", 1, false, CFG.wardenThrowMilli - 1));
    expect(refusals(short)).toHaveLength(1);
    said(world, drag("wardenHatch", 1, true));
    const thrown = said(world, drag("wardenHatch", 1, false, CFG.wardenThrowMilli));
    expect(refusals(thrown)).toHaveLength(0);
    expect(thrown.some((e) => e.type === "wardenThrow")).toBe(true);
  });

  it("says nothing while the hatch stands open, or when the eye asks for no hand", () => {
    const glare = open(GLARE);
    said(glare, drag("wardenHatch", 1, true));
    said(glare, drag("wardenHatch", 1, false, CFG.wardenThrowMilli));
    expect(refusals(said(glare, drag("wardenHatch", 2, true)))).toHaveLength(0);
    const watch = open(CFG.wardenPlates);
    expect(refusals(said(watch, drag("wardenEye", 1, true)))).toHaveLength(0);
    expect(refusals(said(watch, drag("wardenHatch", 2, true)))).toHaveLength(0);
  });
});
