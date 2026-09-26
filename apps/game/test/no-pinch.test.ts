import { describe, expect, it } from "bun:test";
import { refusePinch } from "../src/no-pinch.js";

/**
 * WebKit's pinch refused (`no-pinch.ts`). What a phone would do with the
 * refusal cannot be run here; what can is that both halves of the gesture are
 * listened for, that the listener cancels them, and that it is not passive —
 * a passive listener's `preventDefault` is silently ignored, which is the one
 * way this goes wrong without an error.
 */
describe("a pinch on the page", () => {
  it("is cancelled at its start and every change, from a listener that is not passive", () => {
    const bound: {
      type: string;
      passive: boolean;
      fn: (e: { preventDefault: () => void }) => void;
    }[] = [];
    refusePinch({ addEventListener: (type, fn, { passive }) => bound.push({ type, passive, fn }) });
    expect(bound.map((b) => b.type)).toEqual(["gesturestart", "gesturechange"]);
    for (const b of bound) {
      expect(b.passive).toBe(false);
      let cancelled = false;
      b.fn({ preventDefault: () => (cancelled = true) });
      expect(cancelled).toBe(true);
    }
  });
});
