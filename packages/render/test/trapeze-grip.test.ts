import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Command, step } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Hold, touchDown, touchUp } from "../src/touch.js";
import {
  trapezeAlienCircle,
  trapezeLockUnder,
  trapezePushUnder,
  trapezeZoneCircle,
} from "../src/trapeze-grip.js";
import { inZone, trapezeZone } from "../src/trapeze-marks.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { BACK_LEFT, fieldOf, posed, Q, stood } from "./trapeze-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE TRAPEZE's controls (`trapeze-grip.ts`): the two zones take a finger in
 * a swipe level and carry the swipe's run on the lift, and the alien takes
 * the pilot's tap in a lock level. The rule is the simulation's
 * (`sim/test/trapeze*.test.ts`); this file proves the picture hands it a
 * thumb — and, last, that a thumb on the glass pushes the swing.
 */

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

describe("the zones", () => {
  it("are each half of the field under the swing, clear of the hull", () => {
    const l = layout("p1");
    const left = trapezeZone(l, CFG, -1);
    const right = trapezeZone(l, CFG, 1);
    expect(left.x + left.w).toBeCloseTo(right.x, 6);
    expect(left.y + left.h).toBeLessThan(l.hullY);
    expect(left.h).toBeGreaterThan(2 * l.tile);
  });

  it("take either seat's finger in a swipe level, as a press on the zone's side", () => {
    const world = stood();
    const s = posed(world, "push", BACK_LEFT);
    for (const seat of [1, 2] as const) {
      const l = layout(`p${seat}`);
      const at = trapezeZoneCircle(l, CFG, s, -1);
      if (at === null) throw new Error("no left zone in a push level");
      expect(trapezePushUnder(l, at.x, at.y, fieldOf(world, seat))?.command).toEqual({
        kind: "drag",
        target: "trapezePushLeft",
        on: true,
        fromMilli: 0,
      });
    }
  });

  it("take nothing in a shot level", () => {
    const world = stood();
    const s = posed(world, "shoot", BACK_LEFT);
    const l = layout("p1");
    const z = trapezeZone(l, CFG, -1);
    expect(trapezeZoneCircle(l, CFG, s, -1)).toBeNull();
    expect(trapezePushUnder(l, z.x + z.w / 2, z.y + z.h / 2, fieldOf(world, 1))).toBeNull();
  });

  it("carry the swipe's run toward the middle on the lift", () => {
    const world = stood();
    posed(world, "push", BACK_LEFT);
    const l = layout("p1");
    const z = trapezeZone(l, CFG, -1);
    const from = { x: z.x + z.w / 3, y: z.y + z.h / 2 };
    const hold = touchDown(l, from.x, from.y, fieldOf(world, 1))?.hold as Hold;
    const lift = touchUp(l, hold, { x: from.x + l.tile, y: from.y + l.tile })?.command;
    expect(lift).toMatchObject({ target: "trapezePushLeft", on: false, fromMilli: 1000 });
    expect(inZone(z, from.x, from.y)).toBe(true);
  });
});

describe("the alien", () => {
  it("is the pilot's to tap in a lock level, and nobody's otherwise", () => {
    const world = stood();
    const s = posed(world, "lock");
    const l = layout("p1");
    const c = trapezeAlienCircle(l, CFG, s);
    expect(trapezeLockUnder(l, c.x, c.y, fieldOf(world, 1))?.command).toMatchObject({
      target: "trapezeLock",
      on: true,
    });
    expect(trapezeLockUnder(layout("p2"), c.x, c.y, fieldOf(world, 2))).toBeNull();
    posed(world, "shoot");
    expect(trapezeLockUnder(l, c.x, c.y, fieldOf(world, 1))).toBeNull();
  });

  it("follows the swing", () => {
    const world = stood();
    const l = layout("p1");
    const right = trapezeAlienCircle(l, CFG, posed(world, "lock", 0)).x;
    const left = trapezeAlienCircle(l, CFG, posed(world, "lock", 2 * Q)).x;
    expect(right).toBeGreaterThan(left);
  });
});

describe("a thumb on the glass", () => {
  it("pushes the swing higher, swiped toward the middle as it comes back", () => {
    const world = stood();
    const s = posed(world, "push", BACK_LEFT - 1);
    const send = (command: Command) => step(world, [{ tick: world.tick, player: 1, command }]);
    const l = layout("p1");
    const z = trapezeZone(l, CFG, -1);
    const from = { x: z.x + z.w / 3, y: z.y + z.h / 2 };
    const before = s.ampMilli;
    const down = touchDown(l, from.x, from.y, fieldOf(world, 1));
    send(down?.command as Command);
    const lift = touchUp(l, down?.hold as Hold, { x: from.x + l.tile, y: from.y + l.tile });
    send(lift?.command as Command);
    expect(world.events.some((e) => e.type === "trapezePush")).toBe(true);
    expect(s.ampMilli).toBeGreaterThan(before);
  });
});
