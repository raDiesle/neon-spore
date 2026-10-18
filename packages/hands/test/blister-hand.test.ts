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
 * (`autopilot-blister.ts`). One blister alone on the field, and the hand has
 * to deal its one blow inside the beats it is up, before it breaks the hull.
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
    ["a SWIPE one, leftward, either seat's", "swipe", "either", "left"],
    ["a TURN one, clockwise", "turn", 2],
    ["a TURN one, anticlockwise", "turn", 1, "ccw"],
    ["a RUB one", "rub", 2],
    ["a COMBO one, player 1's", "combo", 1],
    ["a COMBO one, either seat's", "combo", "either"],
    ["a LEVER one", "lever", 2],
    ["a LEVER one, player 1's", "lever", 1],
  ];
  for (const [name, gesture, by, way] of CASES) {
    it(`knocks out ${name} before it reaches the hull`, () => {
      const out = played(gesture, by, way);
      expect(out).toEqual({ blows: 1, knocked: true, breached: false });
    });
  }

  // BOTH: a hand from each seat, so a half said before the blow on every
  // gesture but the two held together.
  const BOTH: [BlisterGesture, BlisterWay?][] = [
    ["tap"],
    ["hold"],
    ["swipe", "down"],
    ["turn"],
    ["rub"],
    ["combo"],
    ["lever"],
  ];
  for (const [gesture, way] of BOTH) {
    it(`knocks out a BOTH ${gesture.toUpperCase()} one with both seats' hands`, () => {
      const out = played(gesture, "both", way);
      expect(out.knocked).toBe(true);
      expect(out.breached).toBe(false);
    });
  }
});
