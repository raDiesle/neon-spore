import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { throatAimCircle, throatGripSeat, throatPumpCircle } from "../src/throat-grip.js";
import { touchDown } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { field, LAYOUT, opened, target } from "./throat-rig.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE THROAT** (`throat-grip.ts`).
 *
 * What this file asks is the half a simulation cannot: that a press on the
 * ring the picture draws is the press `throat-hand.ts` would accept, that each
 * seat takes hold of its own handle — the navigator the mouth, the pilot the
 * pump — and that a press on the other's is handed through with no hold, for
 * the simulation to refuse. Neither handle is there once the tube everts.
 */

beforeAll(installCanvasGlobals);

describe("the navigator's thumb on the mouth", () => {
  it("takes hold of the mouth, where the mouth is drawn", () => {
    const { world, t } = opened();
    const at = throatAimCircle(LAYOUT.p2, CFG, t);
    expect(target(touchDown(LAYOUT.p2, at.x, at.y, field(world, 2)))).toBe("throatAim");
  });

  it("follows the mouth wherever it was carried", () => {
    const { world, t } = opened();
    t.aimXMilli += 2000;
    t.aimYMilli -= 3000;
    const at = throatAimCircle(LAYOUT.p2, CFG, t);
    expect(target(touchDown(LAYOUT.p2, at.x, at.y, field(world, 2)))).toBe("throatAim");
  });

  it("is the navigator's: the pilot's press is handed through with no hold", () => {
    const { world, t } = opened();
    const at = throatAimCircle(LAYOUT.p1, CFG, t);
    const touch = touchDown(LAYOUT.p1, at.x, at.y, field(world, 1));
    expect(touch?.hold).toBeNull();
    expect(touch?.command).toMatchObject({ target: "throatAim", on: true });
  });
});

describe("the pilot's thumb on the pump", () => {
  it("takes hold of the pump beside the root", () => {
    const { world } = opened();
    const at = throatPumpCircle(LAYOUT.p1, CFG);
    expect(target(touchDown(LAYOUT.p1, at.x, at.y, field(world, 1)))).toBe("throatPump");
  });

  it("is the pilot's: the navigator's press is handed through with no hold", () => {
    const { world } = opened();
    const at = throatPumpCircle(LAYOUT.p2, CFG);
    const touch = touchDown(LAYOUT.p2, at.x, at.y, field(world, 2));
    expect(touch?.hold).toBeNull();
    expect(touch?.command).toMatchObject({ target: "throatPump", on: true });
  });

  it("stands clear of the mouth at home, so one thumb never covers both", () => {
    const { t } = opened();
    const aim = throatAimCircle(LAYOUT.p1, CFG, t);
    const pump = throatPumpCircle(LAYOUT.p1, CFG);
    expect(Math.hypot(aim.x - pump.x, aim.y - pump.y)).toBeGreaterThan(aim.r + pump.r);
  });
});

describe("whose handle a press is on", () => {
  it("names the navigator for the mouth and the pilot for the pump, from either seat", () => {
    const { world, t } = opened();
    for (const seat of [1, 2] as const) {
      const f = field(world, seat);
      const aim = throatAimCircle(LAYOUT.test, CFG, t);
      const pump = throatPumpCircle(LAYOUT.test, CFG);
      expect(throatGripSeat(LAYOUT.test, aim.x, aim.y, f)).toBe(2);
      expect(throatGripSeat(LAYOUT.test, pump.x, pump.y, f)).toBe(1);
    }
  });
});

describe("a miss", () => {
  it("offers neither handle while the tube everts", () => {
    const { world, t } = opened();
    t.phase = "everts";
    const aim = throatAimCircle(LAYOUT.p2, CFG, t);
    const pump = throatPumpCircle(LAYOUT.p1, CFG);
    expect(target(touchDown(LAYOUT.p2, aim.x, aim.y, field(world, 2)))).not.toBe("throatAim");
    expect(target(touchDown(LAYOUT.p1, pump.x, pump.y, field(world, 1)))).not.toBe("throatPump");
    expect(throatGripSeat(LAYOUT.p2, aim.x, aim.y, field(world, 2))).toBeUndefined();
  });

  it("falls through to whatever is beside the handle", () => {
    const { world, t } = opened();
    const at = throatAimCircle(LAYOUT.p2, CFG, t);
    const off = touchDown(LAYOUT.p2, at.x + LAYOUT.p2.tile * 3, at.y, field(world, 2));
    expect(target(off)).not.toBe("throatAim");
  });

  it("says nothing at all on a field with no throat in it", () => {
    const { world, t } = opened();
    const at = throatAimCircle(LAYOUT.p2, CFG, t);
    expect(target(touchDown(LAYOUT.p2, at.x, at.y, field(world, 2, null)))).not.toBe("throatAim");
  });
});
