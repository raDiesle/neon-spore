import { describe, expect, it } from "bun:test";
import { RING_MIN } from "../src/aim-ember.js";
import { aimRound } from "../src/aim-fit.js";
import { lobeOutline } from "../src/gorge-lobe.js";

/**
 * A shot's aim fitted round a part as it is drawn (`aim-fit.ts`): the owner,
 * 9 October 2026, *the crosshair on screen must be around the graphic of the
 * thing to hit - wider is better if unclear*.
 */
describe("a shot's aim fitted round what is drawn", () => {
  it("stands outside every point it is given, at the middle of their box", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 2 },
      { x: 4, y: 12 },
      { x: -3, y: 7 },
    ];
    const aim = aimRound(pts);
    expect([aim.x, aim.y]).toEqual([3.5, 6]);
    for (const p of pts) expect(Math.hypot(p.x - aim.x, p.y - aim.y)).toBeLessThanOrEqual(aim.r);
  });

  it("puts EMBER's ring, at its narrowest, clear of THE GORGE's whole lobe", () => {
    const tile = 40;
    const outline = lobeOutline(tile, 100, 200);
    const aim = aimRound(outline);
    // The lobe stands above its intake, so the ring is centred above it too.
    expect(aim.y).toBeLessThan(200);
    for (const p of outline)
      expect(Math.hypot(p.x - aim.x, p.y - aim.y)).toBeLessThan(aim.r * RING_MIN);
  });
});
