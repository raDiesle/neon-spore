import { describe, expect, it } from "bun:test";
import { isMeteorKind } from "@neon-spore/sim";
import { CREATURES, categoryOf, POD_CATEGORY } from "../src/index.js";

describe("categoryOf", () => {
  it("groups aim-only creatures as cannon", () => {
    expect(categoryOf("slick")).toBe("cannon");
    expect(categoryOf("bulb")).toBe("cannon");
  });

  it("groups every guard-only rock tier as shield", () => {
    for (const kind of Object.keys(CREATURES) as (keyof typeof CREATURES)[]) {
      if (isMeteorKind(kind)) expect(categoryOf(kind)).toBe("shield");
    }
  });

  it("groups the queen, which demands both, as mixed", () => {
    expect(categoryOf("queen")).toBe("mixed");
  });

  it("never returns special today — nothing standard is unanswered by aim or guard", () => {
    for (const kind of Object.keys(CREATURES) as (keyof typeof CREATURES)[]) {
      expect(categoryOf(kind)).not.toBe("special");
    }
  });
});

describe("POD_CATEGORY", () => {
  it("is its own group, since pods are never a CreatureKind", () => {
    expect(POD_CATEGORY).toBe("suck");
  });
});
