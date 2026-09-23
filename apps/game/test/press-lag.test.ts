import { describe, expect, it } from "bun:test";
import { InputBuffer } from "../src/input-buffer.js";
import { LAG_SAMPLES, lagText, PressLag } from "../src/press-lag.js";

/**
 * The wait between a thumb and the field (`press-lag.ts`), driven by hand:
 * every time is handed in, so nothing here needs a browser or a clock.
 */

describe("how long a thumb waits for the field", () => {
  it("measures from the touch to the first frame past the tick it was drained on", () => {
    const lag = new PressLag();
    lag.touch(1_000);
    const at = lag.stamp(1_001);
    expect(at).toBe(1_000);
    lag.drained([at as number], 40);
    // Still showing tick 40: the press has not been stepped.
    lag.painted(40, 0, 1_010);
    expect(lag.figures()).toEqual([]);
    lag.painted(41, 0, 1_030);
    expect(lag.figures()).toEqual([30]);
  });

  it("waits out this device's lockstep delay before a frame counts", () => {
    const lag = new PressLag();
    lag.touch(0);
    lag.drained([lag.stamp(0) as number], 10);
    lag.painted(15, 6, 90);
    expect(lag.figures()).toEqual([]);
    lag.painted(17, 6, 120);
    expect(lag.figures()).toEqual([120]);
  });

  it("gives a touch to one press only, and none to a press long after it", () => {
    const lag = new PressLag();
    lag.touch(0);
    expect(lag.stamp(1)).toBe(0);
    expect(lag.stamp(2)).toBeNull();
    lag.touch(0);
    expect(lag.stamp(1_000)).toBeNull();
  });

  it("keeps the last hundred and says the worst of them", () => {
    const lag = new PressLag();
    for (let i = 0; i < LAG_SAMPLES + 20; i++) lag.drained([0], i);
    lag.painted(1_000, 0, 50);
    expect(lag.figures()).toHaveLength(LAG_SAMPLES);
    expect(lagText([30, 200, 40])).toBe("press → frame  worst 200 ms  median 40 ms  (3)");
    expect(lagText([])).toBe("press → frame: no presses yet");
  });

  it("stamps nothing and changes no command without the flag", () => {
    const buffer = new InputBuffer();
    buffer.push(1, { kind: "fire" } as never);
    expect(buffer.drain(7)).toEqual([{ tick: 7, player: 1, command: { kind: "fire" } as never }]);
    expect(buffer.lag).toBeNull();
  });
});
