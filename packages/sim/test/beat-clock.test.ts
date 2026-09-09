import { describe, expect, it } from "bun:test";
import {
  beatPhase,
  beatPhaseTicks,
  beatStartTick,
  createWorld,
  DEFAULT_CONFIG,
  isBeatTick,
  nearestBeatTick,
  startWave,
  step,
  ticksPerBeat,
} from "../src/index.js";

/**
 * `world.beat` is a label and `world.tick` is a position, and the whole reason
 * `beat-clock.ts` exists is that the two are not the same axis.
 *
 * The last test here is the one worth having. Everything above it is
 * arithmetic; that one runs a real wave with a real opening and asserts the two
 * counters have come apart — which is the fact that made `beat * ticksPerBeat`
 * a wrong answer, and the fact that would quietly stop being true if an opening
 * ever started running `onBeat`.
 */

const cfg = DEFAULT_CONFIG;
const TPB = ticksPerBeat(cfg);

describe("reading the tick line", () => {
  it("a boundary has no phase, and the tick before it has all of one", () => {
    expect(beatPhaseTicks(cfg, 0)).toBe(0);
    expect(beatPhaseTicks(cfg, TPB)).toBe(0);
    expect(beatPhaseTicks(cfg, TPB - 1)).toBe(TPB - 1);
    expect(beatPhase(cfg, TPB / 2)).toBeCloseTo(0.5, 10);
  });

  it("only a boundary is a beat tick", () => {
    expect(isBeatTick(cfg, 0)).toBe(true);
    expect(isBeatTick(cfg, TPB * 3)).toBe(true);
    expect(isBeatTick(cfg, TPB * 3 + 1)).toBe(false);
  });

  it("a beat begins on the boundary at or before the tick", () => {
    expect(beatStartTick(cfg, TPB * 2)).toBe(TPB * 2);
    expect(beatStartTick(cfg, TPB * 2 + 1)).toBe(TPB * 2);
    expect(beatStartTick(cfg, TPB * 3 - 1)).toBe(TPB * 2);
  });

  it("the nearest boundary is the one a press was reaching for, early or late", () => {
    expect(nearestBeatTick(cfg, TPB * 2 + 1)).toBe(TPB * 2);
    expect(nearestBeatTick(cfg, TPB * 3 - 1)).toBe(TPB * 3);
  });
});

describe("a run that has passed an opening", () => {
  it("leaves world.beat behind world.tick / ticksPerBeat", () => {
    // A wave with a guide in front of it: the opening holds the field, the tick
    // counter moves and `onBeat` does not, which is what puts the two counters
    // onto different axes. Started with an empty queue because what is on the
    // field is not the subject — the holding is.
    // `briefings` is off in the headless default, so an opening only stands for
    // a pair — which is the configuration the measurement was taken in.
    const world = createWorld({ ...cfg, briefings: true }, 1, []);
    startWave(world, 0, [], [], null, true, 2);
    for (let i = 0; i < TPB * 4; i++) step(world, []);

    expect(world.tick).toBe(TPB * 4);
    expect(world.beat).toBeLessThan(world.tick / TPB);
    // And the reading that is still right: every beat that did happen landed on
    // a boundary, so the phase of a boundary tick is zero however far behind the
    // label has fallen.
    expect(isBeatTick(cfg, world.tick)).toBe(true);
  });
});
