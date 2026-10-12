import { expect, test } from "bun:test";
import { LAB_TILE } from "../src/pull-lab-shapes.js";
import { strayReach } from "../src/pull-lab-stray.js";

test("the OFF PATH reach is in the shape's own tile", () => {
  expect(strayReach("half")).toBe(LAB_TILE / 2);
  expect(strayReach("half", false, 60)).toBe(30);
  expect(strayReach("half", true, 60)).toBe(60);
  expect(strayReach("free", false, 60)).toBeNull();
});
