import { describe, expect, it } from "bun:test";
import { type CreatureKind, METEOR_TIER_KINDS } from "@neon-spore/sim";
import { bodyDraw } from "../src/creature-body.js";

/**
 * The choice of body draw, held as a shape rather than through a picture.
 *
 * The `*-frame.test.ts` files already prove that each of these paths draws what
 * it should; what they cannot say is that the *choice* between them survives an
 * edit. It did not once: `drawCreatures` picked with an `if / else if` chain,
 * adding THE VEER put a plain `if` between two rungs of it, and every kind
 * after the cut fell through to `drawLiving` — a torch asked for a silhouette
 * it has not got. Four frame tests caught it only because those kinds happen to
 * throw. A kind that merely looked wrong would have shipped.
 *
 * So these assertions are about identity: which kinds share a draw and which
 * are separated from it. They hold with no canvas, because nothing here paints.
 */

const rock = bodyDraw("meteor");
const living = bodyDraw("slick");

describe("the body draw a kind gets", () => {
  it("gives every rock tier the same one", () => {
    for (const kind of METEOR_TIER_KINDS) expect(bodyDraw(kind)).toBe(rock);
  });

  it("gives THE VEER the rock draw, because its rider is laid over the top", () => {
    expect(bodyDraw("veer")).toBe(rock);
  });

  it("keeps the torch off it, though `isMeteorKind` calls a torch a rock", () => {
    expect(bodyDraw("torch")).not.toBe(rock);
    expect(bodyDraw("torch")).not.toBe(living);
  });

  it("gives the four bodies with contours of their own a draw each", () => {
    const own: CreatureKind[] = ["torch", "ghost", "wisp", "lid"];
    const paths = new Set(own.map((kind) => bodyDraw(kind)));
    expect(paths.size).toBe(own.length);
    for (const path of paths) {
      expect(path).not.toBe(rock);
      expect(path).not.toBe(living);
    }
  });

  it("falls through to the living draw for everything else", () => {
    for (const kind of ["bulb", "veil", "volley", "carom", "recoil", "chute", "mount", "clasp"]) {
      expect(bodyDraw(kind as CreatureKind)).toBe(living);
    }
  });
});
