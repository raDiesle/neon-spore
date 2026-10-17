import { expect, test } from "bun:test";
import { biomeLines } from "../src/biome-lines.js";

/**
 * **An array of two objects or more breaks however short it is** — Biome's
 * rule, which the cut's count missed on THE GOVERNOR's `marks` and an act
 * landed at 251 lines (17 October 2026).
 */
test("an array of objects breaks one to a line, and the groups round it break", () => {
  const marks = "  marks: [{ seat: 1, markMilli: 250 }, { seat: 2, markMilli: 750 }],";
  expect(biomeLines(marks)).toBe(4);
  expect(biomeLines(`  { ask: "tap", ${marks.trim()} beats: 7 },`)).toBe(8);
});

test("a short array of numbers, or of one object, or of one-field objects, stays on its line", () => {
  expect(biomeLines("  cols: [2, 8],")).toBe(1);
  expect(biomeLines("  marks: [{ seat: 1, markMilli: 250 }],")).toBe(1);
  expect(biomeLines("  marks: [{ seat: 1 }, { seat: 2 }],")).toBe(1);
  expect(biomeLines("  marks: [],")).toBe(1);
});
