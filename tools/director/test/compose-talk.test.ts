import { describe, expect, test } from "bun:test";
import { choosePoints, chooseRamp } from "../src/compose-ramp.js";
import { stepById } from "../src/compose-steps.js";
import { TALK_FALL, TALK_WEIGHT, talkAim, talkCost } from "../src/compose-talk.js";
import { panelCost, thingCost } from "../src/curriculum-cost.js";

/**
 * Talk beside pressure (`docs/spec/wave-curriculum.md` §5.1): a block's
 * talk rises in small steps as its pressure does, and talk only chooses
 * between the draws pressure's ramp allows.
 */

const [r1, r2, r3, r5] = [stepById("R1"), stepById("R2"), stepById("R3"), stepById("R5")];
const at = (pressure: number, talk: number) => ({ pressure, talk });

describe("a step's talk", () => {
  test("aims half a fact above the step before, and R5 a fact below", () => {
    expect(talkAim(r2, 4)).toBe(4.5);
    expect(talkAim(r3, 4, 2)).toBe(5);
    expect(talkAim(r5, 6)).toBe(5);
  });

  test("costs twice as much under its aim as over it, but not on the dip", () => {
    expect(talkCost(r2, 3, 4)).toBe(TALK_WEIGHT * TALK_FALL);
    expect(talkCost(r2, 5, 4)).toBe(TALK_WEIGHT);
    expect(talkCost(r5, 3, 4)).toBe(TALK_WEIGHT);
  });
});

describe("the ramp, chosen with talk", () => {
  const steps = [r1, r2, r3];

  test("of two draws at one pressure, takes the one whose talk rises", () => {
    const reach = [[at(2, 2)], [at(3, 1), at(3, 3)], [at(4, 2), at(4, 3)]];
    expect(choosePoints(steps, reach, 2, undefined, undefined, { start: 2 })).toEqual([
      at(2, 2),
      at(3, 3),
      at(4, 3),
    ]);
  });

  test("starts at the block before's gentlest talk rather than under it", () => {
    const reach = [[at(2, 1), at(2, 4)], [at(3, 4)], [at(4, 4)]];
    const chosen = choosePoints(steps, reach, 2, undefined, undefined, { start: 4 });
    expect(chosen).toEqual([at(2, 4), at(3, 4), at(4, 4)]);
  });

  test("never lets talk take a pressure outside its ramp", () => {
    // The only rising talk sits at a pressure R2 may not reach from 2.
    const reach = [[at(2, 2)], [at(3, 1), at(9, 8)], [at(4, 1)]];
    expect(choosePoints(steps, reach, 2, undefined, undefined, { start: 2 })).toEqual([
      at(2, 2),
      at(3, 1),
      at(4, 1),
    ]);
  });

  test("with no talk asked, is pressure's ramp exactly", () => {
    const reach = [
      [2, 3],
      [3, 5, 9],
      [4, 6],
    ];
    const points = reach.map((r) => r.map((p) => at(p, 7 - p)));
    const chosen = choosePoints(steps, points, 2);
    expect(typeof chosen === "number" ? chosen : chosen.map((p) => p.pressure)).toEqual(
      chooseRamp(steps, reach, 2),
    );
  });
});

describe("what a new thing costs to learn", () => {
  test("a body is its weight and its facts; a fault and a panel are levers", () => {
    // A ghost asks where, which and a hidden thing: four sentences on 1.5.
    expect(thingCost("ghost")).toBe(5.5);
    expect(thingCost("blister")).toBe(2.5);
    expect(thingCost("meteorFastest")).toBe(3);
    // THE FLIP turns every column into a translation.
    expect(thingCost("flipFault")).toBe(5);
    expect(thingCost("limpet")).toBe(3);
    expect(panelCost("default")).toBe(3);
    expect(panelCost("claw")).toBe(4);
  });
});
