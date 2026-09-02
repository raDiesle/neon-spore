import { describe, expect, it } from "bun:test";
import type { CreatureKind } from "@neon-spore/sim";
import { CREATURES } from "../src/creatures.js";
import { hasOwnBody, livingBodyKinds, livingMotion, livingSilhouette } from "../src/living-look.js";
import { HOLD, POISE, SWAY_PUMP, TILT_RIPPLE } from "../src/motions.js";
import { BULB, DART, SLICK, THROB } from "../src/silhouettes.js";

const EVERY_KIND = Object.keys(CREATURES) as CreatureKind[];

/**
 * The table is total by construction — `satisfies Record<CreatureKind, …>` in
 * `living-look.ts` is what actually stops a kind being forgotten, and it does
 * it at build time, which no test can. What is worth asserting here is the
 * half a type cannot see: that the *answers* are still the ones the field
 * draws, and that asking about a body that has none is loud.
 */
describe("the living-look table", () => {
  it("has an answer for every kind in the bestiary", () => {
    for (const kind of EVERY_KIND) {
      expect(() => hasOwnBody(kind), kind).not.toThrow();
    }
  });

  /**
   * The golden set, and it is deliberately spelled out rather than derived.
   *
   * Deriving it would mean re-deriving `drawCreatures`' own routing — which
   * kinds it sends to `drawLiving` — and a second copy of that is the drift
   * this whole change exists to remove. Written out, a kind arriving with the
   * wrong answer has to walk past this list, and the person adding it has to
   * say out loud that their creature is or is not a body of its own.
   */
  it("counts exactly the four bodies the field draws through drawLiving", () => {
    expect(livingBodyKinds()).toEqual(["slick", "bulb", "throb", "dart"]);
  });

  it("pairs each body with the contour and the motion it had before the tables merged", () => {
    expect(livingSilhouette("slick")).toBe(SLICK);
    expect(livingMotion("slick")).toBe(TILT_RIPPLE);
    expect(livingSilhouette("bulb")).toBe(BULB);
    expect(livingMotion("bulb")).toBe(SWAY_PUMP);
    expect(livingSilhouette("throb")).toBe(THROB);
    expect(livingMotion("throb")).toBe(HOLD);
    expect(livingSilhouette("dart")).toBe(DART);
    expect(livingMotion("dart")).toBe(POISE);
  });

  /**
   * The failure this file was written for. Both lookups used to end in a
   * default — SLICK and TILT_RIPPLE — so a kind that never reached them by
   * name was drawn as a slick that swayed like one, on both phones, with
   * nothing anywhere saying so. A pair calling that shape "slick" would have
   * been right about the picture and wrong about the creature.
   */
  it("throws rather than inventing a body for a kind that has none", () => {
    for (const kind of EVERY_KIND.filter((k) => !hasOwnBody(k))) {
      expect(() => livingSilhouette(kind), kind).toThrow(/no body of its own/);
      expect(() => livingMotion(kind), kind).toThrow(/no body of its own/);
    }
  });

  /**
   * The four that are drawn as something else, named here because they are the
   * ones where a row of their own would be a *tell* rather than a drift. A
   * lure is a full-size slick or bulb in every pixel player 1 owns; give it a
   * silhouette and player 1 can pick it out before it goes, which is the whole
   * wave. The clasp, the shell and the veil are the same arrangement with a
   * membrane, plating and weather over the top.
   */
  it("sends the four worn bodies back to wornKind by name", () => {
    for (const kind of ["lure", "clasp", "shell", "veil"] as const) {
      expect(hasOwnBody(kind), kind).toBe(false);
      expect(() => livingSilhouette(kind), kind).toThrow(/wornKind/);
    }
  });
});
