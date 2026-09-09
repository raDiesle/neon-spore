import { beforeAll, describe, expect, it } from "bun:test";
import { FIELD_TRAIL_SCALE, neonHue } from "../src/splash-blob.js";
import { SplashTrail } from "../src/splash-trail.js";
import { installCanvasGlobals, stubCanvas } from "./frame-harness.js";

/**
 * The mouse's ink, through a canvas that refuses what a real one refuses.
 *
 * The trail is not part of a frame — it has a surface of its own over the
 * whole document (`apps/game/src/trail.ts`) — so `frame.test.ts` never reaches
 * it, and without this file nothing at all would draw it. What is worth
 * holding is what went wrong in every other thing that draws: a colour in a
 * notation the canvas will not parse, a coordinate that came out NaN, and a
 * particle system that never empties.
 */

beforeAll(installCanvasGlobals);

function dragged(): SplashTrail {
  const trail = new SplashTrail();
  // A stroke across a phone-shaped stage, then a flick back, then a pause long
  // enough to end the stroke and a second one on a fresh colour.
  for (let i = 0; i < 30; i++) {
    trail.push(40 + i * 9, 200 + Math.sin(i / 3) * 60);
    trail.update(1 / 60);
  }
  trail.push(600, 900);
  trail.update(0.5);
  for (let i = 0; i < 10; i++) {
    trail.push(600 - i * 21, 900 - i * 4);
    trail.update(1 / 60);
  }
  return trail;
}

describe("the mouse trail", () => {
  it("draws a stroke without the canvas refusing a value", () => {
    const { ctx } = stubCanvas();
    const trail = dragged();
    trail.draw(ctx as unknown as CanvasRenderingContext2D);
    expect(ctx.calls).toBeGreaterThan(20);
  });

  it("leaves the composite mode it found", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    c.globalCompositeOperation = "multiply";
    dragged().draw(c);
    // Anything else and the trail would tint the next thing drawn on a surface
    // it does not own. It owns this one, but the rule is the renderer's.
    expect(c.globalCompositeOperation).toBe("multiply");
    expect(c.globalAlpha).toBe(1);
  });

  it("empties, so the host can stop asking for frames", () => {
    const trail = dragged();
    expect(trail.idle).toBe(false);
    for (let i = 0; i < 200; i++) trail.update(1 / 60);
    expect(trail.idle).toBe(true);
  });

  it("holds its ceiling however hard the mouse is thrown", () => {
    const { ctx } = stubCanvas();
    const trail = new SplashTrail();
    // Eight hundred pixels an event, a hundred events, no time passing: the
    // shape of a mouse thrown in circles on a wide monitor.
    for (let i = 0; i < 100; i++) trail.push((i % 2) * 800, i * 3);
    trail.draw(ctx as unknown as CanvasRenderingContext2D);
    // Two fills and two paths a blob, and the cap is 120 of them.
    expect(ctx.tally.get("fill") ?? 0).toBeLessThanOrEqual(240);
  });

  it("lays a scaled trail closer together, so it is still one mass", () => {
    const fills = (scale: number): number => {
      const { ctx } = stubCanvas();
      const trail = new SplashTrail();
      trail.scale = scale;
      trail.push(0, 0);
      trail.push(330, 0);
      trail.draw(ctx as unknown as CanvasRenderingContext2D);
      return ctx.tally.get("fill") ?? 0;
    };
    // The spacing is a length and shrinks with the ink. Left unscaled, a third
    // the size at the same spacing would be beads on a string rather than the
    // one running mass the whole effect is.
    const big = fills(1);
    const small = fills(FIELD_TRAIL_SCALE);
    expect(big).toBeGreaterThan(0);
    expect(small / big).toBeCloseTo(1 / FIELD_TRAIL_SCALE, 0);
  });

  it("raises its ceiling by exactly what it took off the size", () => {
    const { ctx } = stubCanvas();
    const trail = new SplashTrail();
    trail.scale = FIELD_TRAIL_SCALE;
    for (let i = 0; i < 100; i++) trail.push((i % 2) * 800, i * 3);
    trail.draw(ctx as unknown as CanvasRenderingContext2D);
    // More blobs than the full-size cap, and each one a fraction of the area:
    // the small trail is the cheaper of the two to fill, not the dearer.
    const fills = ctx.tally.get("fill") ?? 0;
    expect(fills).toBeGreaterThan(240);
    expect(fills).toBeLessThanOrEqual(2 * Math.round(120 / FIELD_TRAIL_SCALE));
  });

  it("says a hue in the only notation the canvas takes", () => {
    for (let deg = -720; deg <= 720; deg += 7) {
      expect(neonHue(deg, 0.9, 0.5)).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(neonHue(0, 1, 1)).toBe("#ff0000");
    expect(neonHue(120, 1, 1)).toBe("#00ff00");
    expect(neonHue(240, 1, 1)).toBe("#0000ff");
  });
});
