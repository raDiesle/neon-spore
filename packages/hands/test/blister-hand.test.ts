import { describe, expect, it } from "bun:test";
import {
  type BlisterBy,
  type BlisterGesture,
  type BlisterWay,
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { handBlisters } from "../src/autopilot-blister.js";

/**
 * **AUTO knocks out a blister whichever gesture it wants**
 * (`autopilot-blister.ts`). One blister alone on the field, owing more blows
 * than a surfacing has beats, so the hand has to pick it up again after a
 * sink — a dead hand lifted, a stroke left open voided — and finish it before
 * it reaches the hull.
 */

const CFG = DEFAULT_CONFIG;

function played(gesture: BlisterGesture, by: BlisterBy = 2, way?: BlisterWay) {
  const world = createWorld(CFG, 1);
  const entry = {
    beat: 0,
    col: 3,
    kind: "blister" as const,
    color: null,
    row: 2,
    by,
    count: 4,
    gesture,
    ...(way ? { way } : {}),
  };
  startWave(world, 0, [entry], [], null);
  const heard: SimEvent[] = [];
  const stop = 60 * ticksPerBeat(CFG);
  while (world.tick < stop) {
    step(
      world,
      handBlisters(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
    if (heard.some((e) => e.type === "destroy")) break;
  }
  return {
    blows: heard.filter((e) => e.type === "blisterBlow").length,
    knocked: heard.some((e) => e.type === "destroy" && e.kind === "blister"),
    breached: heard.some((e) => e.type === "breach"),
  };
}

describe("AUTO's hand on a blister", () => {
  const CASES: [string, BlisterGesture, BlisterBy, BlisterWay?][] = [
    ["a TAP one", "tap", 2],
    ["a HOLD one, player 1's", "hold", 1],
    ["a SWIPE one, upward", "swipe", 2, "up"],
    ["a SWIPE one, leftward, either seat's", "swipe", "both", "left"],
    ["a TURN one, clockwise", "turn", 2],
    ["a TURN one, anticlockwise", "turn", 1, "ccw"],
    ["a RUB one", "rub", 2],
  ];
  for (const [name, gesture, by, way] of CASES) {
    it(`knocks out ${name} before it reaches the hull`, () => {
      const out = played(gesture, by, way);
      expect(out).toEqual({ blows: 4, knocked: true, breached: false });
    });
  }
});
