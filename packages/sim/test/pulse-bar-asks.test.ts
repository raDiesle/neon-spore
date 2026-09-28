import { expect, test } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type PulseState,
  pulseBarAsks,
  startWave,
  type World,
} from "../src/index.js";
import { pulseHandHeard } from "../src/pulse-hand.js";

/**
 * THE PULSE's bar answering a touch the way every mark does: which seat's end
 * is asked (`pulseBarAsks`) — a bar that is not steady, in the count or the
 * play, and that seat's thumb not on it yet. `pulse-hand.test.ts` holds the
 * brace and the arrest themselves.
 */

const CFG = DEFAULT_CONFIG;
const STAGES = [{ name: "RIG", steps: 32, notes: [{ step: 4, lane: "slick" as const }] }];

function open(): { world: World; pulse: PulseState } {
  const world = createWorld(CFG, 13);
  startWave(world, 13, [], [], { kind: "pulse", stages: STAGES });
  if (world.boss?.kind !== "pulse") throw new Error("no round");
  return { world, pulse: world.boss };
}

const press = (on: boolean) =>
  ({ kind: "drag", target: "pulseMeter", on, fromMilli: 0, fromYMilli: 0 }) as const;

test("a steady bar asks nobody", () => {
  const { pulse } = open();
  pulse.meter = CFG.pulseFlutterMilli;
  expect(pulseBarAsks(CFG, pulse, 1)).toBe(false);
  expect(pulseBarAsks(CFG, pulse, 2)).toBe(false);
});

test("a fluttering bar asks both seats, each until its own thumb is down", () => {
  const { world, pulse } = open();
  pulse.meter = CFG.pulseFlutterMilli - 1;
  expect(pulseBarAsks(CFG, pulse, 1)).toBe(true);
  expect(pulseBarAsks(CFG, pulse, 2)).toBe(true);
  pulseHandHeard(world, pulse, 1, press(true));
  expect(pulseBarAsks(CFG, pulse, 1)).toBe(false);
  expect(pulseBarAsks(CFG, pulse, 2)).toBe(true);
  pulseHandHeard(world, pulse, 1, press(false));
  expect(pulseBarAsks(CFG, pulse, 1)).toBe(true);
});

test("an arrested bar asks the seat still off it", () => {
  const { world, pulse } = open();
  pulse.meter = CFG.pulseArrestMilli - 1;
  pulseHandHeard(world, pulse, 2, press(true));
  expect(pulseBarAsks(CFG, pulse, 1)).toBe(true);
  expect(pulseBarAsks(CFG, pulse, 2)).toBe(false);
});

test("nothing is asked once the stage is called", () => {
  const { pulse } = open();
  pulse.meter = 0;
  pulse.phase = "verdict";
  expect(pulseBarAsks(CFG, pulse, 1)).toBe(false);
});
