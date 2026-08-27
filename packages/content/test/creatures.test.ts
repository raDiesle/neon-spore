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

  it("groups the tether as special, and nothing else", () => {
    // The category stood empty until THE WARDEN's line: a thing answered by
    // neither cannon nor shield, only by a hand. Anything else arriving in it
    // is a creature that has quietly lost its control groups, which is what
    // this test is really watching for.
    const special = (Object.keys(CREATURES) as (keyof typeof CREATURES)[]).filter(
      (kind) => categoryOf(kind) === "special",
    );
    expect(special).toEqual(["tether"]);
  });
});

describe("POD_CATEGORY", () => {
  it("is its own group, since pods are never a CreatureKind", () => {
    expect(POD_CATEGORY).toBe("suck");
  });
});
