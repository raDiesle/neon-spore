import { beforeAll, describe, expect, it } from "bun:test";
import { control, controlSet } from "@neon-spore/content";
import { createWorld, type Malfunction, startWave } from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { bandLobes, computeLayout } from "../src/layout.js";
import {
  CFG,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

/** The band at a phone's size, which is where these buttons are actually met. */
const layout = (role: (typeof ROLES)[number]) =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/**
 * A wave played under a fault, drawn.
 *
 * There are two pictures here that nothing else in the game draws — a control
 * that is on the panel and answers nobody, and the one lobe that holds the
 * fault off — and both of them are laid over the top of a button rather than
 * instead of it (`malfunction-look.ts`). That is exactly the class of drawing
 * this file exists for: a slice clipped out of a lobe and put back offset, a
 * drip on its own clock, an arc counting a rest down. Every one of those is a
 * value handed to a canvas, and a canvas refuses several of them.
 *
 * The fault runs the beat as well, so these frames are also the only ones in
 * the suite where a shot leaves the muzzle with nobody pressing anything.
 */

beforeAll(installCanvasGlobals);

function faulted(fault: Malfunction) {
  const world = createWorld({ ...CFG }, 3);
  startWave(
    world,
    0,
    [
      { beat: 0, col: 3, kind: "magnet", color: "red" },
      { beat: 2, col: 1, kind: "meteor", color: null },
      { beat: 4, col: 5, kind: "lure", color: "cyan" },
    ],
    [],
    null,
    false,
    0,
    fault,
  );
  return world;
}

describe("a wave played under a malfunction", () => {
  for (const role of ROLES) {
    it(`draws a runaway cannon on ${role}`, () => {
      const world = faulted({ kind: "cannon", color: "alternating" });
      const { ctx } = runFrames(world, role, 60 * 6, {
        // The relief, pressed once and then pressed again while it is resting:
        // the frames between the two are the only ones where the tear stops.
        onTick: (tick, w) => {
          if (tick === 40) w.reliefTick = w.tick;
        },
      });
      expect(ctx.calls).toBeGreaterThan(500);
    });

    it(`draws a shield that arms itself on ${role}`, () => {
      const world = faulted({ kind: "shield" });
      const { ctx } = runFrames(world, role, 60 * 6, {
        onTick: (tick, w) => {
          if (tick === 30) w.shieldCol = 3;
        },
      });
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("gives the broken seat a relief where its buttons were, and leaves the other alone", () => {
    const l = layout("test");
    const set = controlSet("default");
    const cannon: Malfunction = { kind: "cannon", color: "red" };
    const p2 = bandLobes(l, set, 2, cannon).map((b) => b.control.id);
    const p1 = bandLobes(l, set, 1, cannon).map((b) => b.control.id);
    // Player 2's two colours are still drawn — a button that quietly did
    // nothing would be indistinguishable from one that is broken — and the
    // relief stands past the end of the row rather than in a colour's place.
    expect(p2).toEqual(["fireRed", "fireCyan", "reliefFire"]);
    expect(p1).toEqual(["guard", "intake"]);
  });

  it("puts the relief on the other seat for a shield fault", () => {
    const l = layout("test");
    const set = controlSet("default");
    const shield: Malfunction = { kind: "shield" };
    expect(bandLobes(l, set, 1, shield).map((b) => b.control.id)).toEqual([
      "guard",
      "intake",
      "reliefGuard",
    ]);
    expect(bandLobes(l, set, 2, shield).map((b) => b.control.id)).toEqual(["fireRed", "fireCyan"]);
  });

  it("draws nothing extra on a wave with no fault", () => {
    const l = layout("test");
    const set = controlSet("default");
    expect(bandLobes(l, set, 2, null).map((b) => b.control.id)).toEqual(["fireRed", "fireCyan"]);
    expect(control("reliefFire").player).toBe(2);
  });

  it("draws a frame the canvas accepts with a fault standing on the panel", () => {
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize(VIEWPORT);
    const world = faulted({ kind: "cannon", color: "cyan" });
    renderer.draw({
      world,
      beatPhase: 0,
      role: "test",
      time: 1.37,
      dt: 1 / 60,
      events: [],
      running: true,
    });
    expect(ctx.calls).toBeGreaterThan(100);
  });
});
