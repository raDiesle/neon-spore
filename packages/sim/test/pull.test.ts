import { describe, expect, it } from "bun:test";
import { PULL_TAP_MILLI, type Pull, pullHeard, pullTravelMilli } from "../src/pull.js";

/**
 * **The one generic PULL** (`pull.ts`): the direction a field, counted once
 * the moment the reach is met, a short lift refused and a tap left alone —
 * the PULL LAB's toy rule (`tools/director/src/pull-lab-rule.ts`) on the tick.
 */
const DOWN: Pull = { way: "down", reachMilli: 1000 };

describe("the travel along a pull's way", () => {
  it("counts down for down, up for up, either for either, and a signed one its asked way", () => {
    expect(pullTravelMilli(DOWN, 600)).toBe(600);
    expect(pullTravelMilli(DOWN, -600)).toBe(0);
    expect(pullTravelMilli({ way: "up", reachMilli: 1000 }, -600)).toBe(600);
    expect(pullTravelMilli({ way: "up", reachMilli: 1000 }, 600)).toBe(0);
    expect(pullTravelMilli({ way: "either", reachMilli: 1000 }, -600)).toBe(600);
    expect(pullTravelMilli({ way: "signed", reachMilli: 1000, sign: -1 }, -600)).toBe(600);
    expect(pullTravelMilli({ way: "signed", reachMilli: 1000, sign: -1 }, 600)).toBe(0);
    expect(pullTravelMilli({ way: "signed", reachMilli: 1000 }, 600)).toBe(600);
  });

  it("is cut to the reach", () => {
    expect(pullTravelMilli(DOWN, 4000)).toBe(1000);
    expect(pullTravelMilli({ way: "signed", reachMilli: 1000, sign: -1 }, -4000)).toBe(1000);
  });
});

describe("a hand on a pull", () => {
  it("counts on the move that meets the reach, and only once", () => {
    expect(pullHeard(DOWN, false, true, 999).heard).toBe("held");
    expect(pullHeard(DOWN, false, true, 1000).heard).toBe("counted");
    expect(pullHeard(DOWN, true, true, 1400).heard).toBe("held");
  });

  it("counts a lift that carries the whole reach, if nothing counted it first", () => {
    expect(pullHeard(DOWN, false, false, 1000).heard).toBe("counted");
    expect(pullHeard(DOWN, true, false, 1000).heard).toBe("home");
  });

  it("refuses a lift short of the reach, and leaves a tap alone", () => {
    expect(pullHeard(DOWN, false, false, 999).heard).toBe("short");
    expect(pullHeard(DOWN, false, false, PULL_TAP_MILLI).heard).toBe("short");
    expect(pullHeard(DOWN, false, false, PULL_TAP_MILLI - 1).heard).toBe("home");
    // The wrong way is no way at all.
    expect(pullHeard(DOWN, false, false, -900).heard).toBe("home");
  });

  it("keeps the travel while held and none once let go", () => {
    expect(pullHeard(DOWN, false, true, 700).travelMilli).toBe(700);
    expect(pullHeard(DOWN, false, false, 700).travelMilli).toBe(0);
  });
});
