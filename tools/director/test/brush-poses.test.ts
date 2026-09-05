import { describe, expect, test } from "bun:test";
import { wornKind } from "@neon-spore/sim";
import { echoes, echoPairWorld } from "../src/brush-poses-echo.js";

/**
 * THE ECHO's brush picture is the one pose that is *about* a division rather
 * than a settled body, and it is the one that can go quiet: `brush-art.ts`
 * catches a pose it cannot build and falls back to the plain contour, so a
 * tuning change that stopped the division arriving inside the budget would
 * leave the palette drawing an outline and nothing would be red about it.
 *
 * So the moment is asserted here, where the canvas is not needed: two bodies,
 * side by side on one row, both drawn as bulbs.
 */
describe("the echo brush pose", () => {
  const world = echoPairWorld();
  const pair = echoes(world);

  test("has come apart into two", () => {
    expect(pair.length).toBe(2);
  });

  test("stands them side by side, on one row", () => {
    const [a, b] = pair;
    if (!a || !b) throw new Error("no pair");
    expect(a.row).toBe(b.row);
    expect(Math.abs(a.col - b.col)).toBe(2);
  });

  test("draws both as bulbs — the authored colour, not a slick fallback", () => {
    for (const c of world.creatures) expect(wornKind(c)).toBe("bulb");
  });
});
