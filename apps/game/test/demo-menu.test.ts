import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { demoRows } from "../src/demo-menu.js";

/**
 * A DEMOS row names its wave the way the WAVES page does — `THE LEAD`, never
 * the camelCase key `theLead` the demonstration registry points at it by.
 */
describe("demoRows", () => {
  const names = new Set(WAVES.map((w) => w.name));

  it("labels every row with a wave's name", () => {
    for (const row of demoRows()) expect(names.has(row.waveName)).toBe(true);
  });

  it("reads the first row's wave as the WAVES page prints it", () => {
    const slick = demoRows().find((r) => r.id === "slick");
    expect(slick?.waveName).toBe("FIRST STEP");
  });
});
