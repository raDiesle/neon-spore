import { describe, expect, it } from "bun:test";
import {
  hashWorld,
  vaneBearingOpen,
  vaneOpen,
  vanePhase,
  vanePinned,
  type World,
} from "../src/index.js";
import { arm, beats, CFG, housing, open, pin, vane } from "./vane-fixture.js";

/**
 * **THE VANE's navigator's haul on the picture**: the seized housing carried
 * off a pinned arm under SEIZE (`docs/spec/bosses.md` §11.5, *Three phases,
 * three gestures*), and both hands in the fingerprint. The pin itself, under
 * VEER, is `vane-pin.test.ts`.
 *
 * Nothing here can hurt anybody. Every miss below is a window lost, which is
 * what the boss that attacks nobody is allowed to cost (§11.5).
 */

describe("the haul, under SEIZE", () => {
  it("leaves a pinned arm shut until the housing comes off it", () => {
    const world = beats(open(1), 1);
    expect(vanePhase(vane(world).pins).name).toBe("SEIZE");
    pin(world);
    expect(vanePinned(world, vane(world))).toBe(true);
    expect(vaneBearingOpen(world, vane(world))).toBe(false);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    expect(vane(world).hauled).toBe(true);
    expect(vaneOpen(world)).toBe(true);
  });

  it("refuses a carry that did not travel far enough", () => {
    const world = beats(open(1), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli - 1) }]);
    expect(vane(world).hauled).toBe(false);
  });

  /** A housing on a moving arm cannot be hauled: the two hands are the phase. */
  it("refuses a haul on an arm nobody is holding", () => {
    const world = beats(open(1), 1);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    expect(vane(world).hauled).toBe(false);
  });

  it("is the navigator's alone", () => {
    const world = beats(open(1), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 1, command: housing(CFG.vaneHaulMilli) }]);
    expect(vane(world).hauled).toBe(false);
  });

  it("comes off with the pin, and has to be made again on the next one", () => {
    const world = beats(open(1), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    beats(world, 1, [{ tick: world.tick, player: 1, command: arm(false) }]);
    expect(vane(world).hauled).toBe(false);
    pin(world);
    expect(vaneBearingOpen(world, vane(world))).toBe(false);
  });
});

describe("the two hands in the fingerprint", () => {
  /**
   * Where the arm is pinned is where every arrival this beat lands, so two
   * devices that disagree about it are two devices putting the same rock in
   * two columns (`vane-hash.ts`).
   */
  it("moves when the arm is pinned, hauled or spent", () => {
    const base = beats(open(1), 1);
    const before = hashWorld(base);
    pin(base);
    const pinned = hashWorld(base);
    expect(pinned).not.toBe(before);
    const at = base.tick;
    beats(base, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    expect(hashWorld(base)).not.toBe(pinned);
  });

  it("plays the same fight twice", () => {
    const play = (): World => {
      const world = beats(open(3), 1);
      pin(world);
      return beats(world, 2);
    };
    expect(hashWorld(play())).toBe(hashWorld(play()));
  });
});
