import { describe, expect, test } from "bun:test";
import { BRUSH_GROUPS } from "../src/brush-groups.js";

/**
 * The owner, 18 October 2026: the maw's bodies and the two a hand pulls
 * together under SUCK, THE LID under CONTROLS — and each in one group only.
 */
describe("the palette's groups", () => {
  const groupOf = (brush: string) =>
    BRUSH_GROUPS.filter((g) => (g.brushes as string[]).includes(brush)).map((g) => g.label);

  test("SUCK holds the pods, the maw's bodies, the balloon and the choir", () => {
    for (const brush of ["pod", "husk", "morsel", "seeder", "balloon", "choir"]) {
      expect(groupOf(brush), brush).toEqual(["SUCK"]);
    }
  });

  test("THE LID is under CONTROLS and nowhere else", () => {
    expect(groupOf("lid")).toEqual(["CONTROLS"]);
  });
});
