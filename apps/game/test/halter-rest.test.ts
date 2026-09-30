import { afterEach, describe, expect, it } from "bun:test";
import { InputBuffer } from "../src/input-buffer.js";
import { bindShake } from "../src/shake.js";

/**
 * **THE HALTER's resting seat sends nothing while it rests** (§11.53): a rest
 * is a count of beats with no command in them, so anything a still phone put
 * on the wire on its own would startle the seam every time. A finger off the
 * glass says nothing (`input.ts` sends only from a pointer event); what is
 * left to prove is the one sensor bound for the life of the page — the shake,
 * which needs a deliberate shove and not a phone held in a hand. THE DAVIT's
 * phone lean was the second until 30 September 2026, when it became a drag.
 */

const g = globalThis as Record<string, unknown>;
const had = { window: g.window };

afterEach(() => {
  g.window = had.window;
});

describe("a resting seat's phone on THE HALTER", () => {
  it("sends no shake while held still, or carried about in a hand", () => {
    let onMotion: ((e: unknown) => void) | null = null;
    g.window = {
      DeviceMotionEvent: {},
      addEventListener: (type: string, f: (e: unknown) => void) => {
        if (type === "devicemotion") onMotion = f;
      },
    };
    const buffer = new InputBuffer();
    bindShake(buffer);
    if (onMotion === null) throw new Error("no motion listener bound");
    const motion: (e: unknown) => void = onMotion;
    // Gravity on one axis, and a hand's wobble of a few m/s² round it.
    for (let i = 0; i < 600; i++) {
      const wobble = Math.sin(i / 7) * 2;
      motion({
        acceleration: null,
        accelerationIncludingGravity: { x: wobble, y: 9.8 - wobble, z: wobble / 2 },
        interval: 16,
      });
    }
    expect(buffer.drain(0)).toEqual([]);
  });
});
