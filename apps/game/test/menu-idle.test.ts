import { describe, expect, it } from "bun:test";
import { createMenuIdle, menuIdleHz } from "../src/menu-idle.js";

/**
 * The gate that `?menuidle=<hz>` opens, and the two things it must never get
 * wrong: the shipped game paints every frame whatever this file says, and a
 * skipped frame's time is carried into the next painted one rather than thrown
 * away — the renderer's `dt` drives everything that fades, and four skipped
 * frames' worth handed over as one frame's worth would run those at a quarter
 * speed instead of at the same speed in fewer steps.
 */

describe("?menuidle", () => {
  it("is unset by default, and a nonsense value is unset too", () => {
    expect(menuIdleHz("http://localhost:4173/")).toBeNull();
    expect(menuIdleHz("http://localhost:4173/?menuidle=fast")).toBeNull();
    expect(menuIdleHz("http://localhost:4173/?menuidle=-4")).toBeNull();
  });

  it("reads a rate, including none at all", () => {
    expect(menuIdleHz("http://localhost:4173/?menuidle=10")).toBe(10);
    expect(menuIdleHz("http://localhost:4173/?menuidle=0")).toBe(0);
  });
});

describe("the gate", () => {
  it("paints every frame when the flag is unset, menu or no menu", () => {
    const idle = createMenuIdle(null);
    for (let f = 1; f <= 10; f++) expect(idle.due(f * 16.7, true)).not.toBeNull();
  });

  it("paints every frame while the menu is not up", () => {
    const idle = createMenuIdle(10);
    for (let f = 1; f <= 10; f++) expect(idle.due(f * 16.7, false)).not.toBeNull();
  });

  it("thins the frames while the menu is up", () => {
    const idle = createMenuIdle(10);
    idle.due(0, false);
    let painted = 0;
    // One second of 60 Hz frames.
    for (let f = 1; f <= 60; f++) if (idle.due(f * (1000 / 60), true) !== null) painted++;
    expect(painted).toBeLessThanOrEqual(11);
    expect(painted).toBeGreaterThanOrEqual(9);
  });

  it("hands the skipped time to the frame that does paint", () => {
    // Thirty a second: two 60 Hz frames to a painted one, which is inside the
    // 0.05 s cap and so shows the carry rather than the ceiling.
    const idle = createMenuIdle(30);
    idle.due(0, false);
    let dt: number | null = null;
    for (let f = 1; dt === null && f <= 60; f++) dt = idle.due(f * (1000 / 60), true);
    // Two frames' worth, not one.
    expect(dt).toBeGreaterThan(1.5 / 60);
    expect(dt).toBeLessThan(0.05);
  });

  it("never hands over more than the cap, however long the tab was away", () => {
    const idle = createMenuIdle(10);
    idle.due(0, false);
    expect(idle.due(30_000, true)).toBe(0.05);
  });

  it("stops entirely at zero", () => {
    const idle = createMenuIdle(0);
    idle.due(0, false);
    for (let f = 1; f <= 600; f++) expect(idle.due(f * (1000 / 60), true)).toBeNull();
    // And starts again the moment the menu goes away.
    expect(idle.due(601 * (1000 / 60), false)).not.toBeNull();
  });
});
