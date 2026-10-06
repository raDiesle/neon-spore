import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { BOLT, count, frame, posed } from "./flue-harness.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLUE's mirage (`render/src/flue-mirage.ts`): the screen not shown the
 * spore is shown a rainbow fluid in the gullet and spores that are not there
 * — and nothing in it may say where the real one is.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

/** A frame's log with the spore `milli` off the middle on a lit level. */
const at = (role: "p1" | "p2", milli: number) => frame(role, (w) => posed(w, BOLT, milli));
/** The fluid's slugs and the phantoms are radial gradients, a few a frame. */
const slug = "createRadialGradient";

describe("THE FLUE's mirage", () => {
  it("draws the navigator's screen the same wherever the spore is", () => {
    expect(at("p2", -2500)).toBe(at("p2", 2500));
    expect(at("p2", 0)).toBe(at("p2", 2500));
  });

  it("is on the navigator's screen and not the pilot's", () => {
    expect(count(at("p2", 0), slug)).toBeGreaterThan(count(at("p1", 0), slug));
    // The pilot's own picture does follow the spore.
    expect(at("p1", -2500)).not.toBe(at("p1", 2500));
  });

  it("leaves the gullet dark once the flue is spent", () => {
    const spent = frame("p2", (w) =>
      posed(w, null, 0, (s) => {
        s.phase = "spent";
      }),
    );
    expect(count(spent, slug)).toBeLessThan(count(at("p2", 0), slug));
  });
});
