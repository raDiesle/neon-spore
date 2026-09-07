import { describe, expect, it } from "bun:test";
import { isMeteorKind } from "@neon-spore/sim";
import { POD_CATEGORY } from "../src/creatures.js";
import { CREATURES, categoryOf } from "../src/index.js";

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
    // The mount is the second, and it is the tether's case exactly: a body
    // installed by something else rather than authored, so it carries no
    // control group of its own and the wheel that brought it already shows
    // the panel. Both are also what keeps them out of the director's palette
    // (`LIVING_BRUSH_KINDS`), which is the visible half of this test.
    // THE CHUTE is the third, by the same door: the body a cracked carom
    // throws out is never authored either, and the `carom` entry that made it
    // already shows both panels — the cannon that has to finish it and the
    // shield that owes the rock beside it.
    //
    // THE BEATBOX and THE BALLOON are the fourth and fifth, and the first two
    // that a wave actually places. Both are here because **neither control
    // reaches them at all** — a box is answered by a thumb on the beat and a
    // balloon by two hands on its own handles, and neither is a `ControlGroup`
    // — so the category is right about them and the three above it are what
    // turned out to be a coincidence: they were also never authored, and three
    // places had come to read this category as if it meant that. `isInstalled`
    // is the fact those three actually wanted (`CreatureDef.installed`) — a
    // box and a balloon are answered by neither control and authored anyway.
    expect(special).toEqual(["tether", "mount", "chute", "beatbox", "balloon"]);
  });
});

describe("POD_CATEGORY", () => {
  it("is its own group, since pods are never a CreatureKind", () => {
    expect(POD_CATEGORY).toBe("suck");
  });
});

describe("the table's keys", () => {
  /**
   * `CREATURES` is a `Record<CreatureKind, CreatureDef>` and every row repeats
   * its own key in `kind`, so the two can disagree — `slick: { kind: "bulb" }`
   * type-checks perfectly. Nothing reads `.kind` off a definition today, which
   * is exactly why a wrong one would sit there until the first thing that did.
   */
  it("names each creature the same way twice", () => {
    for (const key of Object.keys(CREATURES) as (keyof typeof CREATURES)[]) {
      const def = CREATURES[key];
      expect(def.kind, `CREATURES.${key} calls itself ${def.kind}`).toBe(key);
    }
  });
});
