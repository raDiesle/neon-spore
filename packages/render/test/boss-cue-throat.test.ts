import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { throatAimCircle, throatPumpCircle } from "../src/throat-grip.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { cue, LAYOUT, opened, word } from "./throat-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE THROAT, and the two words it is allowed** (`render/src/boss-cue-read-k.ts`).
 *
 * One of you carries the mouth and the other pumps it open, so there are two
 * gestures and each is asked of the seat that owns it: `PULL` on the mouth for
 * the navigator, `PUMP` on the handle beside the root for the pilot. Each word
 * goes while its gesture runs, and both go once the tube everts. The colour is
 * never said — which colour the body in the circle wants is the sentence the
 * pair has to say to one another.
 */

beforeAll(installCanvasGlobals);

describe("the two hands", () => {
  it("asks the navigator to pull the mouth and the pilot to pump", () => {
    const { world } = opened();
    expect(word(world, "p2")).toBe("PULL");
    expect(word(world, "p1")).toBe("PUMP");
    expect(cue(world, "p2")?.kind).toBe("CARRY");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
  });

  it("gives the test screen a word too", () => {
    const { world } = opened();
    expect(word(world, "test")).not.toBeNull();
  });

  it("stands each word on its own handle", () => {
    const { world, t } = opened();
    const aim = throatAimCircle(LAYOUT.p2, CFG, t);
    const pump = throatPumpCircle(LAYOUT.p1, CFG);
    const pull = cue(world, "p2");
    const press = cue(world, "p1");
    expect(Math.abs((pull?.x ?? -1e9) - aim.x)).toBeLessThan(LAYOUT.p2.tile);
    expect(Math.abs((press?.x ?? -1e9) - pump.x)).toBeLessThan(LAYOUT.p1.tile);
  });
});

describe("a gesture under way", () => {
  it("drops PULL while the mouth is being carried", () => {
    const { world, t } = opened();
    t.aimFromXMilli = t.aimXMilli;
    t.aimFromYMilli = t.aimYMilli;
    expect(word(world, "p2")).toBeNull();
    expect(word(world, "p1")).toBe("PUMP");
  });

  it("drops PUMP while a stroke is running", () => {
    const { world, t } = opened();
    t.pumpDir = 1;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBe("PULL");
  });
});

describe("what is never said", () => {
  it("is silent once the tube turns inside out", () => {
    const { world, t } = opened();
    t.phase = "everts";
    for (const role of ["p1", "p2", "test"] as const) expect(word(world, role)).toBeNull();
  });

  it("never names a colour", () => {
    const { world, t } = opened();
    for (const mode of ["red", "cyan", "shield", "suck"] as const) {
      t.mode = mode;
      for (const role of ["p1", "p2"] as const) {
        expect(word(world, role)).not.toMatch(/RED|CYAN|SHIELD|SUCK/);
      }
    }
  });
});
