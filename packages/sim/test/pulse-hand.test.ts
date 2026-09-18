import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type PulseState,
  pulseHeart,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { PULSE_COUNT_BEATS } from "../src/pulse.js";
import { pulseBraced } from "../src/pulse-hand.js";

/**
 * **THE PULSE's hand on the bar** (`docs/spec/interludes.md`, THE PULSE's
 * *Three bars, three hands*).
 *
 * The round splits nothing in its verbs — both panels carry the same four
 * arrows — so the state it gained is not a seat's, it is the **meter's**: the
 * one object in the game the pair owns together. Under `flutter` either seat
 * may hold it, which takes that seat out of the song and softens what the
 * other's misses cost; under `arrest` one thumb buys nothing and both put
 * something back.
 *
 * The meter is **set** here rather than played down to. Getting a bar from
 * full to under two hundred means missing thirty arrows, and a test that got
 * there by missing them would be a test about the chart.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 13;

/** One stage with four arrows, spread so nothing here is about the timing. */
const STAGES = [
  {
    name: "RIG",
    steps: 32,
    notes: [
      { step: 4, lane: "slick" as const },
      { step: 8, lane: "bulb" as const },
      { step: 12, lane: "meteor" as const },
      { step: 16, lane: "pod" as const },
    ],
  },
];

function open(): World {
  const world = createWorld(CFG, WAVE);
  startWave(world, WAVE, [], [], { kind: "pulse", stages: STAGES });
  for (let i = 0; i < (PULSE_COUNT_BEATS + 2) * TPB; i++) {
    if (pulse(world).phase === "play") break;
    step(world, []);
  }
  return world;
}

function pulse(world: World): PulseState {
  const b = world.boss;
  if (b === null || b.kind !== "pulse") throw new Error("no round running");
  return b;
}

function press(world: World, player: 1 | 2, command: TimedCommand["command"]): void {
  step(world, [{ tick: world.tick, player, command }]);
}

const bar = (on: boolean): TimedCommand["command"] => ({
  kind: "drag",
  target: "pulseMeter",
  on,
  fromMilli: 0,
  fromYMilli: 0,
});

describe("what the bar has become", () => {
  it("is steady, then flutter, then arrest as the meter falls", () => {
    const world = open();
    const s = pulse(world);
    expect(pulseHeart(CFG, s)).toBe("steady");
    s.meter = CFG.pulseFlutterMilli;
    expect(pulseHeart(CFG, s)).toBe("steady");
    s.meter = CFG.pulseFlutterMilli - 1;
    expect(pulseHeart(CFG, s)).toBe("flutter");
    s.meter = CFG.pulseArrestMilli - 1;
    expect(pulseHeart(CFG, s)).toBe("arrest");
  });
});

describe("the brace, under flutter", () => {
  it("does nothing at all while the bar is steady", () => {
    const world = open();
    press(world, 1, bar(true));
    expect(pulse(world).brace1).toBe(false);
  });

  it("is either seat's, which no other gesture in the game is", () => {
    const world = open();
    pulse(world).meter = CFG.pulseFlutterMilli - 1;
    press(world, 1, bar(true));
    press(world, 2, bar(true));
    expect(pulse(world).brace1).toBe(true);
    expect(pulse(world).brace2).toBe(true);
  });

  /** Out of the song both ways: nothing it presses counts. */
  it("stops that seat's presses counting", () => {
    const world = open();
    const s = pulse(world);
    s.meter = CFG.pulseFlutterMilli - 1;
    press(world, 1, bar(true));
    const before = pulse(world).meter;
    press(world, 1, { kind: "pulseStep", lane: "slick" });
    expect(pulse(world).meter).toBe(before);
    expect(pulse(world).combo1).toBe(0);
  });

  it("gives the seat back the moment the thumb comes off", () => {
    const world = open();
    pulse(world).meter = CFG.pulseFlutterMilli - 1;
    press(world, 1, bar(true));
    press(world, 1, bar(false));
    expect(pulseBraced(CFG, pulse(world), 1)).toBe(false);
    const before = pulse(world).meter;
    press(world, 1, { kind: "pulseStep", lane: "slick" });
    expect(pulse(world).meter).not.toBe(before);
  });

  /**
   * And what it buys, which is the whole of the gesture: a seat holding the bar
   * has its own arrows passed over rather than missed, and the other seat's
   * misses are charged at `pulseBracePermille`.
   */
  it("passes the holding seat's arrows over, and softens the other's misses", () => {
    const run = (brace: boolean): number => {
      const world = open();
      const s = pulse(world);
      s.meter = CFG.pulseFlutterMilli - 1;
      if (brace) press(world, 1, bar(true));
      const before = pulse(world).meter;
      // Long enough that every arrow in the stage has come and gone unpressed.
      for (let i = 0; i < 40 * TPB; i++) {
        if (pulse(world).phase !== "play") break;
        step(world, []);
      }
      return before - pulse(world).meter;
    };
    const plain = run(false);
    const braced = run(true);
    expect(braced).toBeGreaterThan(0);
    expect(braced).toBeLessThan(plain);
  });
});

describe("the arrest, under both thumbs", () => {
  it("puts nothing back under one thumb", () => {
    const world = open();
    pulse(world).meter = CFG.pulseArrestMilli - 1;
    press(world, 1, bar(true));
    const before = pulse(world).meter;
    for (let i = 0; i < TPB * 2; i++) step(world, []);
    expect(pulse(world).meter).toBeLessThanOrEqual(before);
  });

  it("climbs a beat at a time while both of them are on it", () => {
    const world = open();
    pulse(world).meter = CFG.pulseArrestMilli - 1;
    press(world, 1, bar(true));
    press(world, 2, bar(true));
    const before = pulse(world).meter;
    for (let i = 0; i < TPB * 2; i++) step(world, []);
    expect(pulse(world).meter).toBeGreaterThan(before);
  });

  /** It buys the stage back out of danger and never fills the bar. */
  it("stops climbing where the hand was offered", () => {
    const world = open();
    pulse(world).meter = CFG.pulseArrestMilli - 1;
    press(world, 1, bar(true));
    press(world, 2, bar(true));
    for (let i = 0; i < TPB * 80; i++) {
      if (pulse(world).phase !== "play") break;
      step(world, []);
    }
    expect(pulse(world).meter).toBeGreaterThan(CFG.pulseArrestMilli);
    expect(pulse(world).meter).toBeLessThanOrEqual(CFG.pulseFlutterMilli);
  });
});

describe("the two thumbs in the fingerprint", () => {
  it("moves the hash, because each is whether that seat is in the song", () => {
    const world = open();
    pulse(world).meter = CFG.pulseFlutterMilli - 1;
    const before = hashWorld(world);
    press(world, 1, bar(true));
    expect(hashWorld(world)).not.toBe(before);
  });
});
