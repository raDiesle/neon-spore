import { describe, expect, it } from "bun:test";
import { controlSet, hasOwnBody, livingSilhouette } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SpawnEntry,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { creatureHalfAxes } from "../src/creature-axes.js";
import { creatureRadius } from "../src/creature-place.js";
import { computeLayout } from "../src/layout.js";

/**
 * HOW WIDE A BODY IS, AS OPPOSED TO HOW BIG.
 *
 * Every living body in this game is a lobed blob wider than it is tall, and
 * every ring drawn round one used to be a circle at `creatureRadius` — so the
 * tutorial's ring cut through the two ends of a slick and the shape poked out
 * either side of the thing meant to be containing it. The caption has drawn
 * an *ellipse* since a round's slab needed one; what it was given was a
 * circle.
 *
 * The rule the fix has to keep is the one that made it worth writing down at
 * all: the extent comes from `livingScale`, the same call `drawLiving` scales
 * the contour by, so a retuned silhouette moves the body and its ring
 * together. A ring that agreed with the body on the day it was written and
 * derives its own half-width is a ring that will disagree later, silently.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const SET = controlSet("default");

/** One body of the named kind, four rows down the field. */
function fieldWith(kind: SpawnEntry["kind"]): World {
  const world = createWorld(CFG, 4);
  startWave(world, 4, [{ beat: 0, col: 3, kind, color: "red" }], [], null);
  for (let t = 0; t < 4000 && !world.creatures.some((c) => c.row >= 4); t++) step(world, []);
  if (!world.creatures.some((c) => c.row >= 4)) throw new Error(`no ${kind} came down`);
  return world;
}

describe("a body's drawn half-axes", () => {
  it("is wider than it is tall, in the silhouette's own proportion", () => {
    const world = fieldWith("slick");
    const body = world.creatures[0];
    if (!body) throw new Error("no body");
    const axes = creatureHalfAxes(L, world, body, 0.5);
    const shape = livingSilhouette("slick");
    expect(shape.rx).toBeGreaterThan(shape.ry);
    expect(axes.rx).toBeGreaterThan(axes.ry);
    // The proportion is the contour's, not a number invented at the ring.
    expect(axes.rx / axes.ry).toBeCloseTo(shape.rx / shape.ry, 6);
    // And the taller axis is what `creatureRadius` always answered, so every
    // caller that only wanted a scale is untouched.
    expect(Math.max(axes.rx, axes.ry)).toBeCloseTo(creatureRadius(L, world, body, 0.5), 6);
  });

  it("is round for a body drawn from a radius rather than a contour", () => {
    // A rock has no contour — `living-look.ts` gives every meteor tier `null`
    // and `rockRadius` draws it as wide as it is tall — so the ring round one
    // is the circle it always was, and nothing here may stretch it.
    const world = fieldWith("meteor");
    const rock = world.creatures[0];
    if (!rock) throw new Error("no rock");
    expect(hasOwnBody(rock.kind)).toBe(false);
    const axes = creatureHalfAxes(L, world, rock, 0.5);
    expect(axes.rx).toBeCloseTo(axes.ry, 6);
    expect(axes.ry).toBeCloseTo(creatureRadius(L, world, rock, 0.5), 6);
  });

  it("reaches the caption's ring, which is what the fault was about", () => {
    const world = fieldWith("slick");
    const body = world.creatures[0];
    if (!body) throw new Error("no body");
    const at = anchorPoint(L, world, SET, { at: "body" }, 0.5);
    if (!at) throw new Error("no anchor");
    // A ring with no `rx` is drawn as a circle at `r` (`guide-caption.ts`),
    // which is the defect: it has to come back wider than it is tall.
    expect(at.rx).toBeDefined();
    expect(at.rx ?? 0).toBeGreaterThan(at.r);
    const axes = creatureHalfAxes(L, world, body, 0.5);
    // Both stood off by the same margin, so the ring is evenly clear of the
    // shape rather than clear at the top and tight at the ends.
    expect((at.rx ?? 0) - axes.rx).toBeCloseTo(at.r - axes.ry, 6);
  });
});
