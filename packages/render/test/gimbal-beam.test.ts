import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { World } from "@neon-spore/sim";
import { GimbalFx } from "../src/gimbal-fx.js";
import type { ViewRole } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import { body, hung, frame as posed, turning } from "./gimbal-frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GIMBAL since the swap and the lock (3 October 2026): each seat is shown
 * the partner's mark, filled when the partner's ring stands on it
 * (`gimbal-partner.ts`), and both rings true throws the light of
 * `gimbal-beam.ts` across the cradle on every screen.
 *
 * `gimbal-frame.test.ts` holds the six poses; this page holds what the swap
 * and the lock added to them, set through the same `gimbal-frame-harness.ts`.
 */

beforeAll(() => {
  installCanvasGlobals();
});

/** The first alignment up, the rings standing at `outer` and `inner`, true bearings. */
function frame(role: ViewRole, outer: number, inner: number): { calls: number; text: string } {
  return posed(role, (w: World) => {
    turning(w, outer, inner);
  });
}

/** The first alignment's true marks, read off the wave rather than written twice. */
function firstMarks(): { outer: number; inner: number } {
  const m = body(hung()).marks[0];
  if (m === undefined) throw new Error("the script has no first alignment");
  return { outer: m.outerMilli, inner: m.innerMilli };
}

describe("THE GIMBAL's partner mark", () => {
  it("fills on the pilot's screen when her ring stands on it", () => {
    const { inner } = firstMarks();
    expect(frame("p1", 100, inner).text).not.toBe(frame("p1", 100, inner + 200).text);
  });

  it("and on hers when his does", () => {
    const { outer } = firstMarks();
    expect(frame("p2", outer, 100).text).not.toBe(frame("p2", outer + 200, 100).text);
  });
});

describe("THE GIMBAL locked", () => {
  it.each(ROLES)("throws its light across the cradle on %s", (role) => {
    const { outer, inner } = firstMarks();
    const on = frame(role, outer, inner);
    const off = frame(role, outer, inner + 200);
    // The cross is two gradient fills, the drum's light a blit and the rims a
    // wider glow: more drawn, not a different picture of the same amount.
    expect(on.calls).toBeGreaterThan(off.calls);
    expect(on.text.split("createLinearGradient").length).toBeGreaterThan(
      off.text.split("createLinearGradient").length,
    );
  });

  it("throws the ring once, on the frame the pair comes true, and forgets it on restart", () => {
    const fx = new GimbalFx();
    fx.see(true);
    expect(fx.locked).toBe(1);
    fx.update(0.1);
    const going = fx.locked;
    expect(going).toBeLessThan(1);
    fx.see(true);
    expect(fx.locked).toBe(going);
    fx.see(false);
    fx.see(true);
    expect(fx.locked).toBe(1);
    fx.clear();
    expect(fx.locked).toBe(0);
    fx.see(true);
    expect(fx.locked).toBe(1);
  });
});
